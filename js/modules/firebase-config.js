// ============================================================
// MedRecord Pro - Firebase Configuration
// ============================================================
// 
// IMPORTANTE: En producción, estas credenciales deberían estar en
// variables de entorno del servidor o en Firebase Hosting config.
//
// Para desarrollo local, este archivo contiene las credenciales.
// Para producción, usa Firebase Hosting que inyecta las credenciales
// automáticamente desde /__/firebase/init.js
//
// ============================================================

// Detectar si estamos en Firebase Hosting (producción)
const isFirebaseHosting = window.location.hostname.includes('firebaseapp.com') || 
                          window.location.hostname.includes('web.app');

// Configuración de Firebase
// En producción, Firebase Hosting inyecta estas credenciales automáticamente
export const firebaseConfig = {
    apiKey: "AIzaSyDJLpOi6fN3X-jajx8DY2761BdS2_AZ0cg",
    authDomain: "recordmedico.firebaseapp.com",
    projectId: "recordmedico",
    storageBucket: "recordmedico.firebasestorage.app",
    messagingSenderId: "983403744566",
    appId: "1:983403744566:web:823e602a185becc70bb797",
    measurementId: "G-7X7YZV639G"
};

// Configuración de la aplicación
export const appConfig = {
    appName: 'MedRecord Pro',
    version: '1.0.0',
    defaultLanguage: 'es-MX',
    maxFileSize: 2 * 1024 * 1024, // 2MB
    sessionTimeout: 30 * 60 * 1000, // 30 minutos
    backupReminderDays: 7,
    maxRecentLogs: 1000
};

// Configuración de notificaciones
export const notificationConfig = {
    reminderTimes: [
        { minutes: 1440, label: '24 horas antes' },
        { minutes: 60, label: '1 hora antes' },
        { minutes: 15, label: '15 minutos antes' }
    ],
    toastDuration: 5000
};

export default { firebaseConfig, appConfig, notificationConfig };
