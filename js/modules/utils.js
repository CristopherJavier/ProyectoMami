// ============================================================
// MedRecord Pro - Utility Functions
// ============================================================

/**
 * Generate unique ID
 */
export function generateId() {
    return 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

/**
 * Format date with different formats
 */
export function formatDate(date, format = 'short') {
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
    } else if (format === 'datetime') {
        return d.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } else if (format === 'iso') {
        return d.toISOString().split('T')[0];
    }
    return d.toLocaleDateString('es-ES');
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

/**
 * Filter clinical content for professional language
 */
export function filterClinicalContent(content) {
    if (!content) return "";
    const filters = [
        { regex: /nada/gi, replacement: "Sin hallazgos significativos" },
        { regex: /todo bien/gi, replacement: "Estado clínico estable" },
        { regex: /esta loca/gi, replacement: "Paciente presenta agitación psicomotriz" },
        { regex: /loca/gi, replacement: "Paciente con alteración del afecto" },
        { regex: /borracho/gi, replacement: "Paciente con signos de intoxicación etílica" },
        { regex: /pene/gi, replacement: "seguimiento clínico evolucionado" },
        { regex: /test/gi, replacement: "evaluación clínica de rutina" },
        { regex: /mal/gi, replacement: "condición clínica comprometida" },
        { regex: /feos/gi, replacement: "hallazgos clínicos atípicos" }
    ];
    let filtered = content;
    filters.forEach(f => {
        filtered = filtered.replace(f.regex, f.replacement);
    });
    return filtered;
}

/**
 * Debounce function for search inputs
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Format phone number
 */
export function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}

/**
 * Validate email format
 */
export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate required fields
 */
export function validateRequired(fields) {
    const errors = [];
    for (const [name, value] of Object.entries(fields)) {
        if (!value || (typeof value === 'string' && !value.trim())) {
            errors.push(`${name} es requerido`);
        }
    }
    return errors;
}

/**
 * Format currency
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN'
    }).format(amount);
}

/**
 * Get initials from name
 */
export function getInitials(name) {
    if (!name) return '?';
    return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Download blob as file
 */
export function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Error copying to clipboard:', err);
        return false;
    }
}

/**
 * Sleep/delay function
 */
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
