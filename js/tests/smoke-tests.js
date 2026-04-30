const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const checks = [];

function check(name, condition) {
    checks.push({ name, passed: Boolean(condition) });
    if (!condition) {
        throw new Error(`FAIL: ${name}`);
    }
    console.log(`PASS: ${name}`);
}

const packageJson = JSON.parse(read('package.json'));
const viteConfig = read('vite.config.js');
const indexHtml = read('index.html');
const appJs = read('app.js');
const swJs = read('sw.js');
const backupJs = read('js/modules/backup.js');

check('npm test points to existing basic tests', packageJson.scripts.test.includes('js/tests/basic-tests.js'));
check('Vite root points to project root', viteConfig.includes("root: '.'"));
check('HTML uses the app entrypoint, not Firebase placeholder', indexHtml.includes('/src/main.js') && !indexHtml.includes('Firebase Hosting Setup Complete'));
check('Service worker no longer precaches stale app.js/style.css assets', !swJs.includes("'/app.js'") && !swJs.includes("'/style.css'"));
check('Backup export includes all clinical collections', ['patients', 'appointments', 'notes', 'clinicalNotes', 'vitalSigns', 'prescriptions', 'consultations'].every((key) => appJs.includes(`${key}:`)));
check('Backup import restores all clinical collections', ['patients', 'appointments', 'clinicalNotes', 'vitalSigns', 'prescriptions', 'consultations'].every((key) => appJs.includes(`importCollection('${key}'`)));
check('Backup validator accepts notes or clinicalNotes and optional consultations', backupJs.includes('data.data.notes ?? data.data.clinicalNotes') && backupJs.includes('consultations'));
check('Patient PDF reads current vital sign field names', appJs.includes('v.pulse ?? v.heartRate') && appJs.includes('v.oxygen ?? v.oxygenSat'));
check('Appointments schedule notification reminders after save', appJs.includes('NotificationManager.scheduleAppointmentReminder'));

console.log(`\nSmoke tests: ${checks.length}/${checks.length} passed`);
