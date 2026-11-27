const db = require('../db');
const { getProjectMetrics } = require('../services/metricsService');
const { generateWaLink } = require('../services/whatsappLinkService');
const { uploadToCloudinary, decodeBase64Image } = require('../services/storageService');

/** Máximo de proyectos activos por emprendedor (SAD §6.1, RN-03). */
const MAX_ACTIVE_PROJECTS = Number(
  process.env.MAX_ACTIVE_PROJECTS
  || process.env.MAX_ACTIVE_PROJECTS_PER_USER
  || 5,
);

/**
 * GET /projects — Lista proyectos del emprendedor autenticado (RF-15).
 */
const listProjects = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.id, p.name, p.description, p.category_id, p.logo_url, c.name AS category_name,
              p.status, p.created_at,
              (SELECT COUNT(*) FROM announcements a WHERE a.project_id = p.id)::int AS announcements_count
       FROM projects p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC`,
      [req.user.id],
    );
    res.set('Cache-Control', 'no-store');
    return res.json({ projects: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener proyectos' });
  }
};

/**
 * POST /projects — Crear proyecto validando límite N=5 (RF-15, RN-03).
 */
const createProject = async (req, res) => {
  const {
    name,
    description,
    category_id: categoryId, // eslint-disable-line camelcase
    category,
    logo_base64: logoBase64, // eslint-disable-line camelcase
  } = req.body;
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

    // El frontend envía el nombre de la categoría; resolverlo a id (fallback: null)
    let resolvedCategoryId = categoryId || null;
    if (!resolvedCategoryId && category) {
      const catResult = await db.query(
        'SELECT id FROM categories WHERE name = $1 AND is_active',
        [category],
      );
      resolvedCategoryId = catResult.rows.length > 0 ? catResult.rows[0].id : null;
    }

    // Subir logo si se envió base64
    let logoUrl = null;
    let logoId = null;
    if (logoBase64) {
      try {
        const buffer = decodeBase64Image(logoBase64);
        if (!buffer) {
          return res.status(400).json({ error: 'Formato de imagen inválido para el logotipo' });
        }
        const uploadRes = await uploadToCloudinary(buffer);
        logoUrl = uploadRes.url;
        logoId = uploadRes.public_id;
      } catch (uploadErr) {
        // eslint-disable-next-line no-console
        console.error('Error al subir logo de proyecto a Cloudinary:', uploadErr);
        return res.status(500).json({ error: 'Error al subir el logotipo a Cloudinary' });
      }
    }

    const result = await db.query(
      `INSERT INTO projects (user_id, name, description, category_id, logo_url, logo_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, category_id, logo_url, status, created_at`,
      [
        req.user.id,
        name.trim(),
        description || null,
        resolvedCategoryId,
        logoUrl,
        logoId,
      ],
    );
    return res.status(201).json({
      message: 'Proyecto creado',
      project: {
        ...result.rows[0],
        category_name: category || null,
        announcements_count: 0,
      },
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
      `SELECT p.id, p.name, p.description, p.category_id, p.logo_url, c.name AS category_name,
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
      `SELECT a.id, a.title, a.description, a.status, a.expires_at, a.created_at,
              a.category_id, a.custom_category, a.cloudinary_url AS image_url,
              c.name AS category_name,
              p.name AS project_name, p.id AS project_id, p.logo_url AS project_logo_url,
              (SELECT COUNT(*) FROM likes WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS likes_count,
              (SELECT COALESCE(AVG(stars), 0) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS avg_rating
       FROM announcements a
       JOIN projects p ON p.id = a.project_id
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.project_id = $1
       ORDER BY a.created_at DESC`,
      [req.params.id],
    );

    const metrics = await getProjectMetrics(req.params.id);

    res.set('Cache-Control', 'no-store');
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
 * PATCH /projects/:id — Editar nombre, descripción, categoría, logo (RF-16).
 */
const updateProject = async (req, res) => {
  const {
    name,
    description,
    category_id: categoryId, // eslint-disable-line camelcase
    category,
    logo_base64: logoBase64, // eslint-disable-line camelcase
  } = req.body;

  try {
    let resolvedCategoryId = categoryId || null;
    if (!resolvedCategoryId && category) {
      const catResult = await db.query(
        'SELECT id FROM categories WHERE name = $1 AND is_active',
        [category],
      );
      resolvedCategoryId = catResult.rows.length > 0 ? catResult.rows[0].id : null;
    }

    let newLogoUrl = null;
    let newLogoId = null;
    if (logoBase64) {
      try {
        const buffer = decodeBase64Image(logoBase64);
        if (!buffer) {
          return res.status(400).json({ error: 'Formato de imagen inválido para el logotipo' });
        }
        const uploadRes = await uploadToCloudinary(buffer);
        newLogoUrl = uploadRes.url;
        newLogoId = uploadRes.public_id;
      } catch (uploadErr) {
        // eslint-disable-next-line no-console
        console.error('Error al actualizar logo de proyecto en Cloudinary:', uploadErr);
        return res.status(500).json({ error: 'Error al subir el logotipo a Cloudinary' });
      }
    }

    const updateParams = [
      name || null,
      description !== undefined ? description : null,
      resolvedCategoryId,
      newLogoUrl,
      newLogoId,
      req.params.id,
      req.user.id,
    ];

    const result = await db.query(
      `UPDATE projects SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        category_id = COALESCE($3, category_id),
        logo_url = COALESCE($4, logo_url),
        logo_id = COALESCE($5, logo_id)
       WHERE id = $6 AND user_id = $7
       RETURNING id, name, description, category_id, logo_url, status`,
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

/**
 * GET /projects/metrics — Métricas agregadas de todos los proyectos del emprendedor (RF-24).
 * Usa subqueries separadas para evitar el producto cartesiano del JOIN original.
 */
const getAggregatedMetrics = async (req, res) => {
  try {
    const annResult = await db.query(
      `SELECT COALESCE(SUM(sub.likes_count), 0)::int AS total_likes,
              COALESCE(AVG(NULLIF(sub.avg_rating, 0)), 0)::numeric(3,2) AS avg_rating,
              COUNT(*)::int AS total_announcements
       FROM (
         SELECT a.id,
                (SELECT COUNT(*) FROM likes WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS likes_count,
                (SELECT COALESCE(AVG(stars), 0) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS avg_rating
         FROM announcements a
         JOIN projects p ON p.id = a.project_id
         WHERE p.user_id = $1
       ) sub`,
      [req.user.id],
    );

    const row = annResult.rows[0];
    res.set('Cache-Control', 'no-store');
    return res.json({
      metrics: {
        total_likes: Number(row.total_likes) || 0,
        avg_rating: Number(row.avg_rating) || 0,
        total_announcements: Number(row.total_announcements) || 0,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener métricas' });
  }
};

/**
 * GET /projects/public/:id — Vista pública del proyecto con perfil de autor y anuncios activos.
 */
const getPublicProject = async (req, res) => {
  try {
    const projResult = await db.query(
      `SELECT p.id, p.name, p.description, p.category_id, p.logo_url, c.name AS category_name,
              p.status, p.created_at, p.user_id,
              ep.display_name, ep.bio_short, ep.profile_photo_url,
              ep.instagram_handle, ep.classroom_location,
              u.whatsapp_number
       FROM projects p
       JOIN users u ON u.id = p.user_id
       LEFT JOIN entrepreneur_profiles ep ON ep.user_id = u.id
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1 AND p.status = 'active'`,
      [req.params.id],
    );

    if (projResult.rows.length === 0) {
      return res.status(404).json({ error: 'Proyecto no encontrado' });
    }

    const row = projResult.rows[0];
    let waLink = null;
    if (req.user && row.whatsapp_number) {
      waLink = generateWaLink(row.whatsapp_number);
    }

    const project = {
      id: row.id,
      name: row.name,
      description: row.description,
      category_name: row.category_name,
      logo_url: row.logo_url,
      status: row.status,
      created_at: row.created_at,
    };

    const entrepreneur = {
      id: row.user_id,
      display_name: row.display_name,
      bio_short: row.bio_short,
      profile_photo_url: row.profile_photo_url,
      instagram_handle: row.instagram_handle,
      classroom_location: row.classroom_location,
      wa_link: waLink,
    };

    const announcements = await db.query(
      `SELECT a.id, a.title, a.description, a.status, a.expires_at, a.created_at,
              a.category_id, a.custom_category, a.cloudinary_url AS image_url,
              COALESCE(c.name, a.custom_category) AS category,
              p.name AS project_name, p.id AS project_id, p.logo_url AS project_logo_url,
              (SELECT CAST(COUNT(*) AS INTEGER) FROM likes WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS likes_count,
              (SELECT COALESCE(AVG(stars)::numeric(2,1), 0) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS avg_rating
       FROM announcements a
       JOIN projects p ON p.id = a.project_id
       LEFT JOIN categories c ON c.id = a.category_id
       WHERE a.project_id = $1 AND a.status = 'active'
       ORDER BY a.created_at DESC`,
      [req.params.id],
    );

    res.set('Cache-Control', 'no-store');
    return res.json({
      project,
      entrepreneur,
      announcements: announcements.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener proyecto público' });
  }
};

module.exports = {
  listProjects,
  createProject,
  getProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
  getAggregatedMetrics,
  getPublicProject,
};
