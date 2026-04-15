// ============================================================
// MedRecord Pro - Advanced Search Module
// ============================================================

import { state } from './state.js';
import { formatDate, calculateAge, debounce } from './utils.js';

/**
 * Advanced search configuration
 */
const searchConfig = {
    patients: {
        fields: ['name', 'phone', 'bloodType', 'allergies', 'conditions'],
        render: renderPatientResult
    },
    appointments: {
        fields: ['type', 'notes'],
        render: renderAppointmentResult
    },
    notes: {
        fields: ['type', 'content'],
        render: renderNoteResult
    }
};

/**
 * Initialize global search
 */
export function initGlobalSearch() {
    const searchContainer = document.getElementById('global-search-container');
    if (!searchContainer) return;
    
    searchContainer.innerHTML = `
        <div class="global-search-wrapper">
            <div class="global-search-input">
                <i class="ph ph-magnifying-glass"></i>
                <input type="text" id="global-search" placeholder="Buscar pacientes, citas, notas..." autocomplete="off">
                <div class="search-shortcuts">
                    <kbd>Ctrl</kbd><kbd>K</kbd>
                </div>
            </div>
            <div class="global-search-results" id="global-search-results" style="display: none;">
                <div class="search-results-content"></div>
            </div>
        </div>
    `;
    
    const searchInput = document.getElementById('global-search');
    const resultsContainer = document.getElementById('global-search-results');
    
    // Debounced search
    const performSearch = debounce((query) => {
        if (query.length < 2) {
            resultsContainer.style.display = 'none';
            return;
        }
        
        const results = globalSearch(query);
        renderSearchResults(results, resultsContainer);
    }, 300);
    
    searchInput.addEventListener('input', (e) => {
        performSearch(e.target.value);
    });
    
    // Keyboard shortcut
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            searchInput.focus();
        }
        
        if (e.key === 'Escape') {
            searchInput.blur();
            resultsContainer.style.display = 'none';
        }
    });
    
    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target)) {
            resultsContainer.style.display = 'none';
        }
    });
}

/**
 * Perform global search across all data
 */
export function globalSearch(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const results = {
        patients: [],
        appointments: [],
        notes: []
    };
    
    // Search patients
    results.patients = state.patientsCache
        .filter(p => (p.status === 'active' || !p.status) && matchesQuery(p, searchConfig.patients.fields, normalizedQuery))
        .slice(0, 5);
    
    // Search appointments
    results.appointments = state.appointmentsCache
        .filter(a => {
            const patient = state.patientsCache.find(p => p.id === a.patientId);
            return matchesQuery(a, searchConfig.appointments.fields, normalizedQuery) ||
                   (patient && patient.name.toLowerCase().includes(normalizedQuery));
        })
        .slice(0, 5);
    
    // Search notes
    results.notes = state.notesCache
        .filter(n => {
            const patient = state.patientsCache.find(p => p.id === n.patientId);
            return matchesQuery(n, searchConfig.notes.fields, normalizedQuery) ||
                   (patient && patient.name.toLowerCase().includes(normalizedQuery));
        })
        .slice(0, 5);
    
    return results;
}

/**
 * Check if object matches query
 */
function matchesQuery(obj, fields, query) {
    return fields.some(field => {
        const value = obj[field];
        return value && value.toString().toLowerCase().includes(query);
    });
}

/**
 * Render search results
 */
function renderSearchResults(results, container) {
    const totalResults = results.patients.length + results.appointments.length + results.notes.length;
    
    if (totalResults === 0) {
        container.querySelector('.search-results-content').innerHTML = `
            <div class="no-results">
                <i class="ph ph-magnifying-glass"></i>
                <p>No se encontraron resultados</p>
            </div>
        `;
        container.style.display = 'block';
        return;
    }
    
    let html = '';
    
    if (results.patients.length > 0) {
        html += `
            <div class="results-section">
                <h4><i class="ph ph-users"></i> Pacientes</h4>
                ${results.patients.map(p => renderPatientResult(p)).join('')}
            </div>
        `;
    }
    
    if (results.appointments.length > 0) {
        html += `
            <div class="results-section">
                <h4><i class="ph ph-calendar"></i> Citas</h4>
                ${results.appointments.map(a => renderAppointmentResult(a)).join('')}
            </div>
        `;
    }
    
    if (results.notes.length > 0) {
        html += `
            <div class="results-section">
                <h4><i class="ph ph-note"></i> Notas</h4>
                ${results.notes.map(n => renderNoteResult(n)).join('')}
            </div>
        `;
    }
    
    container.querySelector('.search-results-content').innerHTML = html;
    container.style.display = 'block';
    
    // Add click handlers
    container.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
            const type = item.dataset.type;
            const id = item.dataset.id;
            navigateToResult(type, id);
            container.style.display = 'none';
            document.getElementById('global-search').value = '';
        });
    });
}

/**
 * Render patient search result
 */
function renderPatientResult(patient) {
    const age = calculateAge(patient.birthDate);
    return `
        <div class="search-result-item" data-type="patient" data-id="${patient.id}">
            <div class="result-icon"><i class="ph ph-user"></i></div>
            <div class="result-info">
                <span class="result-title">${patient.name}</span>
                <span class="result-subtitle">${age} años • ${patient.sex} • ${patient.bloodType || 'N/A'}</span>
            </div>
            <i class="ph ph-arrow-right"></i>
        </div>
    `;
}

/**
 * Render appointment search result
 */
function renderAppointmentResult(appointment) {
    const patient = state.patientsCache.find(p => p.id === appointment.patientId);
    return `
        <div class="search-result-item" data-type="appointment" data-id="${appointment.id}">
            <div class="result-icon"><i class="ph ph-calendar-check"></i></div>
            <div class="result-info">
                <span class="result-title">${patient?.name || 'Paciente'}</span>
                <span class="result-subtitle">${appointment.type} • ${formatDate(appointment.date)}</span>
            </div>
            <i class="ph ph-arrow-right"></i>
        </div>
    `;
}

/**
 * Render note search result
 */
function renderNoteResult(note) {
    const patient = state.patientsCache.find(p => p.id === note.patientId);
    const preview = note.content?.substring(0, 50) + '...' || '';
    return `
        <div class="search-result-item" data-type="note" data-id="${note.id}">
            <div class="result-icon"><i class="ph ph-note"></i></div>
            <div class="result-info">
                <span class="result-title">${patient?.name || 'Paciente'} - ${note.type}</span>
                <span class="result-subtitle">${preview}</span>
            </div>
            <i class="ph ph-arrow-right"></i>
        </div>
    `;
}

/**
 * Navigate to search result
 */
function navigateToResult(type, id) {
    switch (type) {
        case 'patient':
            window.location.hash = `paciente/${id}`;
            break;
        case 'appointment':
            window.location.hash = 'citas';
            break;
        case 'note':
            const note = state.notesCache.find(n => n.id === id);
            if (note) {
                window.location.hash = `paciente/${note.patientId}`;
            }
            break;
    }
}

/**
 * Filter patients with advanced criteria
 */
export function filterPatientsAdvanced(criteria) {
    return state.patientsCache.filter(patient => {
        // Status filter
        if (criteria.status && patient.status !== criteria.status) {
            if (criteria.status === 'active' && patient.status) return false;
            if (criteria.status !== 'active' && patient.status !== criteria.status) return false;
        }
        
        // Name filter
        if (criteria.name && !patient.name.toLowerCase().includes(criteria.name.toLowerCase())) {
            return false;
        }
        
        // Age range filter
        if (criteria.ageMin || criteria.ageMax) {
            const age = calculateAge(patient.birthDate);
            if (criteria.ageMin && age < criteria.ageMin) return false;
            if (criteria.ageMax && age > criteria.ageMax) return false;
        }
        
        // Sex filter
        if (criteria.sex && patient.sex !== criteria.sex) {
            return false;
        }
        
        // Blood type filter
        if (criteria.bloodType && patient.bloodType !== criteria.bloodType) {
            return false;
        }
        
        // Has allergies filter
        if (criteria.hasAllergies !== undefined) {
            const hasAllergies = patient.allergies && patient.allergies.trim() !== '';
            if (criteria.hasAllergies !== hasAllergies) return false;
        }
        
        // Date range filter (created at)
        if (criteria.createdAfter) {
            const createdAt = patient.createdAt?.toDate ? patient.createdAt.toDate() : new Date(patient.createdAt);
            if (createdAt < new Date(criteria.createdAfter)) return false;
        }
        
        if (criteria.createdBefore) {
            const createdAt = patient.createdAt?.toDate ? patient.createdAt.toDate() : new Date(patient.createdAt);
            if (createdAt > new Date(criteria.createdBefore)) return false;
        }
        
        return true;
    });
}

/**
 * Render advanced search panel
 */
export function renderAdvancedSearchPanel(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <div class="advanced-search-panel">
            <div class="search-filters-grid">
                <div class="filter-group">
                    <label>Nombre</label>
                    <input type="text" id="filter-name" placeholder="Buscar por nombre...">
                </div>
                <div class="filter-group">
                    <label>Sexo</label>
                    <select id="filter-sex">
                        <option value="">Todos</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Edad mínima</label>
                    <input type="number" id="filter-age-min" min="0" max="120" placeholder="Min">
                </div>
                <div class="filter-group">
                    <label>Edad máxima</label>
                    <input type="number" id="filter-age-max" min="0" max="120" placeholder="Max">
                </div>
                <div class="filter-group">
                    <label>Tipo de sangre</label>
                    <select id="filter-blood">
                        <option value="">Todos</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                    </select>
                </div>
                <div class="filter-group">
                    <label>Con alergias</label>
                    <select id="filter-allergies">
                        <option value="">Todos</option>
                        <option value="true">Sí</option>
                        <option value="false">No</option>
                    </select>
                </div>
            </div>
            <div class="filter-actions">
                <button class="btn-secondary" id="clear-filters-btn">
                    <i class="ph ph-x"></i> Limpiar
                </button>
                <button class="btn-primary" id="apply-filters-btn">
                    <i class="ph ph-funnel"></i> Aplicar
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('apply-filters-btn')?.addEventListener('click', () => {
        const criteria = {
            name: document.getElementById('filter-name').value,
            sex: document.getElementById('filter-sex').value,
            ageMin: document.getElementById('filter-age-min').value ? parseInt(document.getElementById('filter-age-min').value) : null,
            ageMax: document.getElementById('filter-age-max').value ? parseInt(document.getElementById('filter-age-max').value) : null,
            bloodType: document.getElementById('filter-blood').value,
            hasAllergies: document.getElementById('filter-allergies').value ? document.getElementById('filter-allergies').value === 'true' : undefined
        };
        
        // Dispatch event with filtered results
        const event = new CustomEvent('advancedSearchApplied', { detail: { criteria } });
        document.dispatchEvent(event);
    });
    
    document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
        container.querySelectorAll('input, select').forEach(el => {
            el.value = '';
        });
        
        const event = new CustomEvent('advancedSearchCleared');
        document.dispatchEvent(event);
    });
}
