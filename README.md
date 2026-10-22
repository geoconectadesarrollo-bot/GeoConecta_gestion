# GeoConecta — Gestión Interna, Planificación y Valorización de Socios

Aplicación interna desarrollada a medida para **Rodrigo y Francisco (GeoConecta)** para coordinar jornadas laborales (sincrónicas y asincrónicas), planificar compromisos, registrar avances con respaldo documental y transparentar la valorización del trabajo ("sweat equity") y liquidación de repartos.

---

## 🌟 Características Principales

### 1. 📊 Resumen Ejecutivo & Dashboard de Valorización
- **Total de Horas y Valorización en Trabajo:** Cálculo automático en tiempo real en base a la tarifa acordada (\$15.000 CLP / hora base).
- **Semáforo de Equilibrio:** Visualización gráfica del porcentaje de esfuerzo de Rodrigo vs. Francisco (ej. 50%/50% o variaciones temporales).
- **Dedicación por Frente:** Horas y montos acumulados por área (Desarrollo de Software / Plataforma, Comercial y Clientes, Administración / Legal, Operaciones en Terreno).

### 2. ⏱️ Registro Rápido de Jornadas (1 minuto)
- Modalidad **Sesión Conjunta 👥** (trabajaron juntos en paralelo o reunión) o **Avance Asincrónico 👤** (uno avanzó en su horario disponible).
- Selector ágil de horas (1h, 1.5h, 2h, 3h, 4h o exacto).
- Resumen de entregables y enlace opcional a carpetas de Google Drive, Notion, repositorios o documentos.

### 3. 📋 Bitácora & Historial Auditable
- Filtros por socio, por área/proyecto y por modalidad.
- **Exportación en 1 clic a CSV/Excel** para balances mensuales o contabilidad.

### 4. 📅 Planificación Semanal & "Pase de Posta"
- **Semáforo de Disponibilidad Semanal:** Matriz Lunes a Sábado con turnos (Mañana, Tarde, Noche).
- **Radar de Coincidencias:** Detecta automáticamente los bloques donde ambos socios coinciden para agendar jornadas juntos.
- **Compromisos Asincrónicos ("Tomo la posta"):** Tareas con notas de entrega para continuar el avance sin depender de estar conectados en vivo.

### 5. 💰 Simulador de Liquidación y Reparto Justo
- Permite ingresar un cobro o factura de cliente (ej. \$3.000.000 CLP).
- Descuenta automáticamente costos directos deducibles y fondo de reserva de GeoConecta (20%).
- **Calcula el pago exacto y matemático que le corresponde a cada socio** según las horas aportadas a ese proyecto.

---

## 🚀 Cómo Iniciar la Aplicación

### Opción 1: Con 1 Doble Clic (Windows)
Haz doble clic sobre el archivo:
```text
iniciar_app.bat
```
Se abrirá automáticamente tu navegador en `http://localhost:3000`.

### Opción 2: Desde la Terminal
```bash
cmd /c "npm run dev"
```

---

## 🔒 Privacidad y Respaldo
- Todos los datos se guardan de forma inmediata en el navegador local.
- Puedes generar un respaldo completo en archivo JSON en cualquier momento desde el menú de **Ajustes ⚙️** ("Descargar Backup JSON").
