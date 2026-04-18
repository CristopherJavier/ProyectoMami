// ============================================================
// MedRecord Pro - Form Validation Module
// ============================================================

import { showError, hideError } from './ui.js';
import { isValidEmail } from './utils.js';

/**
 * Validation rules configuration
 */
const validationRules = {
    required: (value) => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return 'Este campo es requerido';
        }
        return null;
    },
    email: (value) => {
        if (value && !isValidEmail(value)) {
            return 'Ingresa un correo electrónico válido';
        }
        return null;
    },
    minLength: (min) => (value) => {
        if (value && value.length < min) {
            return `Debe tener al menos ${min} caracteres`;
        }
        return null;
    },
    maxLength: (max) => (value) => {
        if (value && value.length > max) {
            return `No puede exceder ${max} caracteres`;
        }
        return null;
    },
    phone: (value) => {
        if (value) {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length < 10) {
                return 'El teléfono debe tener al menos 10 dígitos';
            }
        }
        return null;
    },
    match: (fieldId, fieldName) => (value) => {
        const otherValue = document.getElementById(fieldId)?.value;
        if (value !== otherValue) {
            return `No coincide con ${fieldName}`;
        }
        return null;
    },
    date: (value) => {
        if (value) {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return 'Fecha inválida';
            }
        }
        return null;
    },
    futureDate: (value) => {
        if (value) {
            const date = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (date < today) {
                return 'La fecha debe ser futura';
            }
        }
        return null;
    },
    pastDate: (value) => {
        if (value) {
            const date = new Date(value);
            const today = new Date();
            if (date > today) {
                return 'La fecha no puede ser futura';
            }
        }
        return null;
    },
    number: (value) => {
        if (value && isNaN(Number(value))) {
            return 'Debe ser un número';
        }
        return null;
    },
    range: (min, max) => (value) => {
        const num = Number(value);
        if (value && (num < min || num > max)) {
            return `Debe estar entre ${min} y ${max}`;
        }
        return null;
    }
};

/**
 * Field validators by form type
 */
const formValidators = {
    login: {
        'login-email': [validationRules.required, validationRules.email],
        'login-password': [validationRules.required, validationRules.minLength(6)]
    },
    register: {
        'register-name': [validationRules.required, validationRules.minLength(3)],
        'register-email': [validationRules.required, validationRules.email],
        'register-password': [validationRules.required, validationRules.minLength(6)],
        'register-confirm': [
            validationRules.required, 
            validationRules.match('register-password', 'la contraseña')
        ]
    },
    patient: {
        'patient-name': [validationRules.required, validationRules.minLength(3)],
        'patient-dob': [validationRules.required, validationRules.date, validationRules.pastDate],
        'patient-sex': [validationRules.required],
        'patient-phone': [validationRules.phone]
    },
    appointment: {
        'appointment-patient': [validationRules.required],
        'appointment-date': [validationRules.required, validationRules.date],
        'appointment-time': [validationRules.required],
        'appointment-type': [validationRules.required]
    },
    note: {
        'note-patient': [validationRules.required],
        'note-type': [validationRules.required],
        'note-content': [validationRules.required, validationRules.minLength(10)]
    },
    prescription: {
        'prescription-patient': [validationRules.required],
        'prescription-medication': [validationRules.required],
        'prescription-dosage': [validationRules.required],
        'prescription-frequency': [validationRules.required],
        'prescription-duration': [validationRules.required]
    },
    vitals: {
        'vital-patient': [validationRules.required],
        'vital-systolic': [validationRules.number, validationRules.range(60, 250)],
        'vital-diastolic': [validationRules.number, validationRules.range(40, 150)],
        'vital-pulse': [validationRules.number, validationRules.range(30, 220)],
        'vital-temperature': [validationRules.number, validationRules.range(34, 42)],
        'vital-weight': [validationRules.number, validationRules.range(1, 500)],
        'vital-height': [validationRules.number, validationRules.range(30, 250)]
    }
};

/**
 * Validate a single field
 */
export function validateField(fieldId, rules) {
    const field = document.getElementById(fieldId);
    if (!field) return { valid: true, error: null };
    
    const value = field.value;
    const errorEl = field.closest('.form-group')?.querySelector('.field-error') ||
                    document.getElementById(`${fieldId}-error`);
    
    for (const rule of rules) {
        const error = rule(value);
        if (error) {
            field.classList.add('invalid');
            field.classList.remove('valid');
            if (errorEl) {
                errorEl.textContent = error;
                errorEl.style.display = 'block';
            }
            return { valid: false, error };
        }
    }
    
    field.classList.remove('invalid');
    field.classList.add('valid');
    if (errorEl) {
        errorEl.style.display = 'none';
    }
    
    return { valid: true, error: null };
}

/**
 * Validate entire form
 */
export function validateForm(formType) {
    const validators = formValidators[formType];
    if (!validators) {
        console.warn(`No validators defined for form type: ${formType}`);
        return true;
    }
    
    let isValid = true;
    const errors = [];
    
    for (const [fieldId, rules] of Object.entries(validators)) {
        const result = validateField(fieldId, rules);
        if (!result.valid) {
            isValid = false;
            errors.push({ field: fieldId, error: result.error });
        }
    }
    
    // Focus first invalid field
    if (!isValid && errors.length > 0) {
        const firstInvalidField = document.getElementById(errors[0].field);
        if (firstInvalidField) {
            firstInvalidField.focus();
        }
    }
    
    return isValid;
}

/**
 * Setup real-time validation for a form
 */
export function setupFormValidation(formType) {
    const validators = formValidators[formType];
    if (!validators) return;
    
    for (const [fieldId, rules] of Object.entries(validators)) {
        const field = document.getElementById(fieldId);
        if (!field) continue;
        
        // Create error element if doesn't exist
        let errorEl = field.closest('.form-group')?.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'field-error';
            errorEl.id = `${fieldId}-error`;
            errorEl.style.display = 'none';
            field.parentNode.appendChild(errorEl);
        }
        
        // Validate on blur
        field.addEventListener('blur', () => {
            validateField(fieldId, rules);
        });
        
        // Clear error on input
        field.addEventListener('input', () => {
            field.classList.remove('invalid');
            if (errorEl) errorEl.style.display = 'none';
        });
    }
}

/**
 * Add custom validation rule
 */
export function addValidationRule(formType, fieldId, rules) {
    if (!formValidators[formType]) {
        formValidators[formType] = {};
    }
    formValidators[formType][fieldId] = rules;
}

/**
 * Clear all validation errors in a form
 */
export function clearFormErrors(formElement) {
    if (!formElement) return;
    
    const invalidFields = formElement.querySelectorAll('.invalid');
    invalidFields.forEach(field => {
        field.classList.remove('invalid', 'valid');
    });
    
    const errorElements = formElement.querySelectorAll('.field-error');
    errorElements.forEach(el => {
        el.style.display = 'none';
    });
}

/**
 * Reset form fields and errors
 */
export function resetForm(formElement) {
    if (!formElement) return;
    
    // Reset native form if it's a form element
    if (formElement.tagName === 'FORM') {
        formElement.reset();
    } else {
        // Clear all inputs manually
        const inputs = formElement.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
        });
    }
    
    clearFormErrors(formElement);
}

// Export validation rules for custom use
export { validationRules };
