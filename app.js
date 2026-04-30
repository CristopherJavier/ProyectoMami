// ============================================================
// MedRecord Pro - Full Application with Firebase
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    onSnapshot,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updateProfile,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
// Import active modules only
import { NotificationManager } from './js/modules/notifications.js';
import { BackupManager } from './js/modules/backup.js';
import { AccessLogs } from './js/modules/access-logs.js';

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDJLpOi6fN3X-jajx8DY2761BdS2_AZ0cg",
    authDomain: "recordmedico.firebaseapp.com",
    projectId: "recordmedico",
    storageBucket: "recordmedico.firebasestorage.app",
    messagingSenderId: "983403744566",
    appId: "1:983403744566:web:823e602a185becc70bb797",
    measurementId: "G-7X7YZV639G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Notification Manager
NotificationManager.init();

// Initialize Access Logs
AccessLogs.init();

// ============================================================
// GLOBAL STATE
// ============================================================
let currentUser = null;
let currentDoctorData = null;
let patientsCache = [];
let appointmentsCache = [];
let notesCache = [];
let vitalSignsCache = [];
let prescriptionsCache = [];
let consultationsCache = [];
let currentRoute = 'dashboard';
let activityChart = null;

// ============================================================
// DOM ELEMENTS
// ============================================================
const loginScreen = document.getElementById('login-screen');
const mainApp = document.getElementById('main-app');
const mainContent = document.getElementById('main-content');

// Login elements
const loginFormView = document.getElementById('login-form-view');
const registerFormView = document.getElementById('register-form-view');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

// Register elements
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerConfirm = document.getElementById('register-confirm');
const registerBtn = document.getElementById('register-btn');
const registerError = document.getElementById('register-error');

// Password toggles
const toggleLoginPassword = document.getElementById('toggle-login-password');
const toggleRegisterPassword = document.getElementById('toggle-register-password');
const toggleRegisterConfirm = document.getElementById('toggle-register-confirm');

// Logout modal
const logoutModal = document.getElementById('logout-modal');
const logoutBtn = document.getElementById('logout-btn');
const cancelLogoutBtn = document.getElementById('cancel-logout-btn');
const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

// Sidebar elements
const sidebarDocName = document.getElementById('sidebar-doc-name');
const sidebarDocRole = document.getElementById('sidebar-doc-role');
const sidebarDocPhoto = document.getElementById('sidebar-doc-photo');
const userProfileBtn = document.getElementById('user-profile-btn');

// Profile modal
const profileModal = document.getElementById('doctor-profile-modal');
const docNameInput = document.getElementById('doc-name-input');
const docRoleInput = document.getElementById('doc-role-input');
const docLicenseInput = document.getElementById('doc-license-input');
const docSpecialtiesInput = document.getElementById('doc-specialties-input');
const docBioInput = document.getElementById('doc-bio-input');
const docPhotoInput = document.getElementById('doc-photo-input');
const docIdDisplay = document.getElementById('doc-id-display');
const cancelProfileBtn = document.getElementById('cancel-profile-btn');
const saveProfileBtn = document.getElementById('save-profile-btn');

// Photo elements
const photoDropZone = document.getElementById('photo-drop-zone');
const fileInput = document.getElementById('file-input');
const docPhotoHidden = document.getElementById('doc-photo-input');
const dropZoneText = document.getElementById('drop-zone-text');
const cropperContainer = document.getElementById('cropper-container');
const cropperImage = document.getElementById('cropper-image');

// Patient modal
const patientModal = document.getElementById('patient-modal');
const patientModalTitle = document.getElementById('patient-modal-title');
const patientFirstname = document.getElementById('patient-firstname');
const patientLastname = document.getElementById('patient-lastname');
const patientDob = document.getElementById('patient-dob');
const patientSex = document.getElementById('patient-sex');
const patientPhone = document.getElementById('patient-phone');
const patientProvince = document.getElementById('patient-province');
const patientReason = document.getElementById('patient-reason');
const patientIdBadge = document.getElementById('patient-id-badge');
const patientIdDisplay = document.getElementById('patient-id-display');
const patientError = document.getElementById('patient-error');
const cancelPatientBtn = document.getElementById('cancel-patient-btn');
const savePatientBtn = document.getElementById('save-patient-btn');

// Consultation modal
const consultationModal = document.getElementById('consultation-modal');
const consultPatientName = document.getElementById('consultation-patient-name');
const consultFirstname = document.getElementById('consult-firstname');
const consultLastname = document.getElementById('consult-lastname');
const consultPhone = document.getElementById('consult-phone');
const consultProvince = document.getElementById('consult-province');
const consultWeight = document.getElementById('consult-weight');
const consultDob = document.getElementById('consult-dob');
const consultAgeDisplay = document.getElementById('consult-age-display');
const consultWeightComparison = document.getElementById('consult-weight-comparison');
const consultAllergies = document.getElementById('consult-allergies');
const consultFamilyHistory = document.getElementById('consult-family-history');
const consultReason = document.getElementById('consult-reason');
const consultMedications = document.getElementById('consult-medications');
const consultHistorySection = document.getElementById('consultation-history-section');
const consultHistoryList = document.getElementById('consultation-history-list');
const consultError = document.getElementById('consultation-error');
const cancelConsultationBtn = document.getElementById('cancel-consultation-btn');
const saveConsultationBtn = document.getElementById('save-consultation-btn');

// Appointment modal
const appointmentModal = document.getElementById('appointment-modal');
const appointmentModalTitle = document.getElementById('appointment-modal-title');
const appointmentPatient = document.getElementById('appointment-patient');
const appointmentDate = document.getElementById('appointment-date');
const appointmentTime = document.getElementById('appointment-time');
const appointmentType = document.getElementById('appointment-type');
const appointmentNotes = document.getElementById('appointment-notes');
const appointmentError = document.getElementById('appointment-error');
const cancelAppointmentBtn = document.getElementById('cancel-appointment-btn');
const saveAppointmentBtn = document.getElementById('save-appointment-btn');

// Note modal
const noteModal = document.getElementById('note-modal');
const notePatient = document.getElementById('note-patient');
const noteType = document.getElementById('note-type');
const noteContent = document.getElementById('note-content');
const noteError = document.getElementById('note-error');
const cancelNoteBtn = document.getElementById('cancel-note-btn');
const saveNoteBtn = document.getElementById('save-note-btn');

// ============================================================
// UTILITY FUNCTIONS
// ============================================================
function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Configure date inputs with proper min/max limits
function configureDateInputLimits() {
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
    const dateInputs = [
        document.getElementById('patient-dob'),
        document.getElementById('consult-dob')
    ];
    
    dateInputs.forEach(input => {
        if (input) {
            input.min = '1900-01-01';
            input.max = today;
        }
    });
}

// Format phone number as (XXX) XXX-XXXX
function formatPhoneNumber(value) {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Apply formatting based on number of digits
    if (digits.length === 0) return '';
    if (digits.length <= 3) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

// Setup phone input formatting
function configurePhoneInputs() {
    const phoneInputs = [
        document.getElementById('patient-phone'),
        document.getElementById('consult-phone')
    ];
    
    phoneInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', (e) => {
                const cursorPos = e.target.selectionStart;
                const oldValue = e.target.value;
                const newValue = formatPhoneNumber(oldValue);
                e.target.value = newValue;
                
                // Adjust cursor position after formatting
                if (cursorPos < oldValue.length) {
                    const digitsBefore = oldValue.slice(0, cursorPos).replace(/\D/g, '').length;
                    let newCursorPos = 0;
                    let digitsCount = 0;
                    
                    for (let i = 0; i < newValue.length && digitsCount < digitsBefore; i++) {
                        if (/\d/.test(newValue[i])) digitsCount++;
                        newCursorPos = i + 1;
                    }
                    e.target.setSelectionRange(newCursorPos, newCursorPos);
                }
            });
            
            // Format existing value if any
            if (input.value) {
                input.value = formatPhoneNumber(input.value);
            }
        }
    });
}

// Call on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    configureDateInputLimits();
    configurePhoneInputs();
});

function formatDate(date, format = 'short') {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);

    if (format === 'short') {
        return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    } else if (format === 'full') {
        return d.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } else if (format === 'time') {
        return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es-ES');
}

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

// CLINICAL NOTE CONTENT FILTER — Uses word boundaries to prevent partial word corruption
function filterClinicalContent(content) {
    if (!content) return "";
    const filters = [
        { regex: /\btodo bien\b/gi, replacement: "Estado clínico estable" },
        { regex: /\best[aá] loca\b/gi, replacement: "Paciente presenta agitación psicomotriz" },
        { regex: /\bloca\b/gi, replacement: "Paciente con alteración del afecto" },
        { regex: /\bborracho\b/gi, replacement: "Paciente con signos de intoxicación etílica" },
        { regex: /\bfeos\b/gi, replacement: "hallazgos clínicos atípicos" }
    ];
    let filtered = content;
    filters.forEach(f => {
        filtered = filtered.replace(f.regex, f.replacement);
    });
    return filtered;
}

function showError(element, message) {
    element.textContent = message;
    element.style.display = 'block';
}

function hideError(element) {
    element.style.display = 'none';
}

function openModal(modal) {
    modal.style.display = 'flex';
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(modal.querySelector('.modal-box'),
        { scale: 0.9, y: 20 },
        { scale: 1, y: 0, duration: 0.3, ease: "back.out(1.5)" }
    );
}

function closeModal(modal, callback) {
    gsap.to(modal.querySelector('.modal-box'), { scale: 0.9, y: 20, duration: 0.2 });
    gsap.to(modal, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
            modal.style.display = 'none';
            if (callback) callback();
        }
    });
}

// ============================================================
// AUTHENTICATION
// ============================================================
let splashComplete = false;

async function initSplashScreen() {
    const splash = document.getElementById('splash-screen');
    const heartGroup = document.querySelector('.splash-heart-svg .heart-group');
    const pulseLine = document.querySelector('.splash-heart-svg .pulse-line');
    const splashText = document.querySelector('.splash-text');

    // Initial states
    gsap.set(heartGroup, { opacity: 0, scale: 0.8, transformOrigin: "center" });
    gsap.set(pulseLine, { strokeDashoffset: 600 }); // Value from CSS
    gsap.set(splashText, { opacity: 0, x: -20 });

    const tl = gsap.timeline({
        onComplete: () => {
            splashComplete = true;
            if (currentUser) {
                showAppUI();
            } else {
                showLoginUI();
            }
        }
    });

    // 1. Aparece el corazón azul
    tl.to(heartGroup, {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)"
    });

    // 2. Se integra la M verde desde la izquierda
    tl.to(pulseLine, {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: "power2.inOut"
    }, "-=0.3");

    // 3. Aparece el nombre con fade suave
    tl.to(splashText, {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power2.out"
    }, "-=0.5");

    // 4. Pausa y salida
    tl.to(splash, {
        opacity: 0,
        duration: 0.5,
        delay: 1.2,
        onComplete: () => {
            splash.style.display = 'none';
        }
    });
}

function showAppUI() {
    if (!splashComplete) return;
    loginScreen.style.display = 'none';
    mainApp.style.display = 'grid';
    gsap.fromTo(mainApp, { opacity: 0 }, { opacity: 1, duration: 0.5 });
}

function showLoginUI() {
    if (!splashComplete) return;
    mainApp.style.display = 'none';
    loginScreen.style.display = 'flex';
    gsap.fromTo(loginScreen, { opacity: 0 }, { opacity: 1, duration: 0.5 });
}

// Iniciar Splash
initSplashScreen();

onAuthStateChanged(auth, async (user) => {
    currentUser = user; // Guardar estado globalmente

    if (user) {
        await loadDoctorProfile(user.uid);
        await loadAllData();
        window.location.hash = 'dashboard';
        navigateTo('dashboard');

        if (splashComplete) {
            showAppUI();
        }
    } else {
        currentDoctorData = null;
        patientsCache = [];
        if (splashComplete) {
            showLoginUI();
        }
    }
});

// Login
loginBtn?.addEventListener('click', handleLogin);
loginPassword?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});
loginEmail?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginPassword.focus();
});

async function handleLogin() {
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showError(loginError, 'Por favor complete todos los campos.');
        return;
    }

    hideError(loginError);
    loginBtn.disabled = true;
    loginBtn.textContent = 'Ingresando...';

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        let message = 'Error al iniciar sesión.';
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = 'Correo o contraseña incorrectos.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'El correo electrónico no es válido.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Demasiados intentos. Intente más tarde.';
        }
        showError(loginError, message);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Ingresar';
    }
}

// Register
registerBtn?.addEventListener('click', handleRegister);
registerConfirm?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleRegister();
});

async function handleRegister() {
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;
    const confirm = registerConfirm.value;

    if (!name || !email || !password || !confirm) {
        showError(registerError, 'Por favor complete todos los campos.');
        return;
    }

    if (password.length < 6) {
        showError(registerError, 'La contraseña debe tener al menos 6 caracteres.');
        return;
    }

    if (password !== confirm) {
        showError(registerError, 'Las contraseñas no coinciden.');
        return;
    }

    hideError(registerError);
    registerBtn.disabled = true;
    registerBtn.textContent = 'Registrando...';

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);

        // Create doctor profile
        await setDoc(doc(db, "doctores", userCredential.user.uid), {
            nombre: name,
            email: email,
            rol: "Médico General",
            licencia: "",
            especialidades: "",
            biografia: "",
            fotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a5f&color=fff`,
            createdAt: serverTimestamp()
        });

        // Clear form
        registerName.value = '';
        registerEmail.value = '';
        registerPassword.value = '';
        registerConfirm.value = '';

    } catch (error) {
        let message = 'Error al registrar la cuenta.';
        if (error.code === 'auth/email-already-in-use') {
            message = 'Este correo ya está registrado.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'El correo electrónico no es válido.';
        } else if (error.code === 'auth/weak-password') {
            message = 'La contraseña es muy débil.';
        }
        showError(registerError, message);
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = 'Registrarse';
    }
}

// Toggle between login and register
showRegisterLink?.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormView.style.display = 'none';
    registerFormView.style.display = 'block';
    hideError(loginError);
});

showLoginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    registerFormView.style.display = 'none';
    loginFormView.style.display = 'block';
    hideError(registerError);
});

// Password Recovery
const forgotPasswordLink = document.getElementById('forgot-password-link');
const forgotPasswordView = document.getElementById('forgot-password-view');
const backToLoginLink = document.getElementById('back-to-login');
const resetEmailInput = document.getElementById('reset-email');
const resetBtn = document.getElementById('reset-btn');
const resetError = document.getElementById('reset-error');
const resetSuccess = document.getElementById('reset-success');

forgotPasswordLink?.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormView.style.display = 'none';
    forgotPasswordView.style.display = 'block';
    hideError(loginError);
});

backToLoginLink?.addEventListener('click', (e) => {
    e.preventDefault();
    forgotPasswordView.style.display = 'none';
    loginFormView.style.display = 'block';
    if (resetError) resetError.style.display = 'none';
    if (resetSuccess) resetSuccess.style.display = 'none';
});

resetBtn?.addEventListener('click', async () => {
    const email = resetEmailInput?.value.trim();

    if (!email) {
        showError(resetError, 'Por favor ingresa tu correo electrónico.');
        return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError(resetError, 'Por favor ingresa un correo electrónico válido.');
        return;
    }

    if (resetError) resetError.style.display = 'none';
    if (resetSuccess) resetSuccess.style.display = 'none';
    resetBtn.disabled = true;
    resetBtn.textContent = 'Enviando...';

    try {
        console.log('Intentando enviar correo de recuperación a:', email);
        await sendPasswordResetEmail(auth, email);
        console.log('Correo de recuperación enviado exitosamente');
        if (resetSuccess) {
            resetSuccess.innerHTML = `
                <i class="ph ph-check-circle" style="margin-right: 8px;"></i>
                ¡Enlace enviado a <strong>${email}</strong>!<br>
                <small style="display: block; margin-top: 8px;">
                    Revisa tu bandeja de entrada y la carpeta de spam.<br>
                    El enlace expira en 1 hora.
                </small>
            `;
            resetSuccess.style.display = 'block';
        }
        resetEmailInput.value = '';
    } catch (error) {
        console.error('Error al enviar correo de recuperación:', error);
        let message = 'Error al enviar el enlace.';
        if (error.code === 'auth/user-not-found') {
            message = 'No existe una cuenta registrada con este correo electrónico.';
        } else if (error.code === 'auth/invalid-email') {
            message = 'El formato del correo electrónico no es válido.';
        } else if (error.code === 'auth/too-many-requests') {
            message = 'Has solicitado demasiados enlaces. Por favor, espera unos minutos e intenta de nuevo.';
        } else if (error.code === 'auth/network-request-failed') {
            message = 'Error de conexión. Verifica tu conexión a internet e intenta de nuevo.';
        } else if (error.code === 'auth/missing-email') {
            message = 'Por favor ingresa un correo electrónico.';
        } else {
            message = `Error: ${error.message || 'No se pudo enviar el enlace. Intenta más tarde.'}`;
        }
        showError(resetError, message);
    } finally {
        resetBtn.disabled = false;
        resetBtn.textContent = 'Enviar Enlace';
    }
});

// Password visibility toggles
function setupPasswordToggle(toggleBtn, inputField) {
    toggleBtn?.addEventListener('click', () => {
        const type = inputField.type === 'password' ? 'text' : 'password';
        inputField.type = type;
        toggleBtn.innerHTML = type === 'password'
            ? '<i class="ph ph-eye"></i>'
            : '<i class="ph ph-eye-slash"></i>';
    });
}

setupPasswordToggle(toggleLoginPassword, loginPassword);
setupPasswordToggle(toggleRegisterPassword, registerPassword);
setupPasswordToggle(toggleRegisterConfirm, registerConfirm);

// Logout
logoutBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(logoutModal);
});

cancelLogoutBtn?.addEventListener('click', () => closeModal(logoutModal));

confirmLogoutBtn?.addEventListener('click', async () => {
    AccessLogs.log('logout', {});
    await signOut(auth);
    closeModal(logoutModal);
});

// ============================================================
// DATA LOADING
// ============================================================
async function loadDoctorProfile(uid) {
    try {
        const docRef = doc(db, "doctores", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            currentDoctorData = docSnap.data();
            updateSidebarProfile();
        } else {
            // Create default profile
            currentDoctorData = {
                nombre: currentUser.email.split('@')[0],
                rol: "Médico",
                fotoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.email)}&background=1e3a5f&color=fff`
            };
            updateSidebarProfile();
        }
    } catch (error) {
        console.error("Error loading doctor profile:", error);
    }
}

function updateSidebarProfile() {
    if (sidebarDocName) sidebarDocName.textContent = currentDoctorData?.nombre || 'Doctor';
    if (sidebarDocRole) sidebarDocRole.textContent = currentDoctorData?.rol || 'Médico';
    if (sidebarDocPhoto && currentDoctorData?.fotoUrl) {
        sidebarDocPhoto.src = currentDoctorData.fotoUrl;
    }
}

async function loadAllData() {
    await Promise.all([
        loadPatients(),
        loadAppointments(),
        loadNotes(),
        loadVitalSigns(),
        loadPrescriptions(),
        loadConsultations()
    ]);

    // Limpiar pacientes eliminados hace más de 30 días
    await cleanupDeletedPatients();
}

async function loadPatients() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, "patients"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        patientsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error loading patients:", error);
        patientsCache = [];
    }
}

async function loadAppointments() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, "appointments"),
            where("userId", "==", currentUser.uid),
            orderBy("date", "asc")
        );
        const snapshot = await getDocs(q);
        appointmentsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error loading appointments:", error);
        appointmentsCache = [];
    }
}

async function loadNotes() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, "clinicalNotes"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        notesCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error loading notes:", error);
        notesCache = [];
    }
}

async function loadConsultations() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, "consultations"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        consultationsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error loading consultations:", error);
        consultationsCache = [];
    }
}

// Generate a readable patient ID: PAC-YYYY-NNNN
async function generatePatientId() {
    if (!currentUser) return 'PAC-0000-0000';

    const year = new Date().getFullYear();
    const counterRef = doc(db, "counters", `patients_${currentUser.uid}`);

    try {
        const counterDoc = await getDoc(counterRef);
        let nextNumber = 1;

        if (counterDoc.exists()) {
            nextNumber = (counterDoc.data().count || 0) + 1;
        }

        await setDoc(counterRef, { count: nextNumber, updatedAt: serverTimestamp() });

        const paddedNumber = String(nextNumber).padStart(4, '0');
        return `PAC-${year}-${paddedNumber}`;
    } catch (error) {
        console.error("Error generating patient ID:", error);
        const fallback = String(Date.now()).slice(-4);
        return `PAC-${year}-${fallback}`;
    }
}

// Limpiar pacientes eliminados hace más de 30 días
async function cleanupDeletedPatients() {
    if (!currentUser) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const deletedPatients = patientsCache.filter(p => p.status === 'deleted');

    for (const patient of deletedPatients) {
        if (patient.statusChangedAt) {
            const deletedDate = new Date(patient.statusChangedAt);
            if (deletedDate < thirtyDaysAgo) {
                try {
                    await deleteDoc(doc(db, "patients", patient.id));
                    console.log(`Paciente ${patient.name} eliminado automáticamente (más de 30 días)`);
                } catch (error) {
                    console.error("Error al eliminar paciente automáticamente:", error);
                }
            }
        }
    }

    // Recargar pacientes después de la limpieza
    await loadPatients();
}

// ============================================================
// ROUTING / NAVIGATION
// ============================================================
document.querySelectorAll('.nav-item[data-route]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = link.dataset.route;
        navigateTo(route);
    });
});

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || 'dashboard';
    if (currentUser) {
        navigateTo(hash);
    }
});

function navigateTo(route) {
    currentRoute = route;
    window.location.hash = route;

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.route === route) {
            item.classList.add('active');
        }
    });

    // Render the appropriate view
    switch (route) {
        case 'dashboard':
            renderDashboard();
            break;
        case 'pacientes':
            renderPatients();
            break;
        case 'citas':
            renderAppointments();
            break;
        case 'signos-vitales':
            renderVitalSigns();
            break;
        case 'recetas':
            renderPrescriptions();
            break;
        case 'informes':
            renderReports();
            break;
        case 'perfil':
            renderProfile();
            break;
        case 'calculadoras':
            renderCalculators();
            break;
        case 'configuracion':
            renderSettings();
            break;
        default:
            if (route.startsWith('paciente/')) {
                const patientId = route.split('/')[1];
                renderPatientDetail(patientId);
            } else {
                renderDashboard();
            }
    }
}

// ============================================================
// VIEW RENDERERS
// ============================================================

// Dashboard View
function renderDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = appointmentsCache.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= today && aptDate < tomorrow;
    });

    const recentNotes = notesCache.slice(0, 5);

    // Solo contar pacientes activos
    const activePatients = patientsCache.filter(p => p.status === 'active' || !p.status);

    mainContent.innerHTML = `
        <div class="page-header">
            <h1><i class="ph ph-squares-four"></i>Panel de Control</h1>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon blue"><i class="ph ph-users"></i></div>
                <div class="stat-value">${activePatients.length}</div>
                <div class="stat-label">Total Pacientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon green"><i class="ph ph-calendar-check"></i></div>
                <div class="stat-value">${todayAppointments.length}</div>
                <div class="stat-label">Citas Hoy</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon orange"><i class="ph ph-clipboard-text"></i></div>
                <div class="stat-value">${notesCache.length}</div>
                <div class="stat-label">Notas Clínicas</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon purple"><i class="ph ph-calendar-blank"></i></div>
                <div class="stat-value">${appointmentsCache.length}</div>
                <div class="stat-label">Total Citas</div>
            </div>
        </div>
        
        <div class="chart-container">
            <h3>Actividad de los Últimos 7 Días</h3>
            <div style="position: relative; height: 250px; width: 100%;">
                <canvas id="activity-chart"></canvas>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
            <div class="chart-container">
                <h3>Citas de Hoy</h3>
                ${todayAppointments.length > 0 ? `
                    <div class="appointments-list">
                        ${todayAppointments.map(apt => {
        const patient = patientsCache.find(p => p.id === apt.patientId);
        return `
                                <div class="appointment-card" style="padding: 12px;">
                                    <div class="appointment-info">
                                        <h4>${patient?.name || 'Paciente'}</h4>
                                        <p>${apt.type} - ${formatDate(apt.date, 'time')}</p>
                                    </div>
                                </div>
                            `;
    }).join('')}
                    </div>
                ` : `
                    <div class="empty-state" style="padding: 20px;">
                        <i class="ph ph-calendar-x" style="font-size: 32px;"></i>
                        <p style="margin: 8px 0 0;">No hay citas para hoy</p>
                    </div>
                `}
            </div>
            
            <div class="chart-container">
                <h3>Notas Recientes</h3>
                ${recentNotes.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 8px;">
                        ${recentNotes.map(note => {
        const patient = patientsCache.find(p => p.id === note.patientId);
        return `
                                <div style="padding: 12px; background: #f8fafc; border-radius: 8px;">
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                                        <strong style="font-size: 13px;">${patient?.name || 'Paciente'}</strong>
                                        <span style="font-size: 11px; color: var(--text-secondary);">${formatDate(note.createdAt)}</span>
                                    </div>
                                    <span class="tag-gray" style="font-size: 11px; padding: 2px 8px;">${note.type}</span>
                                    <p style="font-size: 11px; color: var(--text-primary); margin-top: 4px; line-height: 1.4;">
                                        ${filterClinicalContent(note.content).substring(0, 60)}...
                                    </p>
                                </div>
                            `;
    }).join('')}
                    </div>
                ` : `
                    <div class="empty-state" style="padding: 20px;">
                        <i class="ph ph-note-blank" style="font-size: 32px;"></i>
                        <p style="margin: 8px 0 0;">No hay notas recientes</p>
                    </div>
                `}
            </div>
        </div>
    `;

    // Render activity chart
    renderActivityChart();

    // Animate
    animateContent('dashboard');
}

function renderActivityChart() {
    const canvas = document.getElementById('activity-chart');
    if (!canvas) return;

    // Destroy existing chart
    if (activityChart) {
        activityChart.destroy();
    }

    // Get last 7 days data
    const labels = [];
    const appointmentsData = [];
    const notesData = [];

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);

        labels.push(date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }));

        const dayAppointments = appointmentsCache.filter(apt => {
            const aptDate = new Date(apt.date);
            return aptDate >= date && aptDate < nextDay;
        }).length;

        const dayNotes = notesCache.filter(note => {
            if (!note.createdAt) return false;
            const noteDate = note.createdAt.toDate ? note.createdAt.toDate() : new Date(note.createdAt);
            return noteDate >= date && noteDate < nextDay;
        }).length;

        appointmentsData.push(dayAppointments);
        notesData.push(dayNotes);
    }

    activityChart = new Chart(canvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Citas',
                    data: appointmentsData,
                    backgroundColor: 'rgba(30, 58, 95, 0.8)',
                    borderRadius: 6
                },
                {
                    label: 'Notas',
                    data: notesData,
                    backgroundColor: 'rgba(34, 197, 94, 0.8)',
                    borderRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Patients View
function renderPatients(filter = 'active') {
    // Filter patients by status
    const activePatients = patientsCache.filter(p => p.status === 'active' || !p.status);
    const inactivePatients = patientsCache.filter(p => p.status === 'inactive');
    const deletedPatients = patientsCache.filter(p => p.status === 'deleted');

    let displayPatients;
    switch (filter) {
        case 'inactive':
            displayPatients = inactivePatients;
            break;
        case 'deleted':
            displayPatients = deletedPatients;
            break;
        default:
            displayPatients = activePatients;
    }

    mainContent.innerHTML = `
        <div class="page-header">
            <h1><i class="ph ph-users"></i>Pacientes</h1>
            <button class="btn-primary" id="add-patient-btn">
                <i class="ph ph-plus"></i> Nuevo Paciente
            </button>
        </div>
        
        <!-- Tabs de filtro -->
        <div class="patient-tabs">
            <button class="patient-tab ${filter === 'active' ? 'active' : ''}" data-filter="active">
                <i class="ph ph-users"></i> Activos
                <span class="tab-count">${activePatients.length}</span>
            </button>
            <button class="patient-tab ${filter === 'inactive' ? 'active' : ''}" data-filter="inactive">
                <i class="ph ph-user-minus"></i> Inactivos
                <span class="tab-count">${inactivePatients.length}</span>
            </button>
            <button class="patient-tab ${filter === 'deleted' ? 'active' : ''}" data-filter="deleted">
                <i class="ph ph-trash"></i> Eliminados
                <span class="tab-count">${deletedPatients.length}</span>
            </button>
        </div>
        
        <div class="content-search">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" id="patient-search" placeholder="Buscar paciente por nombre...">
        </div>
        
        ${displayPatients.length > 0 ? `
            <div class="patients-list" id="patients-list">
                ${displayPatients.map(patient => renderPatientCard(patient, filter)).join('')}
            </div>
        ` : `
            <div class="empty-state">
                <i class="ph ph-${filter === 'deleted' ? 'trash' : filter === 'inactive' ? 'user-minus' : 'users'}"></i>
                <h3>${filter === 'active' ? 'No hay pacientes activos' : filter === 'inactive' ? 'No hay pacientes inactivos' : 'No hay pacientes eliminados'}</h3>
                <p>${filter === 'active' ? 'Usa el botón "Nuevo Paciente" para comenzar' : 'Los pacientes aparecerán aquí cuando cambies su estado'}</p>
            </div>
        `}
    `;

    // Event listeners
    document.getElementById('add-patient-btn')?.addEventListener('click', () => openPatientModal());

    // Tab listeners
    document.querySelectorAll('.patient-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const newFilter = tab.dataset.filter;
            renderPatients(newFilter);
        });
    });

    // Search
    document.getElementById('patient-search')?.addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        const filtered = displayPatients.filter(p => {
            const name = (p.name || '').toLowerCase();
            const firstName = (p.firstName || '').toLowerCase();
            const lastName = (p.lastName || '').toLowerCase();
            const readableId = (p.readableId || '').toLowerCase();
            return name.includes(search) || firstName.includes(search) || lastName.includes(search) || readableId.includes(search);
        });
        const listEl = document.getElementById('patients-list');
        if (listEl) {
            listEl.innerHTML = filtered.map(patient => renderPatientCard(patient, filter)).join('');
            attachPatientCardListeners(filter);
        }
    });

    attachPatientCardListeners(filter);

    // Animate
    animateContent('patients');
}

function renderPatientCard(patient, filter = 'active') {
    const age = calculateAge(patient.birthDate);

    // Calcular días restantes para eliminación automática
    let daysRemaining = null;
    if (patient.status === 'deleted' && patient.statusChangedAt) {
        const deletedDate = new Date(patient.statusChangedAt);
        const now = new Date();
        const daysPassed = Math.floor((now - deletedDate) / (1000 * 60 * 60 * 24));
        daysRemaining = 30 - daysPassed;
        if (daysRemaining < 0) daysRemaining = 0;
    }

    const statusBadge = patient.status === 'inactive'
        ? '<span class="status-badge inactive">Inactivo</span>'
        : patient.status === 'deleted'
            ? `<span class="status-badge deleted">Eliminado</span>${daysRemaining !== null ? `<span class="status-badge warning" style="margin-left: 4px; background: #f59e0b; color: white;">${daysRemaining} días restantes</span>` : ''}`
            : '';

    return `
        <div class="patient-card" data-patient-id="${patient.id}">
            <div class="patient-card-header">
                <div class="patient-card-avatar ${patient.status === 'inactive' ? 'inactive' : patient.status === 'deleted' ? 'deleted' : ''}">
                    <i class="ph ph-user"></i>
                </div>
                <div class="patient-card-info">
                    <h3>${patient.name} ${statusBadge}</h3>
                    <p>ID: ${patient.readableId || patient.id.substring(0, 8).toUpperCase()}</p>
                </div>
            </div>
            <div class="patient-card-meta">
                <span><i class="ph ph-calendar"></i> ${age} años</span>
                <span><i class="ph ph-gender-intersex"></i> ${patient.sex}</span>
                <span><i class="ph ph-map-pin"></i> ${patient.province || 'Sin provincia'}</span>
            </div>
            <div class="patient-card-actions">
                ${filter === 'active' ? `
                    <button class="btn-icon" onclick="event.stopPropagation(); openPatientModal('${patient.id}')" title="Editar">
                        <i class="ph ph-pencil"></i>
                    </button>
                    <button class="btn-icon warning" onclick="event.stopPropagation(); changePatientStatus('${patient.id}', 'inactive')" title="Dar de baja">
                        <i class="ph ph-user-minus"></i>
                    </button>
                    <button class="btn-icon danger" onclick="event.stopPropagation(); changePatientStatus('${patient.id}', 'deleted')" title="Eliminar">
                        <i class="ph ph-trash"></i>
                    </button>
                ` : filter === 'inactive' ? `
                    <button class="btn-icon success" onclick="event.stopPropagation(); changePatientStatus('${patient.id}', 'active')" title="Reactivar">
                        <i class="ph ph-user-plus"></i>
                    </button>
                    <button class="btn-icon danger" onclick="event.stopPropagation(); changePatientStatus('${patient.id}', 'deleted')" title="Eliminar">
                        <i class="ph ph-trash"></i>
                    </button>
                ` : `
                    <button class="btn-icon success" onclick="event.stopPropagation(); changePatientStatus('${patient.id}', 'active')" title="Restaurar">
                        <i class="ph ph-arrow-counter-clockwise"></i>
                    </button>
                    <button class="btn-icon danger" onclick="event.stopPropagation(); deletePatientPermanently('${patient.id}')" title="Eliminar permanentemente">
                        <i class="ph ph-trash-simple"></i>
                    </button>
                `}
            </div>
        </div>
    `;
}

// Change patient status (active, inactive, deleted)
async function changePatientStatus(patientId, newStatus) {
    const statusMessages = {
        'inactive': '¿Dar de baja a este paciente?',
        'deleted': '¿Eliminar este paciente? (Podrás restaurarlo después)',
        'active': '¿Reactivar este paciente?'
    };

    if (!confirm(statusMessages[newStatus])) return;

    try {
        await updateDoc(doc(db, "patients", patientId), {
            status: newStatus,
            statusChangedAt: new Date().toISOString()
        });

        // Update cache
        const patient = patientsCache.find(p => p.id === patientId);
        if (patient) patient.status = newStatus;

        // Re-render with current filter
        const activeTab = document.querySelector('.patient-tab.active');
        const currentFilter = activeTab ? activeTab.dataset.filter : 'active';
        renderPatients(currentFilter);

        const messages = {
            'inactive': 'Paciente dado de baja',
            'deleted': 'Paciente eliminado',
            'active': 'Paciente reactivado'
        };
        showToast(messages[newStatus], 'success');
    } catch (error) {
        console.error("Error changing patient status:", error);
        showToast('Error al cambiar el estado del paciente', 'error');
    }
}

// Permanently delete patient
async function deletePatientPermanently(patientId) {
    if (!confirm('¿Eliminar PERMANENTEMENTE este paciente? Esta acción NO se puede deshacer.')) return;
    if (!confirm('¿Estás completamente seguro? Se perderán todos los datos del paciente.')) return;

    try {
        await deleteDoc(doc(db, "patients", patientId));

        // Remove from cache
        patientsCache = patientsCache.filter(p => p.id !== patientId);

        renderPatients('deleted');
        showToast('Paciente eliminado permanentemente', 'success');
    } catch (error) {
        console.error("Error deleting patient:", error);
        showToast('Error al eliminar el paciente', 'error');
    }
}

// Toast notification function
function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast-notification');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast-notification ${type}`;
    toast.innerHTML = `
        <i class="ph ph-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);

    gsap.fromTo(toast,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 }
    );

    setTimeout(() => {
        gsap.to(toast, {
            y: -20,
            opacity: 0,
            duration: 0.3,
            onComplete: () => toast.remove()
        });
    }, 3000);
}

// Make functions global
window.changePatientStatus = changePatientStatus;
window.deletePatientPermanently = deletePatientPermanently;
window.openConsultationModal = openConsultationModal;
window.showToast = showToast;

function attachPatientCardListeners(filter = 'active') {
    document.querySelectorAll('.patient-card').forEach(card => {
        card.addEventListener('click', () => {
            const patientId = card.dataset.patientId;
            // Only navigate to detail for active patients
            if (filter === 'active') {
                navigateTo(`paciente/${patientId}`);
            }
        });
    });
}

// Patient Detail View
function renderPatientDetail(patientId) {
    const patient = patientsCache.find(p => p.id === patientId);

    if (!patient) {
        mainContent.innerHTML = `
            <div class="empty-state">
                <i class="ph ph-user-x"></i>
                <h3>Paciente no encontrado</h3>
                <button class="btn-primary" onclick="navigateTo('pacientes')">
                    <i class="ph ph-arrow-left"></i> Volver a Pacientes
                </button>
            </div>
        `;
        return;
    }

    // Log access to patient record
    AccessLogs.log('view_patient', { patientId, patientName: patient.name });

    const age = calculateAge(patient.birthDate);
    const patientNotes = notesCache.filter(n => n.patientId === patientId);
    const patientAppointments = appointmentsCache.filter(a => a.patientId === patientId);
    const patientPrescriptions = prescriptionsCache.filter(p => p.patientId === patientId);
    const allergies = patient.allergies ? patient.allergies.split(',').map(a => a.trim()).filter(a => a) : [];
    const conditions = patient.conditions ? patient.conditions.split(',').map(c => c.trim()).filter(c => c) : [];

    // Check if patient has allergies for prominent alert
    const hasAllergies = allergies.length > 0;

    mainContent.innerHTML = `
        ${hasAllergies ? `
            <div class="allergy-alert">
                <i class="ph ph-warning-circle"></i>
                <div class="allergy-alert-content">
                    <h4>⚠️ ALERGIAS CONOCIDAS</h4>
                    <p>
                        ${allergies.map(a => `<span class="allergy-tag">${a}</span>`).join(' ')}
                    </p>
                </div>
            </div>
        ` : ''}
        
        <header class="patient-header">
            <div class="patient-profile">
                <div class="patient-avatar">
                    <i class="ph ph-user"></i>
                </div>
                <div class="patient-details">
                    <div class="patient-name-row">
                        <h1>${patient.name}</h1>
                        <span class="patient-id">ID: ${patient.readableId || patient.id.substring(0, 8).toUpperCase()}</span>
                        ${hasAllergies ? `<span class="allergy-indicator" style="display: inline-flex; align-items: center; gap: 4px; 
                                 background: var(--bg-red-light); color: var(--color-red);
                                 padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-left: 8px;">
                            <i class="ph ph-warning"></i> ${allergies.length} Alergia${allergies.length > 1 ? 's' : ''}
                        </span>` : ''}
                    </div>
                    <div class="patient-meta">
                        <span><i class="ph ph-calendar-blank"></i> ${age} años • ${patient.sex}</span>
                        <span><i class="ph ph-clock"></i> Nac: ${formatDate(patient.birthDate)}</span>
                        <span><i class="ph ph-drop"></i> Sangre: ${patient.bloodType || 'N/A'}</span>
                        ${patient.phone ? `<span><i class="ph ph-phone"></i> ${patient.phone}</span>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="patient-allergies">
                <span class="allergy-label">ALERGIAS</span>
                <div class="allergy-tags">
                    ${allergies.length > 0
            ? allergies.map(a => `<span class="tag tag-red">${a}</span>`).join('')
            : '<span class="tag-gray">Sin alergias registradas</span>'
        }
                </div>
            </div>
        </header>

        <div class="actions-bar">
            <button class="btn-secondary" onclick="navigateTo('pacientes')">
                <i class="ph ph-arrow-left"></i> Volver
            </button>
            <button class="btn-secondary" onclick="exportPatientPDF('${patientId}')">
                <i class="ph ph-file-pdf"></i> Exportar PDF
            </button>
            <button class="btn-secondary" id="export-full-history-btn">
                <i class="ph ph-file-doc"></i> Historial Completo
            </button>
            <button class="btn-primary" id="add-note-btn">
                <i class="ph ph-plus"></i> Agregar Nota Clínica
            </button>
        </div>

        <!-- Active Medications Section -->
        ${patientPrescriptions.length > 0 ? `
            <section class="medications-section" style="margin-bottom: 24px;">
                <div class="chart-container">
                    <h3 style="margin-bottom: 16px;"><i class="ph ph-pill"></i> Medicamentos Activos</h3>
                    <div id="medications-list">
                        ${patientPrescriptions.slice(0, 5).map(rx => {
            const startDate = rx.date ? new Date(rx.date) : new Date();
            const durationDays = parseInt(rx.duration) || 7;
            const today = new Date();
            const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
            const daysRemaining = Math.max(0, durationDays - daysPassed);
            const isActive = daysRemaining > 0;

            return `
                                <div class="medication-card" style="opacity: ${isActive ? 1 : 0.6};">
                                    <div class="medication-icon">
                                        <i class="ph ph-pill"></i>
                                    </div>
                                    <div class="medication-info">
                                        <h4>${rx.medication}</h4>
                                        <p>${rx.dose} - ${rx.frequency}</p>
                                    </div>
                                    <div class="medication-status">
                                        <div class="days-left" style="color: ${isActive ? 'var(--color-teal)' : 'var(--text-secondary)'}">
                                            ${isActive ? daysRemaining : 'Fin'}
                                        </div>
                                        <div class="days-label">${isActive ? 'días restantes' : 'Tratamiento'}</div>
                                    </div>
                                </div>
                            `;
        }).join('')}
                    </div>
                </div>
            </section>
        ` : ''}

        <section class="timeline-section">
            <div class="section-title-wrapper">
                <h3 class="timeline-title">CRONOLOGÍA CLÍNICA</h3>
            </div>
            
            ${patientNotes.length > 0 ? patientNotes.map(note => renderNoteCard(note)).join('') : `
                <div style="text-align: center; color: var(--text-secondary); padding: 40px;">
                    <i class="ph ph-clipboard-text" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
                    <p>No hay notas clínicas registradas para este paciente.</p>
                </div>
            `}
        </section>
        
        <section class="vitals-section" style="margin-top: 24px;">
            <div class="chart-container">
                <h3 style="margin-bottom: 16px;">Signos Vitales</h3>
                ${(() => {
                    const patientVitals = vitalSignsCache.filter(v => v.patientId === patientId)
                        .sort((a, b) => new Date(b.recordedAt || 0) - new Date(a.recordedAt || 0));
                    const latest = patientVitals[0];
                    return `
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                        <div class="stat-card">
                            <div class="stat-icon" style="background: #fee2e2; color: #dc2626;"><i class="ph ph-heart"></i></div>
                            <div class="stat-value">${latest?.pulse || '--'}</div>
                            <div class="stat-label">Frec. Cardíaca (LPM)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: #dbeafe; color: #2563eb;"><i class="ph ph-activity"></i></div>
                            <div class="stat-value">${latest ? `${latest.systolic || '--'}/${latest.diastolic || '--'}` : '--/--'}</div>
                            <div class="stat-label">Presión Arterial</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: #fef3c7; color: #d97706;"><i class="ph ph-thermometer"></i></div>
                            <div class="stat-value">${latest?.temperature || '--'}</div>
                            <div class="stat-label">Temperatura (°C)</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon" style="background: #d1fae5; color: #059669;"><i class="ph ph-pulse"></i></div>
                            <div class="stat-value">${latest?.oxygen || '--'}</div>
                            <div class="stat-label">Saturación O2 (%)</div>
                        </div>
                    </div>
                    ${latest ? `<p style="color: var(--text-secondary); font-size: 12px; margin-top: 12px; text-align: right;">Última medición: ${formatDate(latest.recordedAt)}</p>` : ''}
                    `;
                })()}
            </div>
        </section>
        
        <section class="conditions-section" style="margin-top: 24px;">
            <div class="chart-container">
                <h3 style="margin-bottom: 16px;">Condiciones Activas</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                    ${conditions.length > 0
            ? conditions.map(c => `<span class="tag-gray">${c}</span>`).join('')
            : '<span style="color: var(--text-secondary); font-size: 13px;">Sin condiciones registradas</span>'
        }
                </div>
            </div>
        </section>
    `;

    // Event listeners
    document.getElementById('add-note-btn')?.addEventListener('click', () => {
        openNoteModal(patientId);
    });

    // Historial Completo button
    document.getElementById('export-full-history-btn')?.addEventListener('click', () => {
        exportPatientPDF(patientId);
    });
}

function renderNoteCard(note) {
    const cardClass = note.type === 'CLÍNICO' ? 'card-clinical' :
        note.type === 'LABORATORIO' ? 'card-lab' : 'card-clinical';
    const typeClass = note.type === 'CLÍNICO' ? 'type-clinical' : 'type-lab';

    return `
        <article class="timeline-card ${cardClass}">
            <div class="card-header">
                <div class="card-type ${typeClass}">${note.type}</div>
                <span class="card-time"><i class="ph ph-clock"></i> ${formatDate(note.createdAt)}</span>
                <button class="btn-more"><i class="ph ph-dots-three-vertical"></i></button>
            </div>
            <div class="card-body">
                <p>${filterClinicalContent(note.content)}</p>
            </div>
            <div class="card-footer">
                <div class="doctor-info">
                    <div class="doctor-avatar"><i class="ph ph-user"></i></div>
                    <div>
                        <span class="doc-name">${currentDoctorData?.nombre || 'Doctor'}</span>
                        <span class="doc-role">MÉDICO TRATANTE</span>
                    </div>
                </div>
                <div class="signature">
                    <span class="sig-label">Firma Digital</span>
                    <span class="sig-name">${currentDoctorData?.nombre?.split(' ').map(n => n[0]).join('') || 'Dr'}, MD</span>
                </div>
            </div>
        </article>
    `;
}

// Appointments View
function renderAppointments() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Separate into upcoming and past
    const upcoming = appointmentsCache.filter(a => new Date(a.date) >= today);
    const past = appointmentsCache.filter(a => new Date(a.date) < today);

    mainContent.innerHTML = `
        <div class="page-header">
            <h1><i class="ph ph-calendar-blank"></i>Citas</h1>
            <button class="btn-primary" id="add-appointment-btn">
                <i class="ph ph-plus"></i> Nueva Cita
            </button>
        </div>
        
        ${appointmentsCache.length > 0 ? `
            <h3 style="margin-bottom: 16px; color: var(--text-secondary); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                Próximas Citas (${upcoming.length})
            </h3>
            <div class="appointments-list" style="margin-bottom: 32px;">
                ${upcoming.length > 0
                ? upcoming.map(apt => renderAppointmentCard(apt)).join('')
                : '<p style="color: var(--text-secondary); padding: 20px;">No hay citas próximas</p>'
            }
            </div>
            
            ${past.length > 0 ? `
                <h3 style="margin-bottom: 16px; color: var(--text-secondary); font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                    Citas Pasadas (${past.length})
                </h3>
                <div class="appointments-list" style="opacity: 0.7;">
                    ${past.slice(0, 10).map(apt => renderAppointmentCard(apt)).join('')}
                </div>
            ` : ''}
        ` : `
            <div class="empty-state">
                <i class="ph ph-calendar-x"></i>
                <h3>No hay citas programadas</h3>
                <p>Agenda tu primera cita para comenzar</p>
                <button class="btn-primary" id="add-appointment-btn-empty">
                    <i class="ph ph-plus"></i> Agendar Cita
                </button>
            </div>
        `}
    `;

    // Event listeners
    document.getElementById('add-appointment-btn')?.addEventListener('click', () => openAppointmentModal());
    document.getElementById('add-appointment-btn-empty')?.addEventListener('click', () => openAppointmentModal());

    // Delete buttons
    document.querySelectorAll('.delete-appointment-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (confirm('¿Eliminar esta cita?')) {
                await deleteDoc(doc(db, "appointments", id));
                await loadAppointments();
                renderAppointments();
            }
        });
    });

    // Edit buttons
    document.querySelectorAll('.edit-appointment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            openAppointmentModal(id);
        });
    });

    // Animate
    animateContent('appointments');
}

function renderAppointmentCard(apt) {
    const patient = patientsCache.find(p => p.id === apt.patientId);
    const date = new Date(apt.date);
    const typeClass = `type-${apt.type.toLowerCase().replace(' ', '')}`;

    return `
        <div class="appointment-card">
            <div class="appointment-date-box">
                <span class="day">${date.getDate()}</span>
                <span class="month">${date.toLocaleDateString('es-ES', { month: 'short' })}</span>
            </div>
            <div class="appointment-info">
                <h4>${patient?.name || 'Paciente no encontrado'}</h4>
                <p>${apt.notes || 'Sin notas'}</p>
            </div>
            <div class="appointment-time">
                <i class="ph ph-clock"></i>
                ${formatDate(apt.date, 'time')}
            </div>
            <span class="appointment-type ${typeClass}">${apt.type}</span>
            <div class="appointment-actions">
                <button class="btn-icon edit-appointment-btn" data-id="${apt.id}" title="Editar">
                    <i class="ph ph-pencil"></i>
                </button>
                <button class="btn-icon danger delete-appointment-btn" data-id="${apt.id}" title="Eliminar">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        </div>
    `;
}

// Reports View
function renderReports() {
    mainContent.innerHTML = `
        <div class="page-header">
            <h1><i class="ph ph-clipboard-text"></i>Informes</h1>
        </div>
        
        <div class="reports-grid">
            <div class="report-card" id="report-patients">
                <i class="ph ph-users"></i>
                <h3>Resumen de Pacientes</h3>
                <p>Vista general de todos los pacientes registrados con estadísticas básicas.</p>
            </div>
            <div class="report-card" id="report-appointments">
                <i class="ph ph-calendar-check"></i>
                <h3>Reporte de Citas</h3>
                <p>Listado de citas por período con tipos de consulta.</p>
            </div>
            <div class="report-card" id="report-notes">
                <i class="ph ph-note"></i>
                <h3>Notas Clínicas</h3>
                <p>Todas las notas clínicas organizadas por tipo y fecha.</p>
            </div>
        </div>
        
        <div id="report-content" style="margin-top: 32px;"></div>
    `;

    document.getElementById('report-patients')?.addEventListener('click', renderPatientsReport);
    document.getElementById('report-appointments')?.addEventListener('click', renderAppointmentsReport);
    document.getElementById('report-notes')?.addEventListener('click', renderNotesReport);

    // Animate
    animateContent('reports');
}

function renderPatientsReport() {
    const reportContent = document.getElementById('report-content');

    // Solo mostrar pacientes activos en el informe
    const activePatients = patientsCache.filter(p => p.status === 'active' || !p.status);

    reportContent.innerHTML = `
        <div class="chart-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Resumen de Pacientes</h3>
                <button class="btn-secondary" onclick="window.print()">
                    <i class="ph ph-printer"></i> Imprimir
                </button>
            </div>
            
            <div class="stats-grid" style="margin-bottom: 24px;">
                <div class="stat-card">
                    <div class="stat-value">${activePatients.length}</div>
                    <div class="stat-label">Total Pacientes</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${activePatients.filter(p => p.sex === 'Masculino').length}</div>
                    <div class="stat-label">Masculinos</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${activePatients.filter(p => p.sex === 'Femenino').length}</div>
                    <div class="stat-label">Femeninos</div>
                </div>
            </div>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Edad</th>
                        <th>Sexo</th>
                        <th>Tipo de Sangre</th>
                        <th>Teléfono</th>
                    </tr>
                </thead>
                <tbody>
                    ${activePatients.map(p => `
                        <tr>
                            <td>${p.name}</td>
                            <td>${calculateAge(p.birthDate)} años</td>
                            <td>${p.sex}</td>
                            <td>${p.bloodType || 'N/A'}</td>
                            <td>${p.phone || 'N/A'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderAppointmentsReport() {
    const reportContent = document.getElementById('report-content');

    const typeCount = {};
    appointmentsCache.forEach(a => {
        typeCount[a.type] = (typeCount[a.type] || 0) + 1;
    });

    reportContent.innerHTML = `
        <div class="chart-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Reporte de Citas</h3>
                <button class="btn-secondary" onclick="window.print()">
                    <i class="ph ph-printer"></i> Imprimir
                </button>
            </div>
            
            <div class="stats-grid" style="margin-bottom: 24px;">
                ${Object.entries(typeCount).map(([type, count]) => `
                    <div class="stat-card">
                        <div class="stat-value">${count}</div>
                        <div class="stat-label">${type}</div>
                    </div>
                `).join('')}
            </div>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Paciente</th>
                        <th>Tipo</th>
                        <th>Notas</th>
                    </tr>
                </thead>
                <tbody>
                    ${appointmentsCache.map(a => {
        const patient = patientsCache.find(p => p.id === a.patientId);
        return `
                            <tr>
                                <td>${formatDate(a.date)}</td>
                                <td>${formatDate(a.date, 'time')}</td>
                                <td>${patient?.name || 'N/A'}</td>
                                <td>${a.type}</td>
                                <td>${filterClinicalContent(a.notes) || '-'}</td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderNotesReport() {
    const reportContent = document.getElementById('report-content');

    const typeCount = {};
    notesCache.forEach(n => {
        typeCount[n.type] = (typeCount[n.type] || 0) + 1;
    });

    reportContent.innerHTML = `
        <div class="chart-container">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h3>Notas Clínicas por Tipo</h3>
                <button class="btn-secondary" onclick="window.print()">
                    <i class="ph ph-printer"></i> Imprimir
                </button>
            </div>
            
            <div class="stats-grid" style="margin-bottom: 24px;">
                ${Object.entries(typeCount).map(([type, count]) => `
                    <div class="stat-card">
                        <div class="stat-value">${count}</div>
                        <div class="stat-label">${type}</div>
                    </div>
                `).join('')}
            </div>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Paciente</th>
                        <th>Tipo</th>
                        <th>Contenido</th>
                    </tr>
                </thead>
                <tbody>
                    ${notesCache.map(n => {
        const patient = patientsCache.find(p => p.id === n.patientId);
        return `
                            <tr>
                                <td>${formatDate(n.createdAt)}</td>
                                <td>${patient?.name || 'N/A'}</td>
                                <td>${n.type}</td>
                                <td>${filterClinicalContent(n.content).substring(0, 100)}${n.content.length > 100 ? '...' : ''}</td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Profile View
function renderProfile() {
    mainContent.innerHTML = `
        <div class="page-header">
            <h1><i class="ph ph-user-circle"></i>Mi Perfil</h1>
        </div>
        
        <div class="profile-container">
            <div class="chart-container" style="margin-bottom: 24px;">
                <h3 style="margin-bottom: 20px;">Información Personal</h3>
                
                <div style="display: flex; gap: 24px; align-items: flex-start; margin-bottom: 24px;">
                    <div style="text-align: center;">
                        <div id="profile-photo-dropzone" style="position: relative; cursor: pointer;" title="Arrastra una imagen o haz clic para cambiar">
                            <img src="${currentDoctorData?.fotoUrl || 'https://ui-avatars.com/api/?name=Dr&background=1e3a5f&color=fff'}" 
                                 alt="Foto" 
                                 id="profile-photo-preview"
                                 style="width: 120px; height: 120px; border-radius: 20px; object-fit: cover; border: 3px solid var(--primary-blue);">
                            <div style="position: absolute; bottom: 0; right: 0; background: var(--primary-blue); color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white;">
                                <i class="ph ph-camera"></i>
                            </div>
                        </div>
                        <input type="file" id="profile-file-input" accept="image/*" style="display: none;">
                        <p style="font-size: 11px; color: var(--text-secondary); margin-top: 8px;">
                            Clic o arrastra imagen
                        </p>
                        <p style="font-size: 10px; color: var(--text-secondary);">
                            ID: #${currentUser?.uid.substring(0, 8).toUpperCase() || ''}
                        </p>
                    </div>
                    <div style="flex: 1;">
                        <div id="profile-drag-area" style="border: 2px dashed var(--border-color); border-radius: 12px; padding: 24px; text-align: center; transition: all 0.2s; background: #fafafa;">
                            <i class="ph ph-upload-simple" style="font-size: 32px; color: var(--primary-blue); margin-bottom: 8px;"></i>
                            <p style="margin: 0; font-weight: 500; color: var(--text-primary);">Arrastra tu imagen aquí</p>
                            <p style="margin: 4px 0 0; font-size: 12px; color: var(--text-secondary);">o haz clic en la foto para seleccionar</p>
                            <input type="hidden" id="profile-photo-input" value="${currentDoctorData?.fotoUrl || ''}">
                        </div>
                    </div>
                </div>
                
                <div class="profile-form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <div class="form-group">
                        <label>Nombre Completo *</label>
                        <input type="text" id="profile-name-input" value="${currentDoctorData?.nombre || ''}" placeholder="Dra. María García">
                    </div>
                    <div class="form-group">
                        <label>Título / Rol</label>
                        <input type="text" id="profile-role-input" value="${currentDoctorData?.rol || ''}" placeholder="Médico General">
                    </div>
                </div>
                
                <div class="profile-form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                    <div class="form-group">
                        <label>Licencia / Exequátur</label>
                        <input type="text" id="profile-license-input" value="${currentDoctorData?.licencia || ''}" placeholder="CM-12345">
                    </div>
                    <div class="form-group">
                        <label>Especialidades</label>
                        <input type="text" id="profile-specialties-input" value="${currentDoctorData?.especialidades || ''}" placeholder="Cardiología, Medicina Interna">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Biografía Profesional</label>
                    <textarea id="profile-bio-input" rows="3" placeholder="Breve descripción de tu experiencia y especialización...">${currentDoctorData?.biografia || ''}</textarea>
                </div>
            </div>
            
            <div class="chart-container" style="margin-bottom: 24px;">
                <h3 style="margin-bottom: 20px;">Información de la Cuenta</h3>
                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" value="${currentUser?.email || ''}" disabled style="background: #f8fafc; cursor: not-allowed;">
                </div>
                <p style="color: var(--text-secondary); font-size: 13px; display: flex; align-items: center; gap: 6px;">
                    <i class="ph ph-info"></i> Para cambiar tu contraseña, cierra sesión y usa "Olvidé mi contraseña" en el login.
                </p>
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button class="btn-secondary" id="cancel-profile-btn" style="flex: 1;">
                    <i class="ph ph-arrow-left"></i> Volver
                </button>
                <button class="btn-primary" id="save-inline-profile-btn" style="flex: 2;">
                    <i class="ph ph-floppy-disk"></i> Guardar Perfil
                </button>
            </div>
        </div>
    `;

    // Photo elements
    const photoDropzone = document.getElementById('profile-photo-dropzone');
    const dragArea = document.getElementById('profile-drag-area');
    const fileInput = document.getElementById('profile-file-input');
    const photoPreview = document.getElementById('profile-photo-preview');
    const photoInput = document.getElementById('profile-photo-input');
    const cancelBtn = document.getElementById('cancel-profile-btn');

    // Click on photo to select file
    photoDropzone?.addEventListener('click', () => fileInput.click());

    // File selected via input
    fileInput?.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleProfileImage(e.target.files[0], photoPreview, photoInput);
        }
    });

    // Drag & Drop on photo
    photoDropzone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        photoDropzone.style.opacity = '0.7';
    });

    photoDropzone?.addEventListener('dragleave', () => {
        photoDropzone.style.opacity = '1';
    });

    photoDropzone?.addEventListener('drop', (e) => {
        e.preventDefault();
        photoDropzone.style.opacity = '1';
        if (e.dataTransfer.files.length) {
            handleProfileImage(e.dataTransfer.files[0], photoPreview, photoInput);
        }
    });

    // Drag & Drop on drag area
    dragArea?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragArea.style.borderColor = 'var(--primary-blue)';
        dragArea.style.background = 'rgba(42, 66, 101, 0.05)';
    });

    dragArea?.addEventListener('dragleave', () => {
        dragArea.style.borderColor = 'var(--border-color)';
        dragArea.style.background = '#fafafa';
    });

    dragArea?.addEventListener('drop', (e) => {
        e.preventDefault();
        dragArea.style.borderColor = 'var(--border-color)';
        dragArea.style.background = '#fafafa';
        if (e.dataTransfer.files.length) {
            handleProfileImage(e.dataTransfer.files[0], photoPreview, photoInput);
        }
    });

    dragArea?.addEventListener('click', () => fileInput.click());

    // Cancel button - go back to dashboard
    cancelBtn?.addEventListener('click', () => navigateTo('dashboard'));

    // Handle inline profile save
    const saveInlineProfileBtn = document.getElementById('save-inline-profile-btn');
    saveInlineProfileBtn?.addEventListener('click', async () => {
        saveInlineProfileBtn.disabled = true;
        saveInlineProfileBtn.textContent = 'Guardando...';

        const nameInput = document.getElementById('profile-name-input');
        const roleInput = document.getElementById('profile-role-input');
        const licenseInput = document.getElementById('profile-license-input');
        const specialtiesInput = document.getElementById('profile-specialties-input');
        const bioInput = document.getElementById('profile-bio-input');
        const photoInputValue = photoInput.value;

        const name = nameInput?.value.trim();

        if (!name) {
            showToast('El nombre es obligatorio', 'error');
            saveInlineProfileBtn.disabled = false;
            saveInlineProfileBtn.textContent = 'Guardar Perfil';
            return;
        }

        try {
            const newData = {
                nombre: name,
                rol: roleInput?.value.trim() || '',
                licencia: licenseInput?.value.trim() || '',
                especialidades: specialtiesInput?.value.trim() || '',
                biografia: bioInput?.value.trim() || '',
                fotoUrl: photoInputValue || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a5f&color=fff`
            };

            await setDoc(doc(db, "doctores", currentUser.uid), newData, { merge: true });
            currentDoctorData = { ...currentDoctorData, ...newData };
            updateSidebarProfile();
            showToast('Perfil actualizado correctamente', 'success');
        } catch (error) {
            console.error("Error saving profile:", error);
            showToast('Error al guardar el perfil', 'error');
        } finally {
            saveInlineProfileBtn.disabled = false;
            saveInlineProfileBtn.textContent = 'Guardar Perfil';
        }
    });

    // Animate
    animateContent('profile');
}

// Handle profile image (convert to base64)
function handleProfileImage(file, previewEl, inputEl) {
    if (!file.type.startsWith('image/')) {
        showToast('Por favor selecciona una imagen válida', 'error');
        return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB max
        showToast('La imagen es muy grande (máx 2MB)', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        if (previewEl) previewEl.src = base64;
        if (inputEl) inputEl.value = base64;
        showToast('Imagen cargada correctamente', 'success');
    };
    reader.readAsDataURL(file);
}

// ============================================================
// MEDICAL CALCULATORS VIEW
// ============================================================
function renderCalculators() {
    mainContent.innerHTML = `
        <div class="page-header">
            <h1><i class="ph ph-calculator"></i>Calculadoras Médicas</h1>
            <p style="color: var(--text-secondary); margin-top: 8px;">Herramientas de cálculo para uso clínico</p>
        </div>
        
        <div class="calculator-grid">
            <!-- BMI Calculator -->
            <div class="calculator-card">
                <h3><i class="ph ph-scales"></i> Índice de Masa Corporal (IMC)</h3>
                <div class="calc-input-group">
                    <label>Peso (kg)</label>
                    <input type="number" id="bmi-weight" placeholder="70" step="0.1">
                </div>
                <div class="calc-input-group">
                    <label>Altura (cm)</label>
                    <input type="number" id="bmi-height" placeholder="170">
                </div>
                <button class="btn-calculate" id="calc-bmi-btn">Calcular IMC</button>
                <div class="calc-result" id="bmi-result" style="display: none;"></div>
            </div>
            
            <!-- Creatinine Clearance -->
            <div class="calculator-card">
                <h3><i class="ph ph-drop"></i> Depuración de Creatinina</h3>
                <div class="calc-input-group">
                    <label>Edad (años)</label>
                    <input type="number" id="crcl-age" placeholder="45">
                </div>
                <div class="calc-input-group">
                    <label>Peso (kg)</label>
                    <input type="number" id="crcl-weight" placeholder="70" step="0.1">
                </div>
                <div class="calc-input-group">
                    <label>Creatinina sérica (mg/dL)</label>
                    <input type="number" id="crcl-creatinine" placeholder="1.0" step="0.01">
                </div>
                <div class="calc-input-group">
                    <label>Sexo</label>
                    <select id="crcl-sex">
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                    </select>
                </div>
                <button class="btn-calculate" id="calc-crcl-btn">Calcular CrCl</button>
                <div class="calc-result" id="crcl-result" style="display: none;"></div>
            </div>
            
            <!-- Pediatric Dose -->
            <div class="calculator-card">
                <h3><i class="ph ph-baby"></i> Dosis Pediátrica</h3>
                <div class="calc-input-group">
                    <label>Dosis adulto (mg)</label>
                    <input type="number" id="ped-adult-dose" placeholder="500" step="0.1">
                </div>
                <div class="calc-input-group">
                    <label>Peso del niño (kg)</label>
                    <input type="number" id="ped-weight" placeholder="20" step="0.1">
                </div>
                <button class="btn-calculate" id="calc-ped-btn">Calcular Dosis</button>
                <div class="calc-result" id="ped-result" style="display: none;"></div>
            </div>
            
            <!-- Body Surface Area -->
            <div class="calculator-card">
                <h3><i class="ph ph-person-arms-spread"></i> Superficie Corporal (BSA)</h3>
                <div class="calc-input-group">
                    <label>Altura (cm)</label>
                    <input type="number" id="bsa-height" placeholder="170">
                </div>
                <div class="calc-input-group">
                    <label>Peso (kg)</label>
                    <input type="number" id="bsa-weight" placeholder="70" step="0.1">
                </div>
                <button class="btn-calculate" id="calc-bsa-btn">Calcular BSA</button>
                <div class="calc-result" id="bsa-result" style="display: none;"></div>
            </div>
            
            <!-- Mean Arterial Pressure -->
            <div class="calculator-card">
                <h3><i class="ph ph-heart-rate"></i> Presión Arterial Media</h3>
                <div class="calc-input-group">
                    <label>Presión Sistólica (mmHg)</label>
                    <input type="number" id="map-systolic" placeholder="120">
                </div>
                <div class="calc-input-group">
                    <label>Presión Diastólica (mmHg)</label>
                    <input type="number" id="map-diastolic" placeholder="80">
                </div>
                <button class="btn-calculate" id="calc-map-btn">Calcular PAM</button>
                <div class="calc-result" id="map-result" style="display: none;"></div>
            </div>
            
            <!-- Ideal Body Weight -->
            <div class="calculator-card">
                <h3><i class="ph ph-target"></i> Peso Ideal</h3>
                <div class="calc-input-group">
                    <label>Altura (cm)</label>
                    <input type="number" id="ibw-height" placeholder="170">
                </div>
                <div class="calc-input-group">
                    <label>Sexo</label>
                    <select id="ibw-sex">
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                    </select>
                </div>
                <button class="btn-calculate" id="calc-ibw-btn">Calcular Peso Ideal</button>
                <div class="calc-result" id="ibw-result" style="display: none;"></div>
            </div>
        </div>
    `;

    // Add event listeners for calculators
    document.getElementById('calc-bmi-btn')?.addEventListener('click', () => {
        const weight = parseFloat(document.getElementById('bmi-weight').value);
        const height = parseFloat(document.getElementById('bmi-height').value);
        const resultDiv = document.getElementById('bmi-result');

        if (!weight || !height) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Complete todos los campos</p>';
            resultDiv.style.display = 'block';
            return;
        }

        const heightM = height / 100;
        const bmi = weight / (heightM * heightM);
        let interpretation, color;

        if (bmi < 18.5) { interpretation = 'Bajo peso'; color = 'var(--color-orange)'; }
        else if (bmi < 25) { interpretation = 'Peso normal'; color = 'var(--color-green)'; }
        else if (bmi < 30) { interpretation = 'Sobrepeso'; color = 'var(--color-orange)'; }
        else { interpretation = 'Obesidad'; color = 'var(--color-red)'; }

        resultDiv.innerHTML = `
            <div class="result-value" style="color: ${color}">${bmi.toFixed(1)}</div>
            <div class="result-label">kg/m²</div>
            <div class="result-interpretation" style="color: ${color}">${interpretation}</div>
        `;
        resultDiv.style.display = 'block';
    });

    document.getElementById('calc-crcl-btn')?.addEventListener('click', () => {
        const age = parseFloat(document.getElementById('crcl-age').value);
        const weight = parseFloat(document.getElementById('crcl-weight').value);
        const creatinine = parseFloat(document.getElementById('crcl-creatinine').value);
        const isFemale = document.getElementById('crcl-sex').value === 'female';
        const resultDiv = document.getElementById('crcl-result');

        if (!age || !weight || !creatinine) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Complete todos los campos</p>';
            resultDiv.style.display = 'block';
            return;
        }

        let clearance = ((140 - age) * weight) / (72 * creatinine);
        if (isFemale) clearance *= 0.85;

        let interpretation, color;
        if (clearance >= 90) { interpretation = 'Función renal normal'; color = 'var(--color-green)'; }
        else if (clearance >= 60) { interpretation = 'ERC Estadio 2'; color = 'var(--color-orange)'; }
        else if (clearance >= 30) { interpretation = 'ERC Estadio 3'; color = 'var(--color-orange)'; }
        else { interpretation = 'ERC Estadio 4-5'; color = 'var(--color-red)'; }

        resultDiv.innerHTML = `
            <div class="result-value" style="color: ${color}">${clearance.toFixed(1)}</div>
            <div class="result-label">mL/min</div>
            <div class="result-interpretation" style="color: ${color}">${interpretation}</div>
        `;
        resultDiv.style.display = 'block';
    });

    document.getElementById('calc-ped-btn')?.addEventListener('click', () => {
        const adultDose = parseFloat(document.getElementById('ped-adult-dose').value);
        const weight = parseFloat(document.getElementById('ped-weight').value);
        const resultDiv = document.getElementById('ped-result');

        if (!adultDose || !weight) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Complete todos los campos</p>';
            resultDiv.style.display = 'block';
            return;
        }

        const childDose = (weight / 70) * adultDose;

        resultDiv.innerHTML = `
            <div class="result-value">${childDose.toFixed(2)}</div>
            <div class="result-label">mg</div>
            <div class="result-interpretation">Fórmula de Clark: (${weight}kg / 70) × ${adultDose}mg</div>
        `;
        resultDiv.style.display = 'block';
    });

    document.getElementById('calc-bsa-btn')?.addEventListener('click', () => {
        const height = parseFloat(document.getElementById('bsa-height').value);
        const weight = parseFloat(document.getElementById('bsa-weight').value);
        const resultDiv = document.getElementById('bsa-result');

        if (!height || !weight) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Complete todos los campos</p>';
            resultDiv.style.display = 'block';
            return;
        }

        const bsa = Math.sqrt((height * weight) / 3600);

        resultDiv.innerHTML = `
            <div class="result-value">${bsa.toFixed(2)}</div>
            <div class="result-label">m²</div>
            <div class="result-interpretation">Fórmula de Mosteller</div>
        `;
        resultDiv.style.display = 'block';
    });

    document.getElementById('calc-map-btn')?.addEventListener('click', () => {
        const systolic = parseFloat(document.getElementById('map-systolic').value);
        const diastolic = parseFloat(document.getElementById('map-diastolic').value);
        const resultDiv = document.getElementById('map-result');

        if (!systolic || !diastolic) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Complete todos los campos</p>';
            resultDiv.style.display = 'block';
            return;
        }

        const map = diastolic + (systolic - diastolic) / 3;
        let interpretation, color;

        if (map < 60) { interpretation = 'Hipoperfusión'; color = 'var(--color-red)'; }
        else if (map <= 100) { interpretation = 'Normal'; color = 'var(--color-green)'; }
        else { interpretation = 'Elevada'; color = 'var(--color-orange)'; }

        resultDiv.innerHTML = `
            <div class="result-value" style="color: ${color}">${map.toFixed(0)}</div>
            <div class="result-label">mmHg</div>
            <div class="result-interpretation" style="color: ${color}">${interpretation}</div>
        `;
        resultDiv.style.display = 'block';
    });

    document.getElementById('calc-ibw-btn')?.addEventListener('click', () => {
        const height = parseFloat(document.getElementById('ibw-height').value);
        const isMale = document.getElementById('ibw-sex').value === 'male';
        const resultDiv = document.getElementById('ibw-result');

        if (!height) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Ingrese la altura</p>';
            resultDiv.style.display = 'block';
            return;
        }

        const heightInches = height / 2.54;
        let ibw = isMale ? 50 + 2.3 * (heightInches - 60) : 45.5 + 2.3 * (heightInches - 60);
        ibw = Math.max(ibw, 0);

        resultDiv.innerHTML = `
            <div class="result-value">${ibw.toFixed(1)}</div>
            <div class="result-label">kg</div>
            <div class="result-interpretation">Fórmula de Devine</div>
        `;
        resultDiv.style.display = 'block';
    });

    animateContent('calculators');
}

// ============================================================
// SETTINGS VIEW
// ============================================================
function renderSettings() {
    const backupReminder = BackupManager.checkAutoBackupReminder();

    mainContent.innerHTML = `
        <div class="page-header">
            <h1><i class="ph ph-gear"></i>Configuración</h1>
        </div>
        
        <!-- Backup Section -->
        <div class="backup-section">
            <h3><i class="ph ph-cloud-arrow-down"></i> Respaldo de Datos</h3>
            ${backupReminder.needsBackup ? `
                <div style="background: var(--bg-orange-light); color: var(--color-orange); padding: 12px; border-radius: 8px; margin-bottom: 16px;">
                    <i class="ph ph-warning"></i> ${backupReminder.message}
                </div>
            ` : ''}
            <p style="color: var(--text-secondary); margin-bottom: 16px;">
                Exporta todos tus datos para respaldo o importa datos de un archivo previo.
            </p>
            <div class="backup-actions">
                <button class="btn-backup export" id="export-data-btn">
                    <i class="ph ph-download"></i>
                    Exportar Todos los Datos
                </button>
                <button class="btn-backup import" id="import-data-btn">
                    <i class="ph ph-upload"></i>
                    Importar Datos
                </button>
                <input type="file" id="import-file-input" accept=".json" style="display: none;">
            </div>
            <div id="backup-status" style="margin-top: 16px;"></div>
        </div>
        
        <!-- Notifications Section -->
        <div class="backup-section">
            <h3><i class="ph ph-bell"></i> Notificaciones</h3>
            <p style="color: var(--text-secondary); margin-bottom: 16px;">
                Configura los recordatorios de citas.
            </p>
            <div style="display: flex; align-items: center; gap: 16px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                    <input type="checkbox" id="notifications-enabled" ${Notification.permission === 'granted' ? 'checked' : ''}>
                    Habilitar notificaciones push
                </label>
            </div>
            <p style="font-size: 12px; color: var(--text-secondary); margin-top: 8px;">
                Las notificaciones te recordarán citas próximas (24h, 1h, y 15min antes).
            </p>
        </div>
        
        <!-- Access Logs Section -->
        <div class="backup-section">
            <h3><i class="ph ph-clipboard-text"></i> Registro de Actividad</h3>
            <p style="color: var(--text-secondary); margin-bottom: 16px;">
                Historial de accesos y modificaciones recientes.
            </p>
            <div id="access-logs-container">
                ${renderAccessLogs()}
            </div>
        </div>
        
        <!-- Account Section -->
        <div class="backup-section">
            <h3><i class="ph ph-user-circle"></i> Cuenta</h3>
            <p style="color: var(--text-secondary); margin-bottom: 16px;">
                Información de tu cuenta de usuario.
            </p>
            <div style="background: var(--bg-main); padding: 16px; border-radius: 8px;">
                <p><strong>Email:</strong> ${currentUser?.email || 'N/A'}</p>
                <p><strong>ID de Usuario:</strong> ${currentUser?.uid?.substring(0, 12) || 'N/A'}...</p>
                <p><strong>Último acceso:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            </div>
        </div>
    `;

    // Export data
    document.getElementById('export-data-btn')?.addEventListener('click', async () => {
        try {
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                userId: currentUser.uid,
                data: {
                    patients: patientsCache,
                    appointments: appointmentsCache,
                    notes: notesCache,
                    clinicalNotes: notesCache,
                    vitalSigns: vitalSignsCache,
                    prescriptions: prescriptionsCache,
                    consultations: consultationsCache
                }
            };

            BackupManager.downloadJSON(exportData, 'medrecord-backup');
            BackupManager.setLastBackupDate();
            showToast('Datos exportados correctamente', 'success');
            AccessLogs.log('export_data', { target: 'full_backup' });
        } catch (error) {
            console.error('Error exporting:', error);
            showToast('Error al exportar datos', 'error');
        }
    });

    // Import data
    const importFileInput = document.getElementById('import-file-input');
    document.getElementById('import-data-btn')?.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput?.addEventListener('change', async (e) => {
        if (e.target.files.length) {
            try {
                const data = await BackupManager.importData(e.target.files[0]);
                const validation = BackupManager.validateImportData(data);

                if (!validation.valid) {
                    showToast('Archivo de respaldo inválido', 'error');
                    return;
                }

                // Show confirmation and execute import
                if (confirm(`¿Importar datos del ${new Date(data.exportDate).toLocaleDateString('es-ES')}? Esto sobrescribirá datos existentes con los mismos IDs.`)) {
                    showToast('Iniciando importación...', 'info');
                    
                    const batch = writeBatch(db);
                    let count = 0;
                    
                    const importCollection = (collectionName, items = []) => {
                        items.forEach(item => {
                            if (!item?.id) return;
                            const { id, ...payload } = item;
                            const ref = doc(db, collectionName, id);
                            batch.set(ref, { ...payload, userId: currentUser.uid });
                            count++;
                        });
                    };

                    importCollection('patients', data.data?.patients || []);
                    importCollection('appointments', data.data?.appointments || []);
                    importCollection('clinicalNotes', data.data?.notes || data.data?.clinicalNotes || []);
                    importCollection('vitalSigns', data.data?.vitalSigns || []);
                    importCollection('prescriptions', data.data?.prescriptions || []);
                    importCollection('consultations', data.data?.consultations || []);

                    if (count > 0) {
                        await batch.commit();
                        await loadAllData();
                        showToast(`Importación exitosa. ${count} registros restaurados.`, 'success');
                        navigateTo('dashboard');
                    } else {
                        showToast('No se encontraron datos para importar.', 'info');
                    }
                }
            } catch (error) {
                console.error('Error importing:', error);
                showToast('Error al leer el archivo', 'error');
            }
        }
    });

    // Notifications toggle
    document.getElementById('notifications-enabled')?.addEventListener('change', async (e) => {
        if (e.target.checked) {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                e.target.checked = false;
                showToast('Permiso de notificaciones denegado', 'error');
            } else {
                showToast('Notificaciones habilitadas', 'success');
            }
        }
    });

    animateContent('settings');
}

// Render access logs helper
function renderAccessLogs() {
    const logs = AccessLogs.getRecentActivity(10);

    if (logs.length === 0) {
        return `
            <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                <i class="ph ph-clipboard-text" style="font-size: 32px; opacity: 0.5;"></i>
                <p style="margin-top: 8px;">No hay actividad registrada</p>
            </div>
        `;
    }

    return logs.map(log => {
        const action = AccessLogs.formatAction(log.action);
        const target = log.details?.patientName || log.details?.target || '';

        return `
            <div class="access-log-entry">
                <div class="log-icon ${action.type}">
                    <i class="ph ph-${action.icon}"></i>
                </div>
                <div class="log-details">
                    <span class="log-action">${action.label}</span>
                    ${target ? `<span class="log-target">${target}</span>` : ''}
                </div>
                <div class="log-time">
                    ${AccessLogs.formatTimestamp(log.timestamp)}
                </div>
            </div>
        `;
    }).join('');
}

// ============================================================
// MODAL HANDLERS
// ============================================================

// Patient Modal
let editingPatientId = null;

async function openPatientModal(patientId = null) {
    editingPatientId = patientId;

    if (patientId) {
        // For editing, we now open the CONSULTATION modal instead
        openConsultationModal(patientId);
        return;
    }

    // New patient mode
    patientModalTitle.textContent = 'Agregar Nuevo Paciente';
    patientFirstname.value = '';
    patientLastname.value = '';
    patientDob.value = '';
    patientSex.value = '';
    patientPhone.value = '';
    patientProvince.value = '';
    patientReason.value = '';

    // Generate and show the ID
    const newId = await generatePatientId();
    patientIdBadge.style.display = 'flex';
    patientIdDisplay.textContent = newId;
    patientIdBadge.dataset.generatedId = newId;

    hideError(patientError);
    openModal(patientModal);
}

cancelPatientBtn?.addEventListener('click', () => closeModal(patientModal));

savePatientBtn?.addEventListener('click', async () => {
    const firstName = patientFirstname.value.trim();
    const lastName = patientLastname.value.trim();
    const dob = patientDob.value;
    const sex = patientSex.value;
    const province = patientProvince.value;
    const reason = patientReason.value.trim();

    if (!firstName || !lastName || !dob || !sex || !province || !reason) {
        showError(patientError, 'Por favor complete todos los campos obligatorios.');
        return;
    }

    savePatientBtn.disabled = true;
    savePatientBtn.textContent = 'Guardando...';

    try {
        const readableId = patientIdBadge.dataset.generatedId || `PAC-${new Date().getFullYear()}-0000`;

        const patientData = {
            userId: currentUser.uid,
            readableId: readableId,
            firstName: firstName,
            lastName: lastName,
            name: `${firstName} ${lastName}`,
            birthDate: dob,
            sex: sex,
            phone: patientPhone.value.trim(),
            province: province,
            allergies: '',
            familyHistory: '',
            conditions: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // Save the patient
        const docRef = await addDoc(collection(db, "patients"), patientData);

        // Save first consultation
        const consultationData = {
            userId: currentUser.uid,
            patientId: docRef.id,
            date: new Date().toISOString(),
            reasonForVisit: reason,
            weight: null,
            medications: '',
            allergies: '',
            familyHistory: '',
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "consultations"), consultationData);

        await loadPatients();
        await loadConsultations();
        closeModal(patientModal);
        renderPatients();
        showToast('Paciente registrado correctamente', 'success');

    } catch (error) {
        console.error("Error saving patient:", error);
        showError(patientError, 'Error al guardar el paciente.');
    } finally {
        savePatientBtn.disabled = false;
        savePatientBtn.textContent = 'Guardar Paciente';
    }
});

// ============================================================
// CONSULTATION MODAL
// ============================================================
let consultingPatientId = null;

async function openConsultationModal(patientId) {
    consultingPatientId = patientId;
    const patient = patientsCache.find(p => p.id === patientId);
    if (!patient) return;

    // Header
    const displayId = patient.readableId || patient.id.substring(0, 8).toUpperCase();
    consultPatientName.innerHTML = `<strong>${patient.name}</strong> &mdash; ID: ${displayId}`;

    // Fill patient data
    consultFirstname.value = patient.firstName || patient.name?.split(' ')[0] || '';
    consultLastname.value = patient.lastName || patient.name?.split(' ').slice(1).join(' ') || '';
    consultPhone.value = formatPhoneNumber(patient.phone || '');
    consultProvince.value = patient.province || '';
    consultDob.value = patient.birthDate || '';
    consultAllergies.value = patient.allergies || '';
    consultFamilyHistory.value = patient.familyHistory || '';

    // Age display
    if (patient.birthDate) {
        const age = calculateAge(patient.birthDate);
        consultAgeDisplay.textContent = `Edad actual: ${age} años`;
    } else {
        consultAgeDisplay.textContent = '';
    }

    // DOB change listener for live age update
    consultDob.onchange = () => {
        if (consultDob.value) {
            const age = calculateAge(consultDob.value);
            consultAgeDisplay.textContent = `Edad actual: ${age} años`;
        }
    };

    // Weight comparison
    const patientConsultations = consultationsCache
        .filter(c => c.patientId === patientId)
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

    consultWeight.value = '';
    consultReason.value = '';
    consultMedications.value = '';

    if (patientConsultations.length > 0) {
        const lastConsult = patientConsultations[0];
        if (lastConsult.weight) {
            consultWeightComparison.style.display = 'block';
            consultWeightComparison.innerHTML = `<i class="ph ph-info"></i> Último peso registrado: <strong>${lastConsult.weight} lbs</strong>`;
        } else {
            consultWeightComparison.style.display = 'none';
        }
    } else {
        consultWeightComparison.style.display = 'none';
    }

    // Weight input comparison listener
    consultWeight.oninput = () => {
        if (patientConsultations.length > 0 && patientConsultations[0].weight && consultWeight.value) {
            const prevWeight = parseFloat(patientConsultations[0].weight);
            const newWeight = parseFloat(consultWeight.value);
            const diff = newWeight - prevWeight;

            if (diff > 0) {
                consultWeightComparison.innerHTML = `<i class="ph ph-arrow-up"></i> Último: <strong>${prevWeight} lbs</strong> → Actual: <strong>${newWeight} lbs</strong> <span class="weight-up">(+${diff.toFixed(1)} lbs)</span>`;
            } else if (diff < 0) {
                consultWeightComparison.innerHTML = `<i class="ph ph-arrow-down"></i> Último: <strong>${prevWeight} lbs</strong> → Actual: <strong>${newWeight} lbs</strong> <span class="weight-down">(${diff.toFixed(1)} lbs)</span>`;
            } else {
                consultWeightComparison.innerHTML = `<i class="ph ph-equals"></i> Sin cambio: <strong>${prevWeight} lbs</strong>`;
            }
            consultWeightComparison.style.display = 'block';
        }
    };

    // Show consultation history
    if (patientConsultations.length > 0) {
        consultHistorySection.style.display = 'block';
        consultHistoryList.innerHTML = patientConsultations.slice(0, 10).map((c, i) => {
            const date = c.date ? new Date(c.date).toLocaleDateString('es-DO', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Sin fecha';
            const prevConsult = patientConsultations[i + 1];
            let weightBadge = '';

            if (c.weight && prevConsult?.weight) {
                const diff = parseFloat(c.weight) - parseFloat(prevConsult.weight);
                if (diff > 0) weightBadge = `<span class="weight-badge weight-up">↑ +${diff.toFixed(1)}</span>`;
                else if (diff < 0) weightBadge = `<span class="weight-badge weight-down">↓ ${diff.toFixed(1)}</span>`;
                else weightBadge = `<span class="weight-badge">= 0</span>`;
            }

            return `
                <div class="consultation-history-card">
                    <div class="consult-history-date">
                        <i class="ph ph-calendar"></i> ${date}
                    </div>
                    <div class="consult-history-details">
                        ${c.weight ? `<span class="consult-detail"><i class="ph ph-scales"></i> ${c.weight} lbs ${weightBadge}</span>` : ''}
                        ${c.reasonForVisit ? `<span class="consult-detail"><i class="ph ph-clipboard-text"></i> ${c.reasonForVisit.substring(0, 80)}${c.reasonForVisit.length > 80 ? '...' : ''}</span>` : ''}
                        ${c.medications ? `<span class="consult-detail"><i class="ph ph-pill"></i> ${c.medications.substring(0, 60)}${c.medications.length > 60 ? '...' : ''}</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    } else {
        consultHistorySection.style.display = 'none';
    }

    hideError(consultError);
    openModal(consultationModal);
}

cancelConsultationBtn?.addEventListener('click', () => closeModal(consultationModal));

saveConsultationBtn?.addEventListener('click', async () => {
    const reason = consultReason.value.trim();
    if (!reason) {
        showError(consultError, 'El motivo de consulta es obligatorio.');
        return;
    }

    saveConsultationBtn.disabled = true;
    saveConsultationBtn.textContent = 'Guardando...';

    try {
        const patient = patientsCache.find(p => p.id === consultingPatientId);
        if (!patient) throw new Error('Paciente no encontrado');

        // Update patient data
        const updatedPatientData = {
            firstName: consultFirstname.value.trim(),
            lastName: consultLastname.value.trim(),
            name: `${consultFirstname.value.trim()} ${consultLastname.value.trim()}`,
            phone: consultPhone.value.trim(),
            province: consultProvince.value,
            birthDate: consultDob.value || patient.birthDate,
            allergies: consultAllergies.value.trim(),
            familyHistory: consultFamilyHistory.value.trim(),
            updatedAt: serverTimestamp()
        };
        await updateDoc(doc(db, "patients", consultingPatientId), updatedPatientData);

        // Save new consultation
        const consultationData = {
            userId: currentUser.uid,
            patientId: consultingPatientId,
            date: new Date().toISOString(),
            weight: consultWeight.value ? parseFloat(consultWeight.value) : null,
            reasonForVisit: reason,
            medications: consultMedications.value.trim(),
            allergies: consultAllergies.value.trim(),
            familyHistory: consultFamilyHistory.value.trim(),
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "consultations"), consultationData);

        await loadPatients();
        await loadConsultations();
        closeModal(consultationModal);
        renderPatients();
        showToast('Consulta guardada correctamente', 'success');

    } catch (error) {
        console.error("Error saving consultation:", error);
        showError(consultError, 'Error al guardar la consulta.');
    } finally {
        saveConsultationBtn.disabled = false;
        saveConsultationBtn.textContent = 'Guardar Consulta';
    }
});

// Appointment Modal
let editingAppointmentId = null;

function openAppointmentModal(appointmentId = null) {
    editingAppointmentId = appointmentId;

    // Populate patient dropdown (only active patients)
    appointmentPatient.innerHTML = '<option value="">Seleccionar paciente...</option>';
    patientsCache.filter(p => p.status === 'active' || !p.status).forEach(p => {
        appointmentPatient.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });

    if (appointmentId) {
        const apt = appointmentsCache.find(a => a.id === appointmentId);
        if (apt) {
            appointmentModalTitle.textContent = 'Editar Cita';
            appointmentPatient.value = apt.patientId;
            const date = new Date(apt.date);
            appointmentDate.value = date.toISOString().split('T')[0];
            appointmentTime.value = date.toTimeString().slice(0, 5);
            appointmentType.value = apt.type;
            appointmentNotes.value = apt.notes || '';
        }
    } else {
        appointmentModalTitle.textContent = 'Agendar Nueva Cita';
        appointmentPatient.value = '';
        appointmentDate.value = '';
        appointmentTime.value = '';
        appointmentType.value = 'Primera vez';
        appointmentNotes.value = '';
    }

    hideError(appointmentError);
    openModal(appointmentModal);
}

cancelAppointmentBtn?.addEventListener('click', () => closeModal(appointmentModal));

saveAppointmentBtn?.addEventListener('click', async () => {
    const patientId = appointmentPatient.value;
    const date = appointmentDate.value;
    const time = appointmentTime.value;
    const type = appointmentType.value;

    if (!patientId || !date || !time) {
        showError(appointmentError, 'Por favor complete los campos obligatorios.');
        return;
    }

    saveAppointmentBtn.disabled = true;
    saveAppointmentBtn.textContent = 'Guardando...';

    try {
        const appointmentData = {
            userId: currentUser.uid,
            patientId: patientId,
            date: `${date}T${time}`,
            type: type,
            notes: appointmentNotes.value.trim(),
            updatedAt: serverTimestamp()
        };

        let savedAppointmentId = editingAppointmentId;
        if (editingAppointmentId) {
            NotificationManager.removeAppointmentReminders?.(editingAppointmentId);
            await updateDoc(doc(db, "appointments", editingAppointmentId), appointmentData);
        } else {
            appointmentData.createdAt = serverTimestamp();
            const docRef = await addDoc(collection(db, "appointments"), appointmentData);
            savedAppointmentId = docRef.id;
        }

        const patient = patientsCache.find(p => p.id === patientId);
        NotificationManager.scheduleAppointmentReminder?.({
            id: savedAppointmentId,
            patientId,
            patientName: patient?.name || 'Paciente',
            type,
            date,
            time
        });

        await loadAppointments();
        closeModal(appointmentModal);
        renderAppointments();

    } catch (error) {
        console.error("Error saving appointment:", error);
        showError(appointmentError, 'Error al guardar la cita.');
    } finally {
        saveAppointmentBtn.disabled = false;
        saveAppointmentBtn.textContent = 'Guardar Cita';
    }
});

// Note Modal
let noteForPatientId = null;

function openNoteModal(patientId = null) {
    noteForPatientId = patientId;

    // Populate patient dropdown
    notePatient.innerHTML = '<option value="">Seleccionar paciente...</option>';
    patientsCache.forEach(p => {
        const selected = p.id === patientId ? 'selected' : '';
        notePatient.innerHTML += `<option value="${p.id}" ${selected}>${p.name}</option>`;
    });

    if (patientId) {
        notePatient.value = patientId;
        notePatient.disabled = true;
    } else {
        notePatient.disabled = false;
    }

    noteType.value = 'CLÍNICO';
    noteContent.value = '';

    hideError(noteError);
    openModal(noteModal);
}

cancelNoteBtn?.addEventListener('click', () => closeModal(noteModal));

saveNoteBtn?.addEventListener('click', async () => {
    const patientId = notePatient.value;
    const type = noteType.value;
    const content = noteContent.value.trim();

    if (!patientId || !content) {
        showError(noteError, 'Por favor complete los campos obligatorios.');
        return;
    }

    saveNoteBtn.disabled = true;
    saveNoteBtn.textContent = 'Guardando...';

    try {
        await addDoc(collection(db, "clinicalNotes"), {
            userId: currentUser.uid,
            patientId: patientId,
            type: type,
            content: content, // Save raw content; filter only on display
            doctorName: currentDoctorData?.nombre || 'Doctor',
            createdAt: serverTimestamp()
        });

        await loadNotes();
        closeModal(noteModal);

        // Refresh current view
        if (currentRoute.startsWith('paciente/')) {
            renderPatientDetail(patientId);
        } else {
            renderDashboard();
        }

    } catch (error) {
        console.error("Error saving note:", error);
        showError(noteError, 'Error al guardar la nota.');
    } finally {
        saveNoteBtn.disabled = false;
        saveNoteBtn.textContent = 'Guardar Nota';
    }
});

// Profile - Navigate to profile view
userProfileBtn?.addEventListener('click', () => {
    if (!currentUser) return;
    navigateTo('perfil');
});

// Save profile button handler (for profile view in main content)
saveProfileBtn?.addEventListener('click', async () => {
    const nameInput = document.getElementById('profile-name-input');
    const roleInput = document.getElementById('profile-role-input');
    const licenseInput = document.getElementById('profile-license-input');
    const specialtiesInput = document.getElementById('profile-specialties-input');
    const bioInput = document.getElementById('profile-bio-input');
    const photoInput = document.getElementById('profile-photo-input');
    const saveBtn = document.getElementById('save-profile-btn');

    const name = nameInput?.value.trim();

    if (!name) {
        showToast('El nombre es obligatorio', 'error');
        return;
    }

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando...';
    }

    try {
        const newData = {
            nombre: name,
            rol: roleInput?.value.trim() || '',
            licencia: licenseInput?.value.trim() || '',
            especialidades: specialtiesInput?.value.trim() || '',
            biografia: bioInput?.value.trim() || '',
            fotoUrl: photoInput?.value.trim() ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e3a5f&color=fff`
        };

        await setDoc(doc(db, "doctores", currentUser.uid), newData, { merge: true });
        currentDoctorData = { ...currentDoctorData, ...newData };
        updateSidebarProfile();

        showToast('Perfil actualizado correctamente', 'success');

    } catch (error) {
        console.error("Error saving profile:", error);
        showToast('Error al guardar el perfil', 'error');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Guardar Perfil';
        }
    }
});

// ============================================================
// ANIMATIONS - Sistema limpio y funcional
// ============================================================

// Animación de entrada de la app (solo una vez al login)
function animateAppEntrance() {
    gsap.set(".sidebar, .main-content", { opacity: 1 }); // Reset

    gsap.from(".sidebar", {
        x: -30,
        opacity: 0,
        duration: 0.4,
        ease: "power2.out"
    });

    gsap.from(".main-content", {
        opacity: 0,
        duration: 0.4,
        delay: 0.2,
        ease: "power2.out"
    });
}

// Animación de contenido según la vista actual
function animateContent(type) {
    // Dar tiempo al DOM para renderizar
    requestAnimationFrame(() => {
        switch (type) {
            case 'dashboard':
                animateDashboard();
                break;
            case 'patients':
                animatePatients();
                break;
            case 'appointments':
                animateAppointments();
                break;
            case 'reports':
                animateReports();
                break;
            case 'vitals':
                animateVitals();
                break;
            case 'settings':
                animateSettings();
                break;
        }
    });
}

function animateDashboard() {
    const cards = document.querySelectorAll('.stat-card');
    const charts = document.querySelectorAll('.chart-container');

    if (cards.length) {
        gsap.fromTo(cards,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, stagger: 0.08, ease: "power2.out" }
        );
    }

    if (charts.length) {
        gsap.fromTo(charts,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, delay: 0.2, stagger: 0.1, ease: "power2.out" }
        );
    }
}

function animatePatients() {
    const cards = document.querySelectorAll('.patient-card');
    if (cards.length) {
        gsap.fromTo(cards,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
        );
    }
}

function animateAppointments() {
    const cards = document.querySelectorAll('.appointment-card');
    if (cards.length) {
        gsap.fromTo(cards,
            { x: -15, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
        );
    }
}

function animateReports() {
    const cards = document.querySelectorAll('.report-card');
    if (cards.length) {
        gsap.fromTo(cards,
            { scale: 0.95, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.3, stagger: 0.08, ease: "power2.out" }
        );
    }
}

function animateVitals() {
    const cards = document.querySelectorAll('.vitals-patient-card');
    if (cards.length) {
        gsap.fromTo(cards,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
        );
    }
}

function animateSettings() {
    const sections = document.querySelectorAll('.settings-section');
    if (sections.length) {
        gsap.fromTo(sections,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
        );
    }
}

// ============================================================
// VITAL SIGNS MODULE
// ============================================================
async function loadVitalSigns() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, "vitalSigns"),
            where("userId", "==", currentUser.uid),
            orderBy("recordedAt", "desc")
        );
        const snapshot = await getDocs(q);
        vitalSignsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error loading vital signs:", error);
        vitalSignsCache = [];
    }
}

function renderVitalSigns() {
    const activePatients = patientsCache.filter(p => p.status === 'active' || !p.status);

    mainContent.innerHTML = `
        <div class="page-header">
            <h1><i class="ph ph-heartbeat"></i>Signos Vitales</h1>
            <button class="btn-primary" id="add-vitals-btn">
                <i class="ph ph-plus"></i> Registrar Signos
            </button>
        </div>
        
        <div class="content-search">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" id="vitals-search" placeholder="Buscar paciente...">
        </div>
        
        ${activePatients.length > 0 ? `
            <div class="vitals-grid" id="vitals-list">
                ${activePatients.map(patient => renderVitalPatientCard(patient)).join('')}
            </div>
        ` : `
            <div class="empty-state">
                <i class="ph ph-heartbeat"></i>
                <h3>No hay pacientes</h3>
                <p>Agrega pacientes para registrar sus signos vitales</p>
            </div>
        `}
    `;

    document.getElementById('add-vitals-btn')?.addEventListener('click', () => openVitalsModal());

    document.getElementById('vitals-search')?.addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        const filtered = activePatients.filter(p => p.name.toLowerCase().includes(search));
        const listEl = document.getElementById('vitals-list');
        if (listEl) {
            listEl.innerHTML = filtered.map(p => renderVitalPatientCard(p)).join('');
        }
    });

    animateContent('vitals');
}

function renderVitalPatientCard(patient) {
    const patientVitals = vitalSignsCache.filter(v => v.patientId === patient.id).slice(0, 1)[0];
    const age = calculateAge(patient.birthDate);

    return `
        <div class="vitals-patient-card" data-patient-id="${patient.id}">
            <div class="vitals-patient-header">
                <div class="patient-avatar"><i class="ph ph-user"></i></div>
                <div class="patient-info">
                    <h3>${patient.name}</h3>
                    <p>${age} años • ${patient.sex}</p>
                </div>
            </div>
            ${patientVitals ? `
                <div class="vitals-summary">
                    <div class="vital-item">
                        <i class="ph ph-heart"></i>
                        <span class="vital-label">P/A</span>
                        <span class="vital-value">${patientVitals.systolic || '-'}/${patientVitals.diastolic || '-'}</span>
                    </div>
                    <div class="vital-item">
                        <i class="ph ph-activity"></i>
                        <span class="vital-label">Pulso</span>
                        <span class="vital-value">${patientVitals.pulse || '-'} bpm</span>
                    </div>
                    <div class="vital-item">
                        <i class="ph ph-thermometer"></i>
                        <span class="vital-label">Temp</span>
                        <span class="vital-value">${patientVitals.temperature || '-'}°C</span>
                    </div>
                    <div class="vital-item">
                        <i class="ph ph-scales"></i>
                        <span class="vital-label">Peso</span>
                        <span class="vital-value">${patientVitals.weight || '-'} kg</span>
                    </div>
                </div>
                <p class="vitals-date">Última medición: ${formatDate(patientVitals.recordedAt)}</p>
            ` : `
                <div class="no-vitals"><p>Sin registros de signos vitales</p></div>
            `}
            <div class="vitals-actions">
                <button class="btn-secondary btn-small" onclick="openVitalsModal('${patient.id}')">
                    <i class="ph ph-plus"></i> Registrar
                </button>
            </div>
        </div>
    `;
}

function openVitalsModal(patientId = null) {
    let modal = document.getElementById('vitals-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'vitals-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-box modal-lg">
                <div class="modal-header">
                    <h2><i class="ph ph-heartbeat"></i> Registrar Signos Vitales</h2>
                    <button class="modal-close" onclick="closeModal(document.getElementById('vitals-modal'))">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Paciente *</label>
                        <select id="vital-patient" class="form-select"></select>
                    </div>
                    <div class="vitals-form-grid">
                        <div class="form-group">
                            <label>Presión Sistólica (mmHg)</label>
                            <input type="number" id="vital-systolic" placeholder="120">
                        </div>
                        <div class="form-group">
                            <label>Presión Diastólica (mmHg)</label>
                            <input type="number" id="vital-diastolic" placeholder="80">
                        </div>
                        <div class="form-group">
                            <label>Pulso (bpm)</label>
                            <input type="number" id="vital-pulse" placeholder="72">
                        </div>
                        <div class="form-group">
                            <label>Temperatura (°C)</label>
                            <input type="number" id="vital-temperature" placeholder="36.5" step="0.1">
                        </div>
                        <div class="form-group">
                            <label>Peso (kg)</label>
                            <input type="number" id="vital-weight" placeholder="70" step="0.1">
                        </div>
                        <div class="form-group">
                            <label>Saturación O₂ (%)</label>
                            <input type="number" id="vital-oxygen" placeholder="98">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Observaciones</label>
                        <textarea id="vital-notes" rows="2" placeholder="Notas adicionales..."></textarea>
                    </div>
                    <div id="vitals-error" class="error-message" style="display: none;"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal(document.getElementById('vitals-modal'))">Cancelar</button>
                    <button class="btn-primary" id="save-vitals-btn"><i class="ph ph-check"></i> Guardar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('save-vitals-btn').addEventListener('click', saveVitalSigns);
    }

    const activePatients = patientsCache.filter(p => p.status === 'active' || !p.status);
    document.getElementById('vital-patient').innerHTML = `
        <option value="">Seleccionar paciente</option>
        ${activePatients.map(p => `<option value="${p.id}" ${patientId === p.id ? 'selected' : ''}>${p.name}</option>`).join('')}
    `;

    document.getElementById('vital-systolic').value = '';
    document.getElementById('vital-diastolic').value = '';
    document.getElementById('vital-pulse').value = '';
    document.getElementById('vital-temperature').value = '';
    document.getElementById('vital-weight').value = '';
    document.getElementById('vital-oxygen').value = '';
    document.getElementById('vital-notes').value = '';

    openModal(modal);
}

async function saveVitalSigns() {
    const patientId = document.getElementById('vital-patient').value;
    if (!patientId) {
        showError(document.getElementById('vitals-error'), 'Selecciona un paciente');
        return;
    }

    const vitalsData = {
        userId: currentUser.uid,
        patientId,
        systolic: document.getElementById('vital-systolic').value ? Number(document.getElementById('vital-systolic').value) : null,
        diastolic: document.getElementById('vital-diastolic').value ? Number(document.getElementById('vital-diastolic').value) : null,
        pulse: document.getElementById('vital-pulse').value ? Number(document.getElementById('vital-pulse').value) : null,
        temperature: document.getElementById('vital-temperature').value ? Number(document.getElementById('vital-temperature').value) : null,
        weight: document.getElementById('vital-weight').value ? Number(document.getElementById('vital-weight').value) : null,
        oxygen: document.getElementById('vital-oxygen').value ? Number(document.getElementById('vital-oxygen').value) : null,
        notes: document.getElementById('vital-notes').value.trim(),
        recordedAt: serverTimestamp()
    };

    try {
        const docRef = await addDoc(collection(db, "vitalSigns"), vitalsData);
        vitalSignsCache.unshift({ id: docRef.id, ...vitalsData, recordedAt: new Date() });
        closeModal(document.getElementById('vitals-modal'));
        showToast('Signos vitales registrados', 'success');
        renderVitalSigns();
    } catch (error) {
        console.error("Error saving vital signs:", error);
        showToast('Error al guardar', 'error');
    }
}

// ============================================================
// PRESCRIPTIONS MODULE
// ============================================================
async function loadPrescriptions() {
    if (!currentUser) return;

    try {
        const q = query(
            collection(db, "prescriptions"),
            where("userId", "==", currentUser.uid),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        prescriptionsCache = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error loading prescriptions:", error);
        prescriptionsCache = [];
    }
}

function renderPrescriptions() {
    mainContent.innerHTML = `
        <div class="page-header">
            <h1><i class="ph ph-prescription"></i>Recetas Médicas</h1>
            <button class="btn-primary" id="add-prescription-btn">
                <i class="ph ph-plus"></i> Nueva Receta
            </button>
        </div>
        
        <div class="content-search">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" id="prescription-search" placeholder="Buscar por paciente...">
        </div>
        
        ${prescriptionsCache.length > 0 ? `
            <div class="prescriptions-list" id="prescriptions-list">
                ${prescriptionsCache.map(rx => renderPrescriptionCard(rx)).join('')}
            </div>
        ` : `
            <div class="empty-state">
                <i class="ph ph-prescription"></i>
                <h3>No hay recetas</h3>
                <p>Crea una nueva receta médica</p>
            </div>
        `}
    `;

    document.getElementById('add-prescription-btn')?.addEventListener('click', () => openPrescriptionModal());

    document.getElementById('prescription-search')?.addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        const filtered = prescriptionsCache.filter(rx => {
            const patient = patientsCache.find(p => p.id === rx.patientId);
            return patient?.name.toLowerCase().includes(search);
        });
        const listEl = document.getElementById('prescriptions-list');
        if (listEl) listEl.innerHTML = filtered.map(rx => renderPrescriptionCard(rx)).join('');
    });

    animateContent('prescriptions');
}

function renderPrescriptionCard(rx) {
    const patient = patientsCache.find(p => p.id === rx.patientId);
    const medCount = rx.medications?.length || 0;

    return `
        <div class="prescription-card">
            <div class="prescription-header">
                <div class="prescription-patient">
                    <i class="ph ph-user"></i>
                    <div>
                        <h3>${patient?.name || 'Paciente'}</h3>
                        <span class="prescription-date">${formatDate(rx.createdAt)}</span>
                    </div>
                </div>
                <span class="prescription-badge">${medCount} medicamento${medCount !== 1 ? 's' : ''}</span>
            </div>
            <div class="prescription-medications">
                ${rx.medications?.slice(0, 3).map(med => `
                    <div class="medication-item">
                        <i class="ph ph-pill"></i>
                        <span><strong>${med.name}</strong> - ${med.dosage || ''}</span>
                    </div>
                `).join('') || '<p>Sin medicamentos</p>'}
            </div>
            ${rx.diagnosis ? `<div class="prescription-diagnosis"><strong>Diagnóstico:</strong> ${rx.diagnosis}</div>` : ''}
            <div class="prescription-actions">
                <button class="btn-icon" onclick="printPrescription('${rx.id}')" title="Imprimir">
                    <i class="ph ph-printer"></i>
                </button>
                <button class="btn-icon danger" onclick="deletePrescription('${rx.id}')" title="Eliminar">
                    <i class="ph ph-trash"></i>
                </button>
            </div>
        </div>
    `;
}

function openPrescriptionModal() {
    let modal = document.getElementById('prescription-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'prescription-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-box modal-lg">
                <div class="modal-header">
                    <h2><i class="ph ph-prescription"></i> Nueva Receta</h2>
                    <button class="modal-close" onclick="closeModal(document.getElementById('prescription-modal'))">
                        <i class="ph ph-x"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Paciente *</label>
                        <select id="rx-patient" class="form-select"></select>
                    </div>
                    <div class="form-group">
                        <label>Diagnóstico</label>
                        <input type="text" id="rx-diagnosis" placeholder="Ej: Infección respiratoria">
                    </div>
                    <div class="medications-section">
                        <div class="section-header">
                            <h4><i class="ph ph-pill"></i> Medicamentos</h4>
                            <button type="button" class="btn-secondary btn-small" id="add-med-btn">
                                <i class="ph ph-plus"></i> Agregar
                            </button>
                        </div>
                        <div id="medications-list"></div>
                    </div>
                    <div class="form-group">
                        <label>Instrucciones</label>
                        <textarea id="rx-instructions" rows="2" placeholder="Indicaciones especiales..."></textarea>
                    </div>
                    <div id="rx-error" class="error-message" style="display: none;"></div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeModal(document.getElementById('prescription-modal'))">Cancelar</button>
                    <button class="btn-primary" id="save-rx-btn"><i class="ph ph-check"></i> Guardar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        document.getElementById('save-rx-btn').addEventListener('click', savePrescription);
        document.getElementById('add-med-btn').addEventListener('click', addMedicationRow);
    }

    const activePatients = patientsCache.filter(p => p.status === 'active' || !p.status);
    document.getElementById('rx-patient').innerHTML = `
        <option value="">Seleccionar paciente</option>
        ${activePatients.map(p => `<option value="${p.id}">${p.name}</option>`).join('')}
    `;

    document.getElementById('rx-diagnosis').value = '';
    document.getElementById('rx-instructions').value = '';
    document.getElementById('medications-list').innerHTML = '';
    addMedicationRow();

    openModal(modal);
}

function addMedicationRow() {
    const container = document.getElementById('medications-list');
    const row = document.createElement('div');
    row.className = 'medication-row';
    row.innerHTML = `
        <div class="medication-fields">
            <input type="text" class="med-name" placeholder="Medicamento *">
            <input type="text" class="med-dosage" placeholder="Dosis">
            <input type="text" class="med-frequency" placeholder="Frecuencia">
            <input type="text" class="med-duration" placeholder="Duración">
        </div>
        <button type="button" class="btn-icon danger" onclick="this.closest('.medication-row').remove()">
            <i class="ph ph-trash"></i>
        </button>
    `;
    container.appendChild(row);
}

async function savePrescription() {
    const patientId = document.getElementById('rx-patient').value;
    if (!patientId) {
        showError(document.getElementById('rx-error'), 'Selecciona un paciente');
        return;
    }

    const medications = [];
    document.querySelectorAll('.medication-row').forEach(row => {
        const name = row.querySelector('.med-name').value.trim();
        if (name) {
            medications.push({
                name,
                dosage: row.querySelector('.med-dosage').value.trim(),
                frequency: row.querySelector('.med-frequency').value.trim(),
                duration: row.querySelector('.med-duration').value.trim()
            });
        }
    });

    if (medications.length === 0) {
        showError(document.getElementById('rx-error'), 'Agrega al menos un medicamento');
        return;
    }

    const rxData = {
        userId: currentUser.uid,
        patientId,
        diagnosis: document.getElementById('rx-diagnosis').value.trim(),
        medications,
        instructions: document.getElementById('rx-instructions').value.trim(),
        doctorName: currentDoctorData?.nombre || 'Doctor',
        doctorLicense: currentDoctorData?.licencia || '',
        createdAt: serverTimestamp()
    };

    try {
        const docRef = await addDoc(collection(db, "prescriptions"), rxData);
        prescriptionsCache.unshift({ id: docRef.id, ...rxData, createdAt: new Date() });
        closeModal(document.getElementById('prescription-modal'));
        showToast('Receta guardada', 'success');
        renderPrescriptions();
    } catch (error) {
        console.error("Error saving prescription:", error);
        showToast('Error al guardar', 'error');
    }
}

function printPrescription(rxId) {
    const rx = prescriptionsCache.find(r => r.id === rxId);
    if (!rx) return;

    const patient = patientsCache.find(p => p.id === rx.patientId);

    const printContent = `
        <!DOCTYPE html>
        <html><head><title>Receta - ${patient?.name}</title>
        <style>
            body { font-family: serif; padding: 40px; max-width: 700px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 20px; }
            .header h1 { color: #1e3a5f; margin: 0 0 10px; }
            .patient { margin-bottom: 20px; padding: 15px; background: #f5f5f5; }
            .meds h3 { color: #1e3a5f; }
            .meds ol { padding-left: 25px; }
            .meds li { margin: 10px 0; }
            .signature { margin-top: 50px; text-align: center; }
            .signature-line { width: 200px; border-top: 1px solid #000; margin: 0 auto 10px; }
        </style></head><body>
            <div class="header">
                <h1>RECETA MÉDICA</h1>
                <p>${rx.doctorName}</p>
                ${rx.doctorLicense ? `<p>Cédula: ${rx.doctorLicense}</p>` : ''}
            </div>
            <div class="patient">
                <p><strong>Paciente:</strong> ${patient?.name || 'N/A'}</p>
                <p><strong>Fecha:</strong> ${formatDate(rx.createdAt, 'full')}</p>
                ${rx.diagnosis ? `<p><strong>Diagnóstico:</strong> ${rx.diagnosis}</p>` : ''}
            </div>
            <div class="meds">
                <h3>Rp/</h3>
                <ol>
                    ${rx.medications.map(m => `<li><strong>${m.name}</strong> ${m.dosage ? `- ${m.dosage}` : ''}<br>${m.frequency ? m.frequency : ''} ${m.duration ? `por ${m.duration}` : ''}</li>`).join('')}
                </ol>
            </div>
            ${rx.instructions ? `<p><strong>Indicaciones:</strong> ${rx.instructions}</p>` : ''}
            <div class="signature">
                <div class="signature-line"></div>
                <p>${rx.doctorName}</p>
            </div>
        </body></html>
    `;

    const w = window.open('', '_blank');
    w.document.write(printContent);
    w.document.close();
    setTimeout(() => w.print(), 300);
}

async function deletePrescription(rxId) {
    if (!confirm('¿Eliminar esta receta?')) return;

    try {
        await deleteDoc(doc(db, "prescriptions", rxId));
        prescriptionsCache = prescriptionsCache.filter(r => r.id !== rxId);
        showToast('Receta eliminada', 'success');
        renderPrescriptions();
    } catch (error) {
        showToast('Error al eliminar', 'error');
    }
}

// ==========================================
// EXPORT PDF FUNCTIONALITY
// ==========================================

function exportPatientPDF(patientId) {
    const patient = patientsCache.find(p => p.id === patientId);
    if (!patient) {
        showToast('Paciente no encontrado', 'error');
        return;
    }

    const patientNotes = notesCache.filter(n => n.patientId === patientId);
    const patientVitals = vitalSignsCache.filter(v => v.patientId === patientId);
    const patientRx = prescriptionsCache.filter(r => r.patientId === patientId);
    const age = calculateAge(patient.birthDate);

    const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Expediente - ${patient.name}</title>
            <style>
                @page { size: A4; margin: 2cm; }
                body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.5; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
                .header { text-align: center; border-bottom: 3px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { color: #1e3a5f; margin: 0 0 5px; font-size: 24px; }
                .header .subtitle { color: #666; font-size: 12px; }
                .patient-info { background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
                .patient-info h2 { color: #1e3a5f; margin: 0 0 15px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
                .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                .info-item { font-size: 13px; }
                .info-item label { font-weight: 600; color: #64748b; }
                .section { margin-bottom: 25px; page-break-inside: avoid; }
                .section h3 { color: #1e3a5f; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
                .note-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; margin-bottom: 10px; }
                .note-card .date { color: #64748b; font-size: 12px; margin-bottom: 8px; }
                .note-card .type { background: #1e3a5f; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
                .vitals-table, .meds-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                .vitals-table th, .vitals-table td, .meds-table th, .meds-table td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; }
                .vitals-table th, .meds-table th { background: #1e3a5f; color: white; }
                .allergy-tag { background: #fee2e2; color: #dc2626; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-right: 5px; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #64748b; font-size: 11px; }
                @media print {
                    body { padding: 0; }
                    .header { page-break-after: avoid; }
                    .section { page-break-inside: avoid; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${currentDoctorData?.consultorio || 'Consultorio Médico'}</h1>
                <p class="subtitle">${currentDoctorData?.nombre || 'Doctor'} • Lic. ${currentDoctorData?.licencia || 'N/A'}</p>
                <p class="subtitle">Generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div class="patient-info">
                <h2>Datos del Paciente</h2>
                <div class="info-grid">
                    <div class="info-item"><label>Nombre:</label> ${patient.name}</div>
                    <div class="info-item"><label>Edad:</label> ${age} años</div>
                    <div class="info-item"><label>Sexo:</label> ${patient.sex}</div>
                    <div class="info-item"><label>Tipo de Sangre:</label> ${patient.bloodType || 'N/A'}</div>
                    <div class="info-item"><label>Teléfono:</label> ${patient.phone || 'N/A'}</div>
                    <div class="info-item"><label>Email:</label> ${patient.email || 'N/A'}</div>
                    <div class="info-item"><label>Fecha de Nacimiento:</label> ${formatDate(patient.birthDate)}</div>
                    <div class="info-item"><label>Ocupación:</label> ${patient.occupation || 'N/A'}</div>
                </div>
                ${patient.allergies ? `
                    <div style="margin-top: 15px;">
                        <label style="font-weight: 600; color: #dc2626;">Alergias:</label>
                        ${patient.allergies.split(',').map(a => `<span class="allergy-tag">${a.trim()}</span>`).join('')}
                    </div>
                ` : ''}
                ${patient.conditions ? `
                    <div style="margin-top: 10px;">
                        <label style="font-weight: 600; color: #64748b;">Condiciones:</label>
                        ${patient.conditions}
                    </div>
                ` : ''}
            </div>
            
            ${patientVitals.length > 0 ? `
                <div class="section">
                    <h3>Historial de Signos Vitales</h3>
                    <table class="vitals-table">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Presión</th>
                                <th>FC</th>
                                <th>Temp</th>
                                <th>Sat O2</th>
                                <th>Peso</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${patientVitals.slice(0, 10).map(v => `
                                <tr>
                                    <td>${formatDate(v.recordedAt)}</td>
                                    <td>${v.systolic || '--'}/${v.diastolic || '--'}</td>
                                    <td>${v.pulse ?? v.heartRate ?? '--'}</td>
                                    <td>${v.temperature || '--'}°C</td>
                                    <td>${v.oxygen ?? v.oxygenSat ?? v.oxygenSaturation ?? '--'}%</td>
                                    <td>${v.weight || '--'} kg</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : ''}
            
            ${patientNotes.length > 0 ? `
                <div class="section">
                    <h3>Notas Clínicas (${patientNotes.length})</h3>
                    ${patientNotes.map(note => `
                        <div class="note-card">
                            <div class="date">
                                ${formatDate(note.createdAt)}
                                <span class="type">${note.type || 'Consulta'}</span>
                            </div>
                            ${note.subjective ? `<p><strong>Subjetivo:</strong> ${note.subjective}</p>` : ''}
                            ${note.objective ? `<p><strong>Objetivo:</strong> ${note.objective}</p>` : ''}
                            ${note.assessment ? `<p><strong>Evaluación:</strong> ${note.assessment}</p>` : ''}
                            ${note.plan ? `<p><strong>Plan:</strong> ${note.plan}</p>` : ''}
                            ${note.diagnosis ? `<p><strong>Diagnóstico:</strong> ${note.diagnosis}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${patientRx.length > 0 ? `
                <div class="section">
                    <h3>Recetas Médicas (${patientRx.length})</h3>
                    ${patientRx.map(rx => `
                        <div class="note-card">
                            <div class="date">${formatDate(rx.createdAt)}</div>
                            ${rx.diagnosis ? `<p><strong>Diagnóstico:</strong> ${rx.diagnosis}</p>` : ''}
                            <table class="meds-table">
                                <thead><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Duración</th></tr></thead>
                                <tbody>
                                    ${rx.medications?.map(m => `
                                        <tr>
                                            <td>${m.name}</td>
                                            <td>${m.dosage || '-'}</td>
                                            <td>${m.frequency || '-'}</td>
                                            <td>${m.duration || '-'}</td>
                                        </tr>
                                    `).join('') || ''}
                                </tbody>
                            </table>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="footer">
                <p>Este documento es un resumen del expediente clínico generado por MedRecord Pro</p>
                <p>Documento generado automáticamente • ${new Date().toISOString()}</p>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(pdfContent);
    printWindow.document.close();

    setTimeout(() => {
        printWindow.print();
        showToast('Abre el diálogo de impresión para guardar como PDF', 'info');
    }, 500);
}

// Make functions globally available
window.navigateTo = navigateTo;
window.animateContent = animateContent;
window.openPatientModal = openPatientModal;
window.openVitalsModal = openVitalsModal;
window.openPrescriptionModal = openPrescriptionModal;
window.printPrescription = printPrescription;
window.deletePrescription = deletePrescription;
window.exportPatientPDF = exportPatientPDF;

// Initialize
console.log("MedRecord Pro initialized");
