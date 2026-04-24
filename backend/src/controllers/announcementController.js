const db = require('../db');
const { createNotification } = require('../services/notificationService');
const { moderationPipeline } = require('../services/moderationService');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/storageService');

/** Máximo de anuncios activos por proyecto (SAD §6.2, RN-04). */
const MAX_ACTIVE_ANNOUNCEMENTS = Number(
  process.env.MAX_ACTIVE_ANNOUNCEMENTS
  || process.env.MAX_ACTIVE_ANNOUNCEMENTS_PER_PROJECT
  || 3,
);

/**
 * POST /announcements — Crear anuncio (COMP-04, RF-19).
 * Sprint 10: pipeline de moderación completo + upload en Cloudinary.
 */
const createAnnouncement = async (req, res) => {
  const {
    project_id: projectId, // eslint-disable-line camelcase
    title,
    description,
    category_id: categoryId, // eslint-disable-line camelcase
    custom_category: customCategory, // eslint-disable-line camelcase
    expires_at: expiresAt, // eslint-disable-line camelcase
  } = req.body;

  if (!projectId || !title || !title.trim()) {
    return res.status(400).json({ error: 'project_id y title son obligatorios' });
  }
  
  const imageBuffer = req.file ? req.file.buffer : null;
  if (!imageBuffer) {
    return res.status(400).json({ error: 'La imagen es obligatoria' });
  }
  if (!expiresAt) {
    return res.status(400).json({ error: 'expires_at es obligatorio' });
  }

  try {
    // Verificar que el proyecto pertenece al usuario
    const projCheck = await db.query(
      'SELECT id FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, req.user.id],
    );
    if (projCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado o no te pertenece' });
    }

    // Validar límite de anuncios activos por proyecto (RN-04)
    const countResult = await db.query(
      "SELECT COUNT(*) AS cnt FROM announcements WHERE project_id = $1 AND status IN ('active', 'pending_review')",
      [projectId],
    );
    if (Number(countResult.rows[0].cnt) >= MAX_ACTIVE_ANNOUNCEMENTS) {
      return res.status(409).json({
        error: `Límite de ${MAX_ACTIVE_ANNOUNCEMENTS} anuncios activos por proyecto alcanzado`,
      });
    }

    const moderation = await moderationPipeline(
      imageBuffer,
      title.trim(),
      description || '',
      customCategory || '',
    );
    const uploaded = await uploadToCloudinary(imageBuffer);
    const nextStatus = moderation.approved ? 'active' : 'pending_review';

    const client = await db.getPool().connect();
    try {
      await client.query('BEGIN');

      const result = await client.query(
        `INSERT INTO announcements
          (project_id, title, description, category_id, custom_category, cloudinary_url, cloudinary_id, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, title, status, expires_at, created_at`,
        [
          projectId,
          title.trim(),
          description || null,
          categoryId || null,
          customCategory || null,
          uploaded.url,
          uploaded.public_id,
          nextStatus,
          expiresAt,
        ],
      );

      const announcement = result.rows[0];
      if (moderation.dhash) {
        await client.query(
          'INSERT INTO image_hashes (announcement_id, dhash) VALUES ($1, $2)',
          [announcement.id, moderation.dhash],
        );
      }

      if (!moderation.approved) {
        await Promise.all(
          moderation.triggers.map((trigger) => client.query(
            `INSERT INTO moderation_queue (announcement_id, trigger_type, trigger_detail)
             VALUES ($1, $2, $3)`,
            [announcement.id, trigger.type, trigger.detail],
          )),
        );
        await createNotification(req.user.id, 'pending', `Tu anuncio "${title.trim()}" quedó en revisión`);
      } else {
        await createNotification(req.user.id, 'approved', `Tu anuncio "${title.trim()}" ha sido publicado`);
      }

      await client.query('COMMIT');
      return res.status(moderation.approved ? 201 : 202).json({
        message: moderation.approved ? 'Anuncio creado' : 'Anuncio en revisión',
        announcement,
        moderation: {
          approved: moderation.approved,
          triggers: moderation.triggers,
        },
      });
    } catch (error) {
      await client.query('ROLLBACK');
      await deleteFromCloudinary(uploaded.public_id);
      return res.status(500).json({ error: 'Error al crear anuncio' });
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear anuncio' });
  }
};

/**
 * PATCH /announcements/:id — Editar anuncio (RF-20).
 */
const updateAnnouncement = async (req, res) => {
  const {
    title,
    description,
    category_id: categoryId, // eslint-disable-line camelcase
    custom_category: customCategory, // eslint-disable-line camelcase
    expires_at: expiresAt, // eslint-disable-line camelcase
  } = req.body;

  try {
    // Verificar propiedad del anuncio
    const check = await db.query(
      `SELECT a.id FROM announcements a
       JOIN projects p ON p.id = a.project_id
       WHERE a.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    const updateParams = [
      title || null,
      description !== undefined ? description : null,
      categoryId || null,
      customCategory || null,
      expiresAt || null,
      req.params.id,
    ];

    const result = await db.query(
      `UPDATE announcements SET
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        category_id = COALESCE($3, category_id),
        custom_category = COALESCE($4, custom_category),
        expires_at = COALESCE($5, expires_at)
       WHERE id = $6
       RETURNING id, title, description, status, expires_at`,
      updateParams,
    );

    return res.json({ message: 'Anuncio actualizado', announcement: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar anuncio' });
  }
};

/**
 * DELETE /announcements/:id — Eliminar anuncio (RF-21).
 * Elimina primero en Cloudinary y luego el registro.
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const check = await db.query(
      `SELECT a.id, a.cloudinary_id FROM announcements a
       JOIN projects p ON p.id = a.project_id
       WHERE a.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

    await deleteFromCloudinary(check.rows[0].cloudinary_id);
    await db.query('DELETE FROM announcements WHERE id = $1', [req.params.id]);
    return res.json({ message: 'Anuncio eliminado' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar anuncio' });
  }
};

module.exports = {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
