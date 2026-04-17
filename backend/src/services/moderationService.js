const vision = require('@google-cloud/vision');
const Filter = require('bad-words');
const db = require('../db');
const { computeHash } = require('../utils/dhash');
const { hammingDistance } = require('../utils/hammingDistance');

const filter = new Filter();
const VISION_TIMEOUT_MS = Number(process.env.VISION_TIMEOUT_MS || 8000);
const VISION_MONTHLY_QUOTA = Number(process.env.VISION_MONTHLY_QUOTA || 1000);
const VISION_ALERT_PERCENT = Number(process.env.VISION_ALERT_PERCENT || 80);
const HASH_DISTANCE_THRESHOLD = Number(process.env.HASH_DISTANCE_THRESHOLD || 10);

const monthlyVisionUsage = new Map();
let visionClient;

function getVisionClient() {
  if (!visionClient) {
    visionClient = new vision.ImageAnnotatorClient();
  }
  return visionClient;
}

function currentMonthKey() {
  const d = new Date();
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

function incrementVisionUsageCounter() {
  const month = currentMonthKey();
  const value = (monthlyVisionUsage.get(month) || 0) + 1;
  monthlyVisionUsage.set(month, value);
  const alertThreshold = Math.ceil((VISION_MONTHLY_QUOTA * VISION_ALERT_PERCENT) / 100);
  if (value >= alertThreshold) {
    // eslint-disable-next-line no-console
    console.warn(
      `[Vision] Uso mensual en ${value}/${VISION_MONTHLY_QUOTA} (>= ${VISION_ALERT_PERCENT}%). Activando fallback manual.`,
    );
  }
  return value;
}

function visionFallbackActive() {
  const month = currentMonthKey();
  const value = monthlyVisionUsage.get(month) || 0;
  const alertThreshold = Math.ceil((VISION_MONTHLY_QUOTA * VISION_ALERT_PERCENT) / 100);
  return value >= alertThreshold;
}

function normalizeLikelihood(likelihood) {
  return (likelihood || 'UNKNOWN').toUpperCase();
}

function isLikelyUnsafe(likelihood) {
  return ['LIKELY', 'VERY_LIKELY'].includes(normalizeLikelihood(likelihood));
}

async function analyzeImage(imageBuffer) {
  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    return { flagged: true, reason: 'missing_image_buffer' };
  }

  if (process.env.NODE_ENV === 'test' || process.env.VISION_MOCK === 'true') {
    const raw = process.env.VISION_MOCK_RESULT || 'safe';
    if (raw === 'timeout') return { flagged: true, reason: 'vision_api_timeout' };
    if (raw === 'flagged') return { flagged: true, reason: 'vision_api' };
    return { flagged: false, reason: null };
  }

  if (visionFallbackActive()) {
    return { flagged: true, reason: 'vision_api_quota_fallback' };
  }

  incrementVisionUsageCounter();
  const client = getVisionClient();

  try {
    const response = await Promise.race([
      client.safeSearchDetection({ image: { content: imageBuffer } }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('vision_timeout')), VISION_TIMEOUT_MS);
      }),
    ]);

    const safeSearch = response?.[0]?.safeSearchAnnotation || {};
    const unsafe = isLikelyUnsafe(safeSearch.adult)
      || isLikelyUnsafe(safeSearch.violence)
      || isLikelyUnsafe(safeSearch.racy);

    if (!unsafe) return { flagged: false, reason: null };

    if (isLikelyUnsafe(safeSearch.adult)) return { flagged: true, reason: 'vision_api_adult' };
    if (isLikelyUnsafe(safeSearch.violence)) return { flagged: true, reason: 'vision_api_violence' };
    return { flagged: true, reason: 'vision_api_racy' };
  } catch (error) {
    if (error.message === 'vision_timeout') {
      return { flagged: true, reason: 'vision_api_timeout' };
    }
    return { flagged: true, reason: 'vision_api_error' };
  }
}

function filterText(text) {
  const source = String(text || '').trim();
  const flagged = filter.isProfane(source);
  const terms = flagged ? filter.list.filter((term) => source.toLowerCase().includes(term)) : [];
  return { flagged, terms };
}

async function detectDuplicateImage(imageBuffer) {
  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    return {
      flagged: true, reason: 'phash_missing', hash: null, matchId: null,
    };
  }

  const hash = await computeHash(imageBuffer);
  const rows = await db.query('SELECT id, dhash FROM image_hashes');

  const match = rows.rows.find(
    (row) => hammingDistance(hash, row.dhash) <= HASH_DISTANCE_THRESHOLD,
  );
  if (match) {
    return {
      flagged: true, reason: 'phash', hash, matchId: match.id,
    };
  }

  return {
    flagged: false, reason: null, hash, matchId: null,
  };
}

async function moderationPipeline(imageBuffer, title, description, customCategory) {
  const joinedText = [title, description, customCategory].filter(Boolean).join(' ');
  const [visionResult, textResult, hashResult] = await Promise.all([
    analyzeImage(imageBuffer),
    Promise.resolve(filterText(joinedText)),
    detectDuplicateImage(imageBuffer),
  ]);

  const triggers = [];

  if (visionResult.flagged) {
    triggers.push({
      type: 'vision_api',
      detail: visionResult.reason || 'vision_api',
    });
  }

  if (textResult.flagged) {
    triggers.push({
      type: 'bad_words',
      detail: `terms:${(textResult.terms || []).slice(0, 10).join(',')}`,
    });
  }

  if (hashResult.flagged) {
    triggers.push({
      type: 'phash',
      detail: hashResult.matchId ? `match_image_hash_id:${hashResult.matchId}` : hashResult.reason,
    });
  }

  return {
    approved: triggers.length === 0,
    triggers,
    dhash: hashResult.hash,
    visionStatus: visionResult.flagged ? 'flagged' : 'ok',
    raw: {
      visionResult,
      textResult,
      hashResult,
    },
  };
}

module.exports = {
  analyzeImage,
  filterText,
  moderationPipeline,
  incrementVisionUsageCounter,
};
