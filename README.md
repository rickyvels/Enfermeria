# NurseCore 🏥

Sistema de Gestión de Enfermería — aplicación web completa para profesionales y estudiantes de enfermería.

## 🚀 Stack Tecnológico

- **Frontend:** HTML5 + CSS3 + TailwindCSS (CDN)
- **Backend / Base de Datos:** [Supabase](https://supabase.com)
- **Autenticación:** Sistema propio con código de identificación

## 🗄️ Base de Datos (Supabase)

### Tablas creadas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Profesionales y estudiantes registrados |
| `pacientes` | Información de pacientes |
| `signos_vitales` | Registros de signos vitales por paciente |
| `kardex` | Órdenes de medicamentos (Kardex de enfermería) |
| `medicamentos_catalogo` | Catálogo de medicamentos disponibles |
| `historial_clinico` | Notas de enfermería e historial |
| `alertas` | Alertas médicas y notificaciones |
| `evaluaciones` | Evaluaciones académicas (módulo estudiantes) |
| `guias` | Guías clínicas y académicas |

## 📁 Estructura del Proyecto

```
Enfermeria/
├── index.html                  # Página principal
├── login.html                  # Login con Supabase
├── registro.html               # Registro con Supabase
├── elegir-usuario.html         # Selección de rol
├── dashboard-profesional.html  # Dashboard enfermero
├── dashboard-estudiante.html   # Dashboard estudiante
├── perfil-profesional.html     # Perfil profesional
├── perfil-estudiante.html      # Perfil estudiante
├── perfil-paciente.html        # Vista de paciente
├── signos-vitales.html         # Registro signos vitales
├── kardex.html                 # Kardex de medicamentos
├── medicamentos.html           # Catálogo medicamentos
├── historial-clinico.html      # Historial clínico
├── alertas.html                # Alertas médicas
├── evaluaciones.html           # Evaluaciones (estudiantes)
├── guias.html                  # Guías clínicas
├── configuracion.html          # Configuración de la app
├── supabase.js                 # 🆕 Cliente Supabase + funciones DB
├── app.js                      # Funciones generales
└── style.css                   # Estilos globales
```

## ⚙️ Configuración

Las credenciales de Supabase están en `supabase.js`:

```js
const SUPABASE_URL = 'https://czbnkopwsskcfudchikk.supabase.co';
const SUPABASE_ANON_KEY = 'tu-anon-key';
```

## 👤 Cómo usar

1. Abrir `registro.html` para crear una cuenta (nombre, email, código, tipo)
2. El **código de identificación** funciona como contraseña
3. Iniciar sesión en `login.html` con email + código
4. Seleccionar rol (profesional/estudiante)

## 🔒 Seguridad

- Row Level Security (RLS) activado en todas las tablas
- Políticas de acceso configuradas en Supabase
