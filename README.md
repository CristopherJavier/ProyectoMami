# ProyectoMami / MedRecord Pro

Dashboard medico para gestion de pacientes, citas, consultas, signos vitales, recetas, reportes y respaldos con Firebase.

## Requisitos

- Node.js 20+
- npm
- Python 3.10+ solo para `scripts/audit_project.py`

## Desarrollo

```bash
npm ci
npm run dev
```

La app queda disponible en `http://localhost:3000`.

## Verificacion

```bash
npm test
npm run build
npm audit --omit=dev
```

`npm test` ejecuta pruebas basicas de calculadoras y pruebas de humo para validar estructura, build, backup/import, PWA y campos clinicos criticos.

## Build y deploy

```bash
npm run build
firebase deploy
```

Firebase Hosting sirve la carpeta `dist/`, generada por Vite. No edites `dist/` como fuente principal; los cambios deben entrar por `index.html`, `src/`, `app.js`, `js/modules/`, `sw.js` o assets publicos.

## Auditoria automatica

Si Python esta instalado:

```bash
python scripts/audit_project.py --path . --json-output audit-report.json
```

Con umbral minimo:

```bash
python scripts/audit_project.py --path . --json-output audit-report.json --min-score 7
```

## Estructura relevante

- `index.html`: entrada real de Vite.
- `src/main.js`: inyecta la estructura de UI y carga la logica de la app.
- `src/app-compiled.js`: logica principal migrada desde el snapshot compilado anterior.
- `app.js` y `js/modules/`: fuente legible para mantenimiento gradual de funcionalidades.
- `public/`: archivos estaticos copiados al build.
- `dist/`: salida generada por `npm run build`.
