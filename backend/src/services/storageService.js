const { v2: cloudinary } = require('cloudinary');

let configured = false;

function ensureCloudinaryConfig() {
  if (configured) return;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }
  configured = true;
}

function useMockCloudinary() {
  return process.env.NODE_ENV === 'test' || process.env.CLOUDINARY_MOCK === 'true';
}

function getMimeType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  const isPng = buffer.length >= 4
    && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  if (isPng) {
    return 'image/png';
  }
  const isWebp = buffer.length >= 4
    && buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46;
  if (isWebp) {
    return 'image/webp';
  }
  return 'image/png';
}

function decodeBase64Image(base64String) {
  if (!base64String || typeof base64String !== 'string') return null;
  const clean = base64String.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();
  if (!clean) return null;
  return Buffer.from(clean, 'base64');
}

async function uploadToCloudinary(imageBuffer) {
  ensureCloudinaryConfig();
  if (!Buffer.isBuffer(imageBuffer) || imageBuffer.length === 0) {
    throw new Error('imageBuffer inválido para upload');
  }

  if (useMockCloudinary()) {
    const mockId = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    return {
      url: `https://mock-cloudinary.local/${mockId}.png`,
      public_id: `mural_lince/${mockId}`,
    };
  }

  const mime = getMimeType(imageBuffer);
  const base64Image = imageBuffer.toString('base64');
  const result = await cloudinary.uploader.upload(
    `data:${mime};base64,${base64Image}`,
    {
      folder: process.env.CLOUDINARY_FOLDER || 'mural_lince',
      resource_type: 'image',
      overwrite: false,
    },
  );

  return {
    url: result.secure_url,
    public_id: result.public_id,
  };
}

async function deleteFromCloudinary(publicId) {
  ensureCloudinaryConfig();
  if (!publicId) return;

  if (useMockCloudinary()) return;

  await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',
    invalidate: true,
  });
}

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary,
  decodeBase64Image,
};
