// ============================================
// NURSECORE - Integración con Supabase
// ============================================
const SUPABASE_URL = 'https://czbnkopwsskcfudchikk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6Ym5rb3B3c3NrY2Z1ZGNoaWtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MzI3NDcsImV4cCI6MjA5NjEwODc0N30.YCBKfDXXLuk3qRCL78s6Z-lhety5ptCG3klrNqBTbrQ';

// Cliente Supabase simple (sin SDK, fetch nativo)
const db = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,

  headers() {
    return {
      'Content-Type': 'application/json',
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Prefer': 'return=representation'
    };
  },

  // SELECT
  async select(table, params = '') {
    const res = await fetch(`${this.url}/rest/v1/${table}?${params}`, {
      headers: this.headers()
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  // INSERT
  async insert(table, data) {
    const res = await fetch(`${this.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  // UPDATE
  async update(table, data, filter) {
    const res = await fetch(`${this.url}/rest/v1/${table}?${filter}`, {
      method: 'PATCH',
      headers: this.headers(),
      body: JSON.stringify(data)
    });
    if (!res.ok) throw await res.json();
    return res.json();
  },

  // DELETE
  async delete(table, filter) {
    const res = await fetch(`${this.url}/rest/v1/${table}?${filter}`, {
      method: 'DELETE',
      headers: this.headers()
    });
    if (!res.ok) throw await res.json();
    return res.json();
  }
};

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

// Registrar usuario
async function registrarUsuario(nombre, codigo, email, tipo) {
  try {
    // Verificar si ya existe
    const existentes = await db.select('usuarios', `email=eq.${email}`);
    if (existentes.length > 0) {
      return { error: 'El email ya está registrado' };
    }
    const codigoExiste = await db.select('usuarios', `codigo=eq.${codigo}`);
    if (codigoExiste.length > 0) {
      return { error: 'El código ya está en uso' };
    }

    const result = await db.insert('usuarios', { nombre, codigo, email, tipo });
    return { data: result[0] };
  } catch (err) {
    return { error: err.message || 'Error al registrar' };
  }
}

// Login usuario
async function loginUsuario(email, codigo) {
  try {
    const result = await db.select('usuarios', `email=eq.${email}&codigo=eq.${codigo}`);
    if (result.length === 0) {
      return { error: 'Credenciales incorrectas' };
    }
    const usuario = result[0];
    localStorage.setItem('nc_usuario_id', usuario.id);
    localStorage.setItem('nc_usuario_nombre', usuario.nombre);
    localStorage.setItem('nc_usuario_email', usuario.email);
    localStorage.setItem('tipoUsuario', usuario.tipo);
    localStorage.setItem('usuarioLogueado', usuario.email);
    localStorage.setItem('nombreUsuario', usuario.nombre);
    localStorage.setItem('codigoUsuario', usuario.codigo);
    return { data: usuario };
  } catch (err) {
    return { error: err.message || 'Error al iniciar sesión' };
  }
}

// Obtener usuario actual
function getUsuarioActual() {
  return {
    id: localStorage.getItem('nc_usuario_id'),
    nombre: localStorage.getItem('nc_usuario_nombre'),
    email: localStorage.getItem('nc_usuario_email'),
    tipo: localStorage.getItem('tipoUsuario')
  };
}

// ============================================
// FUNCIONES DE PACIENTES
// ============================================

async function getPacientes() {
  return db.select('pacientes', 'order=created_at.desc');
}

async function getPaciente(id) {
  const res = await db.select('pacientes', `id=eq.${id}`);
  return res[0];
}

async function crearPaciente(datos) {
  return db.insert('pacientes', datos);
}

async function actualizarPaciente(id, datos) {
  return db.update('pacientes', datos, `id=eq.${id}`);
}

// ============================================
// FUNCIONES DE SIGNOS VITALES
// ============================================

async function guardarSignosVitales(datos) {
  const usuario = getUsuarioActual();
  return db.insert('signos_vitales', { ...datos, usuario_id: usuario.id });
}

async function getSignosVitales(pacienteId) {
  return db.select('signos_vitales', `paciente_id=eq.${pacienteId}&order=fecha_registro.desc`);
}

// ============================================
// FUNCIONES DE KARDEX
// ============================================

async function getKardex(pacienteId) {
  return db.select('kardex', `paciente_id=eq.${pacienteId}&order=created_at.desc`);
}

async function crearEntradaKardex(datos) {
  const usuario = getUsuarioActual();
  return db.insert('kardex', { ...datos, usuario_id: usuario.id });
}

// ============================================
// FUNCIONES DE MEDICAMENTOS
// ============================================

async function getMedicamentos() {
  return db.select('medicamentos_catalogo', 'order=nombre.asc');
}

// ============================================
// FUNCIONES DE HISTORIAL CLÍNICO
// ============================================

async function getHistorial(pacienteId) {
  return db.select('historial_clinico', `paciente_id=eq.${pacienteId}&order=fecha_registro.desc`);
}

async function agregarNota(datos) {
  const usuario = getUsuarioActual();
  return db.insert('historial_clinico', { ...datos, usuario_id: usuario.id });
}

// ============================================
// FUNCIONES DE ALERTAS
// ============================================

async function getAlertas() {
  const usuario = getUsuarioActual();
  return db.select('alertas', 'order=fecha_alerta.desc&leida=eq.false');
}

async function marcarAlertaLeida(id) {
  return db.update('alertas', { leida: true }, `id=eq.${id}`);
}

// ============================================
// FUNCIONES DE EVALUACIONES (Estudiantes)
// ============================================

async function getEvaluaciones() {
  const usuario = getUsuarioActual();
  if (!usuario.id) return [];
  return db.select('evaluaciones', `usuario_id=eq.${usuario.id}&order=fecha_evaluacion.desc`);
}

// ============================================
// FUNCIONES DE GUÍAS
// ============================================

async function getGuias() {
  return db.select('guias', 'order=created_at.desc');
}

console.log('✅ NurseCore Supabase SDK cargado correctamente');
