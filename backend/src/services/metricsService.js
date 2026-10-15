const db = require('../db');

async function getProjectMetrics(projectId) {
  const [likesResult, ratingResult] = await Promise.all([
    db.query(
      `SELECT COUNT(*)::int AS valid_likes
       FROM likes
       WHERE is_accidental = false
         AND reverted_at IS NULL
         AND announcement_id IN (
           SELECT id FROM announcements WHERE project_id = $1
         )`,
      [projectId],
    ),
    db.query(
      `SELECT COALESCE(AVG(stars)::numeric(3,2), 0) AS avg_rating
       FROM ratings
       WHERE is_accidental = false
         AND reverted_at IS NULL
         AND announcement_id IN (
           SELECT id FROM announcements WHERE project_id = $1
         )`,
      [projectId],
    ),
  ]);

  return {
    valid_likes: Number(likesResult.rows[0]?.valid_likes || 0),
    avg_rating: Number(ratingResult.rows[0]?.avg_rating || 0),
  };
}

module.exports = {
  getProjectMetrics,
};
