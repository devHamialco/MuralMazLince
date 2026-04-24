const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Filter = require('bad-words');
const { isValidMatricula } = require('../utils/checksum');
const db = require('../db');

const filter = new Filter();

/** Expresión regular para validar número de WhatsApp: solo dígitos, entre 7 y 15 caracteres. */
const WHATSAPP_REGEX = /^\d{7,15}$/;

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
  /* eslint-disable camelcase */
  const {
    matricula, password, whatsapp_number, display_name, privacy_accepted,
  } = req.body;
  /* eslint-enable camelcase */

  if (privacy_accepted !== true) { // eslint-disable-line camelcase
    return res.status(400).json({ error: 'Debe aceptar el aviso de privacidad explícitamente' });
  }
  if (!matricula || !isValidMatricula(matricula)) {
    return res.status(400).json({ error: 'Matrícula inválida' });
  }
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });
  }
  if (!whatsapp_number || !WHATSAPP_REGEX.test(whatsapp_number)) { // eslint-disable-line camelcase
    return res.status(400).json({ error: 'Número de WhatsApp inválido. Usa solo dígitos (7-15 caracteres)' });
  }
  if (!display_name || display_name.trim() === '') { // eslint-disable-line camelcase
    return res.status(400).json({ error: 'El nombre a mostrar es obligatorio' });
  }
  if (filter.isProfane(display_name)) { // eslint-disable-line camelcase
    return res.status(400).json({ error: 'El nombre a mostrar no es válido (contiene expresiones ofensivas)' });
  }

  const client = await db.getPool().connect();
  try {
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
      [matricula, hashedPw, whatsapp_number], // eslint-disable-line camelcase
    );

    const userId = userResult.rows[0].id;

    await client.query(
      'INSERT INTO entrepreneur_profiles (user_id, display_name) VALUES ($1, $2)',
      [userId, display_name.trim()], // eslint-disable-line camelcase
    );

    await client.query('COMMIT');
    const userResponse = {
      id: userId,
      matricula,
      role: 'entrepreneur',
      display_name: display_name.trim(),
    };
    return res.status(201).json({ message: 'Emprendedor registrado', user: userResponse });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23505') {
      return res.status(409).json({ error: 'La matrícula ya está registrada' });
    }
    // eslint-disable-next-line no-console
    console.error('Registration Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor en transacción' });
  } finally {
    client.release();
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
      SELECT u.*, ep.display_name 
      FROM users u 
      LEFT JOIN entrepreneur_profiles ep ON u.id = ep.user_id 
      WHERE u.matricula = $1
    `, [matricula]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (user.is_suspended) {
      return res.status(403).json({ error: 'Cuenta suspendida' });
    }

    if (user.role !== 'visitor_registered') {
      if (!password) {
        return res.status(401).json({ error: 'Se requiere contraseña para la cuenta' });
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
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: hours * 3600000,
    });

    const userResponse = {
      id: user.id,
      matricula: user.matricula,
      role: user.role,
      display_name: user.display_name,
    };
    return res.json({ message: 'Login exitoso', user: userResponse });
  } catch (err) {
    return res.status(500).json({ error: 'Error de login' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return res.status(200).json({ message: 'Sesión finalizada exitosamente' });
};

const claimMatricula = async (req, res) => {
  /* eslint-disable camelcase */
  const { disputed_matricula, claimant_whatsapp } = req.body;
  if (!disputed_matricula || !claimant_whatsapp) {
    return res.status(400).json({ error: 'La matrícula a disputar y el whatsapp de contacto son requeridos' });
  }

  try {
    const result = await db.query(
      'INSERT INTO claim_tickets (disputed_matricula, claimant_whatsapp) VALUES ($1, $2) RETURNING id',
      [disputed_matricula, claimant_whatsapp],
    );
    return res.status(201).json({ message: 'Reclamo ingresado para su revisión', ticketId: result.rows[0].id });
  } catch (err) {
    return res.status(500).json({ error: 'Error del servidor al ingresar reclamo' });
  }
  /* eslint-enable camelcase */
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
      SELECT u.id, u.matricula, u.role, ep.display_name 
      FROM users u 
      LEFT JOIN entrepreneur_profiles ep ON u.id = ep.user_id 
      WHERE u.id = $1
    `, [req.user.id]);
    
    const user = result.rows[0];
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

module.exports = {
  registerStudent,
  registerEntrepreneur,
  login,
  logout,
  claimMatricula,
  getPrivacy,
  getMe,
};
