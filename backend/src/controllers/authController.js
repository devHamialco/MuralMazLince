const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Filter = require('bad-words');
const { isValidMatricula } = require('../utils/checksum');
const { uploadToCloudinary, decodeBase64Image } = require('../services/storageService');
const { generateWaLink } = require('../services/whatsappLinkService');
const db = require('../db');

const filter = new Filter();

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
});

const registerStudent = async (req, res) => {
  const { matricula } = req.body;
  if (!matricula || !isValidMatricula(matricula)) {
    return res.status(400).json({ error: 'Matrícula inválida' });
  }

  try {
    const result = await db.query(
      'INSERT INTO users (matricula, role, privacy_accepted) VALUES ($1, \'visitor_registered\', true) RETURNING id',
      [matricula],
    );
    return res.status(201).json({ message: 'Estudiante registrado', userId: result.rows[0].id });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'La matrícula ya está registrada' });
    }
    return res.status(500).json({ error: 'Error del servidor al registrar' });
  }
};

const registerEntrepreneur = async (req, res) => {
  const {
    matricula,
    password,
    whatsapp_number: whatsappNumber,
    instagram_handle: instagramHandle,
    bio_short: bioShort,
    display_name: displayName,
    privacy_accepted: privacyAccepted,
  } = req.body;

  if (privacyAccepted !== true) {
    return res.status(400).json({ error: 'Debe aceptar el aviso de privacidad explícitamente' });
  }
  if (!matricula || !isValidMatricula(matricula)) {
    return res.status(400).json({ error: 'Matrícula inválida' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }

  // Validar y normalizar WhatsApp si fue provisto
  const digitsOnly = String(whatsappNumber || '').replace(/\D/g, '');
  let fullWhatsapp = null;
  if (digitsOnly.length > 0) {
    let normalizedNumber = '';
    if (digitsOnly.length === 10) {
      normalizedNumber = `52${digitsOnly}`;
    } else if (digitsOnly.length === 12 && digitsOnly.startsWith('52')) {
      normalizedNumber = digitsOnly;
    } else {
      return res.status(400).json({ error: 'Número de WhatsApp inválido. Ingresa los 10 dígitos de tu número.' });
    }
    fullWhatsapp = `+${normalizedNumber}`;
  }

  // Normalizar Instagram si fue provisto
  let cleanInstagram = null;
  if (instagramHandle && typeof instagramHandle === 'string') {
    cleanInstagram = instagramHandle.trim().replace(/^@+/, '').slice(0, 60);
    if (cleanInstagram.length === 0) {
      cleanInstagram = null;
    }
  }

  // Requisito mínimo: al menos un medio de contacto (WhatsApp o Instagram)
  if (!fullWhatsapp && !cleanInstagram) {
    return res.status(400).json({
      error: 'Debes proporcionar al menos un medio de contacto (WhatsApp o Instagram)',
    });
  }

  if (!displayName || displayName.trim() === '') {
    return res.status(400).json({ error: 'El nombre a mostrar es obligatorio' });
  }
  if (filter.isProfane(displayName)) {
    return res.status(400).json({ error: 'El nombre a mostrar no es válido (contiene expresiones ofensivas)' });
  }

  const cleanBio = bioShort && typeof bioShort === 'string' ? bioShort.trim().slice(0, 200) : null;

  let client = null;
  try {
    client = await db.getPool().connect();
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM users WHERE matricula = $1', [matricula]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'La matrícula ya está registrada' });
    }

    const hashedPw = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      `INSERT INTO users (matricula, role, password_hash, whatsapp_number, privacy_accepted)
       VALUES ($1, 'entrepreneur', $2, $3, true) RETURNING id`,
      [matricula, hashedPw, fullWhatsapp],
    );

    const userId = userResult.rows[0].id;

    await client.query(
      `INSERT INTO entrepreneur_profiles (user_id, display_name, bio_short, instagram_handle)
       VALUES ($1, $2, $3, $4)`,
      [userId, displayName.trim(), cleanBio, cleanInstagram],
    );

    await client.query('COMMIT');

    const payload = {
      id: userId,
      matricula,
      role: 'entrepreneur',
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Configuración incompleta del servidor (JWT_SECRET)' });
    }
    const hours = Number(process.env.JWT_EXPIRATION_HOURS) || 8;
    const token = jwt.sign(payload, secret, { expiresIn: `${hours}h` });

    res.cookie('token', token, {
      ...getCookieOptions(),
      maxAge: hours * 3600000,
    });

    const userResponse = {
      id: userId,
      matricula,
      role: 'entrepreneur',
      display_name: displayName.trim(),
      bio_short: cleanBio,
      instagram_handle: cleanInstagram,
      has_whatsapp: Boolean(fullWhatsapp),
    };
    return res.status(201).json({ message: 'Emprendedor registrado', userId, user: userResponse });
  } catch (error) {
    if (client) {
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        // El ROLLBACK no debe poder tumbar el handler: se loguea y se continúa
        // eslint-disable-next-line no-console
        console.error('Rollback Error:', rollbackError);
      }
    }
    if (error.code === '23505') {
      return res.status(409).json({ error: 'La matrícula ya está registrada' });
    }
    // eslint-disable-next-line no-console
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor en transacción' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const login = async (req, res) => {
  const { matricula, password } = req.body;
  if (!matricula) return res.status(400).json({ error: 'Matrícula requerida' });

  // Validar formato antes de consultar la DB (previene queries innecesarias)
  if (!isValidMatricula(matricula)) {
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  }

  try {
    const result = await db.query(`
      SELECT u.*, ep.display_name, ep.bio_short, ep.profile_photo_url, ep.instagram_handle, ep.classroom_location
      FROM users u
      LEFT JOIN entrepreneur_profiles ep ON u.id = ep.user_id
      WHERE u.matricula = $1
    `, [matricula]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ error: 'Cuenta suspendida', is_suspended: true });
    }

    if (user.role !== 'visitor_registered') {
      if (!password) {
        return res.status(401).json({ error: 'Se requiere contraseña para la cuenta', requirePassword: true });
      }
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }
    }

    const payload = {
      id: user.id,
      matricula: user.matricula,
      role: user.role,
      // whatsapp_number excluido explícitamente del payload JWT (OBJ-07)
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Configuración incompleta del servidor (JWT_SECRET)' });
    }
    const hours = Number(process.env.JWT_EXPIRATION_HOURS) || 8;
    const token = jwt.sign(payload, secret, { expiresIn: `${hours}h` });

    res.cookie('token', token, {
      ...getCookieOptions(),
      maxAge: hours * 3600000,
    });

    const userResponse = {
      id: user.id,
      matricula: user.matricula,
      role: user.role,
      display_name: user.display_name,
      profile_photo_url: user.profile_photo_url,
      bio_short: user.bio_short,
      instagram_handle: user.instagram_handle,
      classroom_location: user.classroom_location,
    };
    return res.json({ message: 'Login exitoso', role: user.role, user: userResponse });
  } catch (err) {
    return res.status(500).json({ error: 'Error de login' });
  }
};

/**
 * Verifica proactivamente si la matrícula requiere contraseña (sin autenticar).
 * El frontend lo invoca al completar la matrícula para mostrar el campo de
 * contraseña antes del único envío de login. Nunca emite JWT ni cookie de
 * sesión, y responde únicamente el booleano `requiresPassword` (no el rol).
 *
 * @param {import('express').Request} req  - Body JSON: `{ matricula: string }`.
 * @param {import('express').Response} res - `400` si falta matrícula;
 *        `200 { requiresPassword: boolean }` en cualquier otro caso.
 * @returns {Promise<import('express').Response>}
 */
const checkLogin = async (req, res) => {
  const { matricula } = req.body;
  if (!matricula) return res.status(400).json({ error: 'Matrícula requerida' });

  // Formato inválido → mismo resultado que "no existe": no se filtra información.
  if (!isValidMatricula(matricula)) {
    return res.json({ requiresPassword: false });
  }

  try {
    const result = await db.query(
      'SELECT role, is_suspended FROM users WHERE matricula = $1',
      [matricula],
    );
    const user = result.rows[0];

    if (!user) {
      return res.json({ requiresPassword: false });
    }

    // Cuenta suspendida → `false` (indistinguible de "no existe"): reportar
    // `true` revelaría que la cuenta existe y es de tipo con contraseña. El
    // motivo real (403 "Cuenta suspendida") lo comunica el login real en submit.
    if (user.is_suspended) {
      return res.json({ requiresPassword: false });
    }

    return res.json({ requiresPassword: user.role !== 'visitor_registered' });
  } catch (err) {
    return res.status(500).json({ error: 'Error al verificar la matrícula' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token', getCookieOptions());
  res.set('Cache-Control', 'no-store');
  return res.status(200).json({ message: 'Sesión finalizada exitosamente' });
};

const claimMatricula = async (req, res) => {
  const {
    disputed_matricula: disputedMatricula,
    claimant_whatsapp: claimantWhatsapp,
  } = req.body;
  if (!disputedMatricula || !claimantWhatsapp) {
    return res.status(400).json({ error: 'La matrícula a disputar y el whatsapp de contacto son requeridos' });
  }

  try {
    const result = await db.query(
      'INSERT INTO claim_tickets (disputed_matricula, claimant_whatsapp) VALUES ($1, $2) RETURNING id',
      [disputedMatricula, claimantWhatsapp],
    );
    return res.status(201).json({ message: 'Reclamo ingresado para su revisión', ticketId: result.rows[0].id });
  } catch (err) {
    return res.status(500).json({ error: 'Error del servidor al ingresar reclamo' });
  }
};

const getPrivacy = (req, res) => {
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Aviso de Privacidad - Mural Maz Lince</title>
  <style>
    body { font-family: sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 2rem; color: #333; }
    h1 { color: #961749; }
    h2 { color: #b91c60; margin-top: 2rem; }
  </style>
</head>
<body>
  <h1>Aviso de Privacidad - Mural Maz Lince</h1>
  <p><strong>Última actualización:</strong> Abril 2026</p>

  <h2>1. Identidad del Responsable</h2>
  <p>La Universidad Autónoma de Occidente, Unidad Regional Mazatlán, Sinaloa, México, a través del proyecto estudiantil Mural Maz Lince, es la responsable del uso y protección de sus datos personales, en estricto apego a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>

  <h2>2. Datos Recabados</h2>
  <p>Para la prestación de nuestros servicios de plataforma de tablero de anuncios universitario digital, podemos recabar los siguientes datos personales: matrícula estudiantil, número de WhatsApp y nombre público (display name). Su contraseña es procesada de manera cifrada con bcrypt y nunca se almacena en texto plano.</p>

  <h2>3. Finalidad del Tratamiento</h2>
  <p>Los datos recabados serán utilizados para las siguientes finalidades primarias:</p>
  <ul>
    <li>Identificación como estudiante activo de la institución.</li>
    <li>Proveer un contacto protegido con los miembros de la red estudiantil a través de hipervínculos wa.me (el número no se expone como texto plano en ninguna capa del sistema).</li>
    <li>Atender quejas, reportes y aplicar medidas disciplinarias en el ecosistema digital.</li>
  </ul>

  <h2>4. Mecanismos ARCO</h2>
  <p>Usted tiene derecho a conocer qué datos personales tenemos de usted, así como rectificarlos o solicitar su cancelación (Derechos ARCO). Para el ejercicio de cualquiera de los derechos ARCO, usted deberá presentar la solicitud respectiva de forma electrónica mediante el sistema de soporte o la coordinación institucional asimilada. Se proveerá respuesta a las 48 horas como máximo indicando el estado de su solicitud.</p>
</body>
</html>
  `;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
};

const getMe = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.matricula, u.role, u.whatsapp_number,
             ep.display_name, ep.bio_short, ep.profile_photo_url,
             ep.instagram_handle, ep.classroom_location
      FROM users u
      LEFT JOIN entrepreneur_profiles ep ON u.id = ep.user_id
      WHERE u.id = $1
    `, [req.user.id]);

    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.set('Cache-Control', 'no-store');
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

/**
 * PATCH /auth/profile — Actualizar perfil del emprendedor autenticado.
 */
const updateProfile = async (req, res) => {
  const {
    display_name: displayName,
    bio_short: bioShort,
    instagram_handle: instagramHandle,
    classroom_location: classroomLocation,
    whatsapp_number: whatsappNumber,
    profile_photo_base64: profilePhotoBase64,
  } = req.body;

  try {
    if (displayName !== undefined) {
      if (!displayName || displayName.trim() === '') {
        return res.status(400).json({ error: 'El nombre a mostrar no puede estar vacío' });
      }
      if (filter.isProfane(displayName)) {
        return res.status(400).json({ error: 'El nombre a mostrar contiene expresiones ofensivas' });
      }
    }

    // Gestionar número de WhatsApp
    if (whatsappNumber !== undefined) {
      let fullWhatsapp = null;
      if (whatsappNumber && String(whatsappNumber).trim() !== '') {
        const digitsOnly = String(whatsappNumber).replace(/\D/g, '');
        let normalizedNumber = '';
        if (digitsOnly.length === 10) {
          normalizedNumber = `52${digitsOnly}`;
        } else if (digitsOnly.length === 12 && digitsOnly.startsWith('52')) {
          normalizedNumber = digitsOnly;
        } else {
          return res.status(400).json({ error: 'Número de WhatsApp inválido (deben ser 10 dígitos)' });
        }
        fullWhatsapp = `+${normalizedNumber}`;
      }
      await db.query('UPDATE users SET whatsapp_number = $1 WHERE id = $2', [fullWhatsapp, req.user.id]);
    }

    // Subir nueva foto si se proporcionó base64
    let newPhotoUrl = null;
    let newPhotoId = null;
    if (profilePhotoBase64) {
      try {
        const buffer = decodeBase64Image(profilePhotoBase64);
        if (buffer) {
          const uploadRes = await uploadToCloudinary(buffer);
          newPhotoUrl = uploadRes.url;
          newPhotoId = uploadRes.public_id;
        }
      } catch (uploadErr) {
        // eslint-disable-next-line no-console
        console.error('Error al subir foto de perfil a Cloudinary:', uploadErr);
        return res.status(500).json({ error: 'Error al subir foto de perfil a Cloudinary' });
      }
    }

    let cleanInstagram = null;
    if (instagramHandle !== undefined) {
      cleanInstagram = instagramHandle ? instagramHandle.trim().replace(/^@+/, '').slice(0, 60) : null;
      if (cleanInstagram === '') cleanInstagram = null;
    }

    let cleanClassroom = null;
    if (classroomLocation !== undefined) {
      cleanClassroom = classroomLocation ? classroomLocation.trim().slice(0, 100) : null;
      if (cleanClassroom === '') cleanClassroom = null;
    }

    let cleanBio = null;
    if (bioShort !== undefined) {
      cleanBio = bioShort ? bioShort.trim().slice(0, 200) : null;
    }

    // Upsert perfil para garantizar creación si no existía fila previa
    const upsertQuery = `
      INSERT INTO entrepreneur_profiles
        (user_id, display_name, bio_short, instagram_handle, classroom_location, profile_photo_url, profile_photo_id, updated_at)
      VALUES
        ($10, COALESCE($1, 'Emprendedor'), $3, $5, $7, $8, $9, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) DO UPDATE SET
        display_name = COALESCE($1, entrepreneur_profiles.display_name),
        bio_short = CASE WHEN $2::boolean THEN $3 ELSE entrepreneur_profiles.bio_short END,
        instagram_handle = CASE WHEN $4::boolean THEN $5 ELSE entrepreneur_profiles.instagram_handle END,
        classroom_location = CASE WHEN $6::boolean THEN $7 ELSE entrepreneur_profiles.classroom_location END,
        profile_photo_url = COALESCE($8, entrepreneur_profiles.profile_photo_url),
        profile_photo_id = COALESCE($9, entrepreneur_profiles.profile_photo_id),
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    const profileRes = await db.query(upsertQuery, [
      displayName ? displayName.trim() : null,
      bioShort !== undefined,
      cleanBio,
      instagramHandle !== undefined,
      cleanInstagram,
      classroomLocation !== undefined,
      cleanClassroom,
      newPhotoUrl,
      newPhotoId,
      req.user.id,
    ]);

    const meRes = await db.query(`
      SELECT u.id, u.matricula, u.role, u.whatsapp_number,
             ep.display_name, ep.bio_short, ep.profile_photo_url,
             ep.instagram_handle, ep.classroom_location
      FROM users u
      LEFT JOIN entrepreneur_profiles ep ON u.id = ep.user_id
      WHERE u.id = $1
    `, [req.user.id]);

    return res.json({
      message: 'Perfil actualizado exitosamente',
      user: meRes.rows[0],
      profile: profileRes.rows[0],
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

/**
 * GET /auth/profile/:id — Perfil público del emprendedor.
 */
const getEntrepreneurProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const userRes = await db.query(`
      SELECT u.id, ep.display_name, ep.bio_short, ep.profile_photo_url,
             ep.instagram_handle, ep.classroom_location, u.whatsapp_number
      FROM users u
      LEFT JOIN entrepreneur_profiles ep ON ep.user_id = u.id
      WHERE u.id = $1 AND u.role = 'entrepreneur' AND u.is_suspended = false
    `, [id]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Emprendedor no encontrado' });
    }

    const entrepreneur = userRes.rows[0];
    let waLink = null;
    if (req.user && entrepreneur.whatsapp_number) {
      waLink = generateWaLink(entrepreneur.whatsapp_number);
    }
    delete entrepreneur.whatsapp_number;
    entrepreneur.wa_link = waLink;

    // Proyectos activos
    const projectsRes = await db.query(`
      SELECT p.id, p.name, p.description, p.logo_url, c.name AS category_name, p.created_at,
             (SELECT COUNT(*) FROM announcements a WHERE a.project_id = p.id AND a.status = 'active')::int AS active_announcements_count
      FROM projects p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.user_id = $1 AND p.status = 'active'
      ORDER BY p.created_at DESC
    `, [id]);

    // Anuncios activos
    const announcementsRes = await db.query(`
      SELECT a.id, a.title, a.description, a.cloudinary_url AS image_url, a.status,
             a.project_id, p.name AS project_name, p.logo_url AS project_logo_url,
             COALESCE(c.name, a.custom_category) AS category,
             (SELECT CAST(COUNT(*) AS INTEGER) FROM likes WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS likes_count,
             (SELECT COALESCE(AVG(stars)::numeric(2,1), 0) FROM ratings WHERE announcement_id = a.id AND reverted_at IS NULL AND is_accidental = false) AS avg_rating
      FROM announcements a
      JOIN projects p ON p.id = a.project_id
      LEFT JOIN categories c ON c.id = a.category_id
      WHERE p.user_id = $1 AND a.status = 'active'
      ORDER BY a.created_at DESC
    `, [id]);

    res.set('Cache-Control', 'no-store');
    return res.json({
      entrepreneur,
      projects: projectsRes.rows,
      announcements: announcementsRes.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener perfil del emprendedor' });
  }
};

module.exports = {
  registerStudent,
  registerEntrepreneur,
  login,
  checkLogin,
  logout,
  claimMatricula,
  getPrivacy,
  getMe,
  updateProfile,
  getEntrepreneurProfile,
};
