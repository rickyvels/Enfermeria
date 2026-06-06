// ============================================
// NURSECORE - Integración con Supabase
// ============================================
const SUPABASE_URL = 'https://czbnkopwsskcfudchikk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Ym5rb3B3c3NrY2Z1ZGNoaWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzI3NDcsImV4cCI6MjA5NjEwODc0N30.YCBKfDXXLuk3qRCL78s6Z-lhety5ptCG3klrNqBTbrQ';

// ============================================
// CLIENTE DB (fetch nativo)
// ============================================
const db = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,

  headers(token) {
    const h = {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': `Bearer ${token || this.key}`,
      'Prefer': 'return=representation'
    };
    return h;
  },

  getToken() {
    const s = localStorage.getItem('nc_session');
    if (s) { try { return JSON.parse(s).access_token; } catch{} }
    return null;
  },

  async select(table, params = '') {
    const res = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
      headers: this.headers(this.getToken())
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async insert(table, data) {
    const res = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers(this.getToken()),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async update(table, data, filter) {
    const res = await fetch(`${this.url}/rest/v1/${table}?${filter}`, {
      method: 'PATCH',
      headers: this.headers(this.getToken()),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  async delete(table, filter) {
    const res = await fetch(`${this.url}/rest/v1/${table}?${filter}`, {
      method: 'DELETE',
      headers: this.headers(this.getToken())
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }
};

// ============================================
// AUTH — SUPABASE NATIVO
// ============================================
const auth = {
  // Iniciar sesión con Google (redirige a Google)
  async loginConGoogle(redirectTo) {
    const redirect = redirectTo || (window.location.origin + '/auth-callback.html');
    const url = `${SUPABASE_URL}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirect)}`;
    window.location.href = url;
  },

  // Obtener sesión desde la URL (después del redirect de Google)
  async getSessionFromURL() {
    const hash = window.location.hash;
    if (!hash) return null;
    const params = new URLSearchParams(hash.replace('#', ''));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    const token_type = params.get('token_type');
    if (!access_token) return null;

    // Obtener info del usuario desde Supabase
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'Authorization': `Bearer ${access_token}`, 'apikey': SUPABASE_ANON_KEY }
    });
    if (!res.ok) return null;
    const user = await res.json();

    const session = { access_token, refresh_token, token_type, user };
    localStorage.setItem('nc_session', JSON.stringify(session));
    return session;
  },

  // Obtener sesión guardada
  getSession() {
    const s = localStorage.getItem('nc_session');
    if (!s) return null;
    try { return JSON.parse(s); } catch { return null; }
  },

  // Verificar si el token sigue válido
  async verificarSesion() {
    const session = this.getSession();
    if (!session?.access_token) return null;
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'Authorization': `Bearer ${session.access_token}`, 'apikey': SUPABASE_ANON_KEY }
      });
      if (!res.ok) { this.cerrarSesion(); return null; }
      return await res.json();
    } catch { return null; }
  },

  cerrarSesion() {
    localStorage.removeItem('nc_session');
    localStorage.removeItem('nc_usuario_id');
    localStorage.removeItem('nc_usuario_nombre');
    localStorage.removeItem('nc_usuario_email');
    localStorage.removeItem('tipoUsuario');
    localStorage.removeItem('usuarioLogueado');
    localStorage.removeItem('nombreUsuario');
    localStorage.removeItem('codigoUsuario');
  }
};

// ============================================
// USUARIOS — registro y login clásico
// ============================================
async function registrarUsuario(nombre, codigo, email, tipo) {
  try {
    const existentes = await db.select('usuarios', `email=eq.${encodeURIComponent(email)}`);
    if (existentes.length > 0) return { error: 'El email ya está registrado' };
    const codigoExiste = await db.select('usuarios', `codigo=eq.${encodeURIComponent(codigo)}`);
    if (codigoExiste.length > 0) return { error: 'El código ya está en uso' };
    const result = await db.insert('usuarios', { nombre, codigo, email, tipo });
    return { data: result[0] };
  } catch (err) {
    return { error: err.message || 'Error al registrar' };
  }
}

async function loginUsuario(email, codigo) {
  try {
    const result = await db.select('usuarios', `email=eq.${encodeURIComponent(email)}&codigo=eq.${encodeURIComponent(codigo)}`);
    if (result.length === 0) return { error: 'Credenciales incorrectas' };
    const usuario = result[0];
    guardarSesionLocal(usuario);
    return { data: usuario };
  } catch (err) {
    return { error: err.message || 'Error al iniciar sesión' };
  }
}

// Buscar o crear usuario en tabla usuarios después de Google OAuth
async function loginOCrearUsuarioGoogle(googleUser, tipo, codigo) {
  try {
    const email = googleUser.email;
    const nombre = googleUser.user_metadata?.full_name || googleUser.email.split('@')[0];

    // Buscar si ya existe
    const existentes = await db.select('usuarios', `email=eq.${encodeURIComponent(email)}`);
    if (existentes.length > 0) {
      guardarSesionLocal(existentes[0]);
      return { data: existentes[0], esNuevo: false };
    }

    // Es nuevo → crear con tipo y código elegidos
    const result = await db.insert('usuarios', {
      nombre,
      email,
      codigo: codigo || 'GOOGLE-' + Date.now(),
      tipo: tipo || 'profesional',
      avatar_url: googleUser.user_metadata?.avatar_url || null
    });
    guardarSesionLocal(result[0]);
    return { data: result[0], esNuevo: true };
  } catch (err) {
    return { error: err.message || 'Error al procesar usuario Google' };
  }
}

function guardarSesionLocal(usuario) {
  localStorage.setItem('nc_usuario_id', usuario.id);
  localStorage.setItem('nc_usuario_nombre', usuario.nombre);
  localStorage.setItem('nc_usuario_email', usuario.email);
  localStorage.setItem('tipoUsuario', usuario.tipo);
  localStorage.setItem('usuarioLogueado', usuario.email);
  localStorage.setItem('nombreUsuario', usuario.nombre);
  localStorage.setItem('codigoUsuario', usuario.codigo);
}

function getUsuarioActual() {
  return {
    id: localStorage.getItem('nc_usuario_id'),
    nombre: localStorage.getItem('nc_usuario_nombre'),
    email: localStorage.getItem('nc_usuario_email'),
    tipo: localStorage.getItem('tipoUsuario')
  };
}

// ============================================
// PACIENTES
// ============================================
async function getPacientes() { return db.select('pacientes', 'order=created_at.desc'); }
async function getPaciente(id) { const r = await db.select('pacientes', `id=eq.${id}`); return r[0]; }
async function crearPaciente(datos) { return db.insert('pacientes', datos); }
async function actualizarPaciente(id, datos) { return db.update('pacientes', datos, `id=eq.${id}`); }

// ============================================
// SIGNOS VITALES
// ============================================
async function guardarSignosVitales(datos) {
  const u = getUsuarioActual();
  return db.insert('signos_vitales', { ...datos, usuario_id: u.id });
}
async function getSignosVitales(pid) { return db.select('signos_vitales', `paciente_id=eq.${pid}&order=fecha_registro.desc`); }

// ============================================
// KARDEX
// ============================================
async function getKardex(pid) { return db.select('kardex', `paciente_id=eq.${pid}&order=created_at.desc`); }
async function crearEntradaKardex(datos) {
  const u = getUsuarioActual();
  return db.insert('kardex', { ...datos, usuario_id: u.id });
}

// ============================================
// MEDICAMENTOS, HISTORIAL, ALERTAS, etc.
// ============================================
async function getMedicamentos() { return db.select('medicamentos_catalogo', 'order=nombre.asc'); }
async function getHistorial(pid) { return db.select('historial_clinico', `paciente_id=eq.${pid}&order=fecha_registro.desc`); }
async function agregarNota(datos) { const u = getUsuarioActual(); return db.insert('historial_clinico', { ...datos, usuario_id: u.id }); }
async function getAlertas() { return db.select('alertas', 'order=fecha_alerta.desc&leida=eq.false'); }
async function marcarAlertaLeida(id) { return db.update('alertas', { leida: true }, `id=eq.${id}`); }
async function getEvaluaciones() { const u = getUsuarioActual(); if (!u.id) return []; return db.select('evaluaciones', `usuario_id=eq.${u.id}&order=fecha_evaluacion.desc`); }
async function getGuias() { return db.select('guias', 'order=created_at.desc'); }

console.log('✅ NurseCore Supabase SDK cargado');
