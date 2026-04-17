const db = require('../db');
const { getProjectMetrics } = require('../services/metricsService');

/** Máximo de proyectos activos por emprendedor (SAD §6.1, RN-03). */
const MAX_ACTIVE_PROJECTS = Number(process.env.MAX_ACTIVE_PROJECTS) || 5;

/**
 * GET /projects — Lista proyectos del emprendedor autenticado (RF-15).
 */
const listProjects = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.description, p.category_id, c.name AS category_name,
              p.status, p.created_at
       FROM projects p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id],
    );
    return res.json({ projects: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

/**
 * POST /projects — Crear proyecto validando límite N=5 (RF-15, RN-03).
 */
const createProject = async (req, res) => {
  const { name, description, category_id: categoryId } = req.body; // eslint-disable-line camelcase
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'El nombre del proyecto es obligatorio' });
  }

  try {
    // Validar límite de proyectos activos
    const countResult = await db.query(
      "SELECT COUNT(*) AS cnt FROM projects WHERE user_id = $1 AND status = 'active'",
      [req.user.id],
    );
    if (Number(countResult.rows[0].cnt) >= MAX_ACTIVE_PROJECTS) {
      return res.status(409).json({
        error: `Has alcanzado el límite de ${MAX_ACTIVE_PROJECTS} proyectos activos`,
      });
    }

    const result = await db.query(
      `INSERT INTO projects (user_id, name, description, category_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, status, created_at`,
      [
        req.user.id,
        name.trim(),
        description || null,
        categoryId || null,
      ],
    );
    return res.status(201).json({
      message: 'Proyecto creado',
      project: result.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al crear proyecto' });
  }
};

/**
 * GET /projects/:id — Detalle del proyecto con anuncios y métricas (RF-23).
 */
const getProject = async (req, res) => {
  try {
    const projResult = await db.query(
      `SELECT p.id, p.name, p.description, p.category_id, c.name AS category_name,
              p.status, p.created_at
       FROM projects p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1 AND p.user_id = $2`,
      [req.params.id, req.user.id],
    );
    if (projResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const announcements = await db.query(
      `SELECT a.id, a.title, a.status, a.expires_at, a.created_at,
              (SELECT COUNT(*) FROM likes WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS likes_count,
              (SELECT COALESCE(AVG(stars), 0) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS avg_rating
       FROM announcements a
       WHERE a.project_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.id],
    );

    const metrics = await getProjectMetrics(req.params.id);

    return res.json({
      project: projResult.rows[0],
      announcements: announcements.rows,
      metrics,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener proyecto' });
  }
};

/**
 * PATCH /projects/:id — Editar nombre, descripción, categoría (RF-16).
 */
const updateProject = async (req, res) => {
  const { name, description, category_id: categoryId } = req.body; // eslint-disable-line camelcase

  try {
    const updateParams = [
      name || null,
      description !== undefined ? description : null,
      categoryId || null,
      req.params.id,
      req.user.id,
    ];

    const result = await db.query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category_id = COALESCE($3, category_id)
       WHERE id = $4 AND user_id = $5
       RETURNING id, name, description, category_id, status`,
      updateParams,
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    return res.json({ message: 'Proyecto actualizado', project: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar proyecto' });
  }
};

/**
 * PATCH /projects/:id/status — Toggle active/suspended (RF-17).
 */
const updateProjectStatus = async (req, res) => {
  const { status } = req.body;
  if (!status || !['active', 'suspended'].includes(status)) {
    return res.status(400).json({ error: "Status debe ser 'active' o 'suspended'" });
  }

  try {
    // Si se reactiva, validar que no se exceda el límite
    if (status === 'active') {
      const countResult = await db.query(
        "SELECT COUNT(*) AS cnt FROM projects WHERE user_id = $1 AND status = 'active'",
        [req.user.id],
      );
      if (Number(countResult.rows[0].cnt) >= MAX_ACTIVE_PROJECTS) {
        return res.status(409).json({
          error: `No puedes reactivar: límite de ${MAX_ACTIVE_PROJECTS} proyectos activos alcanzado`,
        });
      }
    }

    const result = await db.query(
      'UPDATE projects SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name, status',
      [status, req.params.id, req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    return res.json({ message: 'Estado actualizado', project: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: 'Error al cambiar estado' });
  }
};

/**
 * DELETE /projects/:id — Eliminar proyecto (CASCADE borra anuncios) (RF-18).
 */
const deleteProject = async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }
    return res.json({ message: 'Proyecto eliminado' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al eliminar proyecto' });
  }
};

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
};
