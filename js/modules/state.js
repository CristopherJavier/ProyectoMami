// ============================================================
// MedRecord Pro - Global State Management
// ============================================================

// Global application state
export const state = {
    currentUser: null,
    currentDoctorData: null,
    patientsCache: [],
    appointmentsCache: [],
    notesCache: [],
    vitalSignsCache: [],
    prescriptionsCache: [],
    currentRoute: 'dashboard',
    activityChart: null,
    theme: localStorage.getItem('medrecord-theme') || 'light',
    isOffline: !navigator.onLine
};

// State setters
export function setCurrentUser(user) {
    state.currentUser = user;
}

export function setCurrentDoctorData(data) {
    state.currentDoctorData = data;
}

export function setPatientsCache(patients) {
    state.patientsCache = patients;
}

export function setAppointmentsCache(appointments) {
    state.appointmentsCache = appointments;
}

export function setNotesCache(notes) {
    state.notesCache = notes;
}

export function setVitalSignsCache(vitals) {
    state.vitalSignsCache = vitals;
}

export function setPrescriptionsCache(prescriptions) {
    state.prescriptionsCache = prescriptions;
}

export function setCurrentRoute(route) {
    state.currentRoute = route;
}

export function setActivityChart(chart) {
    state.activityChart = chart;
}

export function setTheme(theme) {
    state.theme = theme;
    localStorage.setItem('medrecord-theme', theme);
}

export function setOfflineStatus(isOffline) {
    state.isOffline = isOffline;
}

// Reset state on logout
export function resetState() {
    state.currentUser = null;
    state.currentDoctorData = null;
    state.patientsCache = [];
    state.appointmentsCache = [];
    state.notesCache = [];
    state.vitalSignsCache = [];
    state.prescriptionsCache = [];
    state.currentRoute = 'dashboard';
    if (state.activityChart) {
        state.activityChart.destroy();
        state.activityChart = null;
    }
}

// Listen for online/offline status
window.addEventListener('online', () => setOfflineStatus(false));
window.addEventListener('offline', () => setOfflineStatus(true));
