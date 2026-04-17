const db = require('../db');
const { createNotification } = require('../services/notificationService');

/** Máximo de anuncios activos por proyecto (SAD §6.2, RN-04). */
const MAX_ACTIVE_ANNOUNCEMENTS = Number(process.env.MAX_ACTIVE_ANNOUNCEMENTS) || 3;

/**
 * POST /announcements — Crear anuncio (COMP-04, RF-19).
 * Sprint 9 placeholder: status='active' (sin moderación IA, se integra en Sprint 10).
 */
const createAnnouncement = async (req, res) => {
  const {
    project_id: projectId, // eslint-disable-line camelcase
    title,
    description,
    category_id: categoryId, // eslint-disable-line camelcase
    custom_category: customCategory, // eslint-disable-line camelcase
    cloudinary_url: cloudinaryUrl, // eslint-disable-line camelcase
    cloudinary_id: cloudinaryId, // eslint-disable-line camelcase
    expires_at: expiresAt, // eslint-disable-line camelcase
  } = req.body;

  if (!projectId || !title || !title.trim()) {
    return res.status(400).json({ error: 'project_id y title son obligatorios' });
  }
  if (!cloudinaryUrl || !cloudinaryId) {
    return res.status(400).json({ error: 'cloudinary_url y cloudinary_id son obligatorios' });
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

    const createParams = [
      projectId,
      title.trim(),
      description || null,
      categoryId || null,
      customCategory || null,
      cloudinaryUrl,
      cloudinaryId,
      expiresAt,
    ];

    const result = await db.query(
      `INSERT INTO announcements (project_id, title, description, category_id, custom_category, cloudinary_url, cloudinary_id, status, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'active', $8)
       RETURNING id, title, status, expires_at, created_at`,
      createParams,
    );

    // Notificación placeholder de aprobación (RF-25)
    await createNotification(req.user.id, 'approved', `Tu anuncio "${title.trim()}" ha sido publicado`);

    return res.status(201).json({ message: 'Anuncio creado', announcement: result.rows[0] });
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
 * Sin eliminación de Cloudinary por ahora (Sprint 10).
 */
const deleteAnnouncement = async (req, res) => {
  try {
    const check = await db.query(
      `SELECT a.id FROM announcements a
       JOIN projects p ON p.id = a.project_id
       WHERE a.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Anuncio no encontrado' });
    }

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
