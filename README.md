# 🏥 SAT Salud - Frontend

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.x-06B6D4)
![shadcn/ui](https://img.shields.io/badge/UI-shadcn%2Fui-8b5cf6)
![JWT](https://img.shields.io/badge/auth-JWT-red)

Interfaz web moderna y responsiva para el **Sistema de Asistencia Técnica (SAT)** de la **Unidad de TICs del Departamento de Salud de Alto Hospicio**.

Este cliente web permite a los funcionarios, técnicos y administradores interactuar con el sistema de soporte de manera intuitiva, gestionando tickets, visualizando historiales gráficos y descargando reportes gerenciales.

## 🚀 Características Principales

- **Dashboard Inteligente:** Vistas personalizadas según el rol (KPIs para Admins/Técnicos, panel simplificado para Funcionarios).
- **Gestión de Tickets**
  - Formulario de creación con validaciones robustas (**Zod**)
  - Carga de evidencias (imágenes / PDF) integrada.
  - Panel de gestión lateral para asignaciones de técnicos y resolver tickets
- **Auditoría Visual:** Componente de **Línea de Tiempo (Timeline)** que muestra gráficamente el ciclo de vida del ticket (Creado → Asignado → Resuelto).
- **Feedback Interactivo:** Alertas animadas y confirmaciones de acción mediante **SweetAlert2**.
- **Reportabilidad:** Generación y descarga directa de reportes Excel (.xlsx) para el Administrador.
- **Seguridad:** Manejo de sesiones vía **JWT** y protección de rutas **(Middleware & Context)**.

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router).
- **Lenguaje:** TypeScript.
- **Estilos:** Tailwind CSS.
- **Componentes UI:** shadcn/ui (Radix UI).
- **Iconos:** Lucide React.
- **Formularios:** React Hook Form + Zod (Validación de esquemas).
- **Notificaciones:** SweetAlert2.
- **Conexión API:** Fetch API nativo.

## 📂 Estructura del Proyecto

```text
/src
 ├── /app
 │    ├── /dashboard        # Rutas protegidas (Panel principal)
 │    │    ├── /tickets     # Listado, Creación (new) y Detalle ([id])
 │    │    └── page.tsx     # Dashboard con KPIs y gráficos
 │    ├── layout.tsx        # Layout principal
 │    └── page.tsx          # Login (Página de inicio)
 ├── /components
 │    ├── /ui               # Componentes base (Button, Card, Input, etc.)
 │    ├── TicketHistory.tsx # Componente visual de Línea de Tiempo
 │    └── LoginForm.tsx     # Formulario de acceso
 ├── /lib
 │    └── utils.ts          # Utilidades de clases (cn)
 └── /public                # Assets estáticos
 ```

## ⚙️ Instalación y Ejecución Local
El frontend requiere que el **Backend** esté ejecutándose en el puerto `3000` (por defecto).

1. Instalar dependencias:

```bash
npm install
```
2. Iniciar servidor de desarrollo:

```bash
npm run dev
```
3. **Acceder:** Abre http://localhost:3001 (o el puerto que asigne Next.js) en tu navegador.

## 👥 Roles y Permisos

### 1. 👨‍⚕️ Funcionario (Usuario Final)
- Interfaz simplificada.
- Sidebar con acceso a 🎫 **Mis Solicitudes** y ➕ **Nuevo Ticket**.
- Visualización de estado actual del caso ("Pendiente", "En Proceso", "Resuelto").
- Sin acceso a métricas globales ni gestión técnica.
  
### 2. 👨‍🔧 Técnico (Resolutor)
- 📥 **Bandeja de Casos**: Visualización de tickets pendientes.
- Acciones rápidas: ✋ **Tomar Caso** (auto-asignación) y ✅ **Marcar Resuelto**.
- Visualización de evidencias adjuntas.

### 3. 👮‍♂️ Administrador (Jefatura)
- Control Total: Panel de gestión avanzado ("Admin Zone").
- Capacidad de re-asignar técnicos y forzar cambios de estado.
- Acceso a botón exclusivo: 📈 **Descargar Reporte** (Excel).
- Visualización de métricas de rendimiento y alertas de tickets críticos.

---
Desarrollado por **Josting Silva**  
Analista Programador – Unidad de TICs  
Departamento de Salud, Municipalidad de Alto Hospicio
