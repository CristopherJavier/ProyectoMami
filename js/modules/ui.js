// ============================================================
// MedRecord Pro - UI Functions (Modals, Toasts, Animations)
// ============================================================

import { state } from './state.js';

/**
 * Show error message in element
 */
export function showError(element, message) {
    if (!element) return;
    element.textContent = message;
    element.style.display = 'block';
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), 500);
}

/**
 * Hide error message
 */
export function hideError(element) {
    if (!element) return;
    element.style.display = 'none';
}

/**
 * Open modal with animation
 */
export function openModal(modal) {
    if (!modal) return;
    modal.style.display = 'flex';
    gsap.fromTo(modal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(modal.querySelector('.modal-box'), 
        { scale: 0.9, y: 20 }, 
        { scale: 1, y: 0, duration: 0.3, ease: "back.out(1.5)" }
    );
}

/**
 * Close modal with animation
 */
export function closeModal(modal, callback) {
    if (!modal) return;
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

/**
 * Show toast notification
 */
export function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();
    
    const icons = {
        success: 'check-circle',
        error: 'x-circle',
        warning: 'warning',
        info: 'info'
    };
    
    const colors = {
        success: '#22c55e',
        error: '#ef4444',
        warning: '#f97316',
        info: '#3b82f6'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.innerHTML = `
        <i class="ph ph-${icons[type]}" style="color: ${colors[type]}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    gsap.fromTo(toast,
        { x: 100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
    );
    
    setTimeout(() => {
        gsap.to(toast, {
            x: 100,
            opacity: 0,
            duration: 0.3,
            onComplete: () => toast.remove()
        });
    }, 3000);
}

/**
 * Show loading overlay
 */
export function showLoading(message = 'Cargando...') {
    let overlay = document.getElementById('loading-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p class="loading-message">${message}</p>
            </div>
        `;
        document.body.appendChild(overlay);
    } else {
        overlay.querySelector('.loading-message').textContent = message;
    }
    overlay.style.display = 'flex';
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.2 });
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        gsap.to(overlay, {
            opacity: 0,
            duration: 0.2,
            onComplete: () => overlay.style.display = 'none'
        });
    }
}

/**
 * Show confirmation dialog
 */
export function showConfirm(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar') {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'confirm-dialog-overlay';
        dialog.innerHTML = `
            <div class="confirm-dialog">
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="confirm-dialog-actions">
                    <button class="btn-secondary" id="confirm-cancel">${cancelText}</button>
                    <button class="btn-primary" id="confirm-ok">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        gsap.fromTo(dialog, { opacity: 0 }, { opacity: 1, duration: 0.2 });
        gsap.fromTo(dialog.querySelector('.confirm-dialog'),
            { scale: 0.9, y: 20 },
            { scale: 1, y: 0, duration: 0.3, ease: "back.out(1.5)" }
        );
        
        const cleanup = (result) => {
            gsap.to(dialog, {
                opacity: 0,
                duration: 0.2,
                onComplete: () => {
                    dialog.remove();
                    resolve(result);
                }
            });
        };
        
        dialog.querySelector('#confirm-cancel').addEventListener('click', () => cleanup(false));
        dialog.querySelector('#confirm-ok').addEventListener('click', () => cleanup(true));
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) cleanup(false);
        });
    });
}

// ============================================================
// ANIMATIONS
// ============================================================

/**
 * Animate app entrance (on login)
 */
export function animateAppEntrance() {
    gsap.set(".sidebar, .main-content", { opacity: 1 });
    
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

/**
 * Animate content based on view type
 */
export function animateContent(type) {
    requestAnimationFrame(() => {
        switch(type) {
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
            case 'prescriptions':
                animatePrescriptions();
                break;
            case 'settings':
            case 'profile':
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
    const cards = document.querySelectorAll('.vitals-card, .vitals-patient-card');
    if (cards.length) {
        gsap.fromTo(cards,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
        );
    }
}

function animatePrescriptions() {
    const cards = document.querySelectorAll('.prescription-card');
    if (cards.length) {
        gsap.fromTo(cards,
            { y: 15, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
        );
    }
}

function animateSettings() {
    const sections = document.querySelectorAll('.settings-section, .profile-section');
    if (sections.length) {
        gsap.fromTo(sections,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power2.out" }
        );
    }
}

// ============================================================
// SKELETON LOADERS
// ============================================================

/**
 * Generate skeleton loader HTML
 */
export function renderSkeleton(type, count = 3) {
    const skeletons = {
        'patient-card': `
            <div class="skeleton-card">
                <div class="skeleton-avatar"></div>
                <div class="skeleton-content">
                    <div class="skeleton-line" style="width: 60%"></div>
                    <div class="skeleton-line" style="width: 40%"></div>
                </div>
            </div>
        `,
        'stat-card': `
            <div class="skeleton-stat">
                <div class="skeleton-circle"></div>
                <div class="skeleton-line" style="width: 50%"></div>
                <div class="skeleton-line" style="width: 30%"></div>
            </div>
        `,
        'appointment': `
            <div class="skeleton-appointment">
                <div class="skeleton-line" style="width: 70%"></div>
                <div class="skeleton-line" style="width: 50%"></div>
            </div>
        `,
        'table-row': `
            <div class="skeleton-table-row">
                <div class="skeleton-line" style="width: 20%"></div>
                <div class="skeleton-line" style="width: 30%"></div>
                <div class="skeleton-line" style="width: 25%"></div>
                <div class="skeleton-line" style="width: 15%"></div>
            </div>
        `
    };
    
    return Array(count).fill(skeletons[type] || skeletons['patient-card']).join('');
}

// ============================================================
// THEME MANAGEMENT (Removed - Light mode only)
// ============================================================

/**
 * Initialize theme - always use light theme
 */
export function initTheme() {
    document.documentElement.removeAttribute('data-theme');
    localStorage.removeItem('medrecord-theme');
}

// ============================================================
// OFFLINE INDICATOR
// ============================================================

/**
 * Show offline indicator
 */
export function updateOfflineStatus() {
    let indicator = document.getElementById('offline-indicator');
    
    if (!navigator.onLine) {
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.innerHTML = `
                <i class="ph ph-wifi-slash"></i>
                <span>Sin conexión - Los cambios se guardarán localmente</span>
            `;
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'flex';
        gsap.fromTo(indicator, { y: -50 }, { y: 0, duration: 0.3 });
    } else if (indicator) {
        gsap.to(indicator, {
            y: -50,
            duration: 0.3,
            onComplete: () => indicator.style.display = 'none'
        });
    }
}

// Listen for connection changes
window.addEventListener('online', updateOfflineStatus);
window.addEventListener('offline', updateOfflineStatus);
