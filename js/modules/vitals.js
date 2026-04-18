// ============================================================
// MedRecord Pro - Vital Signs Module
// ============================================================

import { db, auth, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from './config.js';
import { state, setVitalSignsCache } from './state.js';
import { formatDate, calculateAge } from './utils.js';
import { showToast, animateContent, openModal, closeModal, showConfirm } from './ui.js';
import { validateForm, setupFormValidation } from './validation.js';

/**
 * Load vital signs from Firestore
 */
export async function loadVitalSigns() {
    if (!state.currentUser) return;
    
    try {
        const q = query(
            collection(db, "vitalSigns"),
            where("userId", "==", state.currentUser.uid),
            orderBy("recordedAt", "desc")
        );
        const snapshot = await getDocs(q);
        setVitalSignsCache(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
        console.error("Error loading vital signs:", error);
        setVitalSignsCache([]);
    }
}

/**
 * Render vital signs view
 */
export function renderVitalSigns() {
    const mainContent = document.getElementById('main-content');
    const activePatients = state.patientsCache.filter(p => p.status === 'active' || !p.status);
    
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
    
    // Event listeners
    document.getElementById('add-vitals-btn')?.addEventListener('click', () => openVitalsModal());
    
    // Search
    document.getElementById('vitals-search')?.addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        const filtered = activePatients.filter(p => p.name.toLowerCase().includes(search));
        const listEl = document.getElementById('vitals-list');
        if (listEl) {
            listEl.innerHTML = filtered.map(p => renderVitalPatientCard(p)).join('');
            attachVitalCardListeners();
        }
    });
    
    attachVitalCardListeners();
    animateContent('vitals');
}

/**
 * Render vital signs card for a patient
 */
function renderVitalPatientCard(patient) {
    const patientVitals = state.vitalSignsCache
        .filter(v => v.patientId === patient.id)
        .slice(0, 1)[0];
    
    const age = calculateAge(patient.birthDate);
    
    return `
        <div class="vitals-patient-card" data-patient-id="${patient.id}">
            <div class="vitals-patient-header">
                <div class="patient-avatar">
                    <i class="ph ph-user"></i>
                </div>
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
                <div class="no-vitals">
                    <p>Sin registros de signos vitales</p>
                </div>
            `}
            
            <div class="vitals-actions">
                <button class="btn-secondary btn-small view-history-btn" data-patient-id="${patient.id}">
                    <i class="ph ph-chart-line"></i> Historial
                </button>
                <button class="btn-primary btn-small add-vitals-patient-btn" data-patient-id="${patient.id}">
                    <i class="ph ph-plus"></i> Registrar
                </button>
            </div>
        </div>
    `;
}

/**
 * Attach event listeners to vital cards
 */
function attachVitalCardListeners() {
    document.querySelectorAll('.view-history-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showVitalsHistory(btn.dataset.patientId);
        });
    });
    
    document.querySelectorAll('.add-vitals-patient-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            openVitalsModal(btn.dataset.patientId);
        });
    });
}

/**
 * Open vital signs modal
 */
export function openVitalsModal(patientId = null) {
    const modal = document.getElementById('vitals-modal') || createVitalsModal();
    const activePatients = state.patientsCache.filter(p => p.status === 'active' || !p.status);
    
    // Populate patient select
    const patientSelect = document.getElementById('vital-patient');
    patientSelect.innerHTML = `
        <option value="">Seleccionar paciente</option>
        ${activePatients.map(p => `
            <option value="${p.id}" ${patientId === p.id ? 'selected' : ''}>${p.name}</option>
        `).join('')}
    `;
    
    // Reset form
    document.getElementById('vital-systolic').value = '';
    document.getElementById('vital-diastolic').value = '';
    document.getElementById('vital-pulse').value = '';
    document.getElementById('vital-temperature').value = '';
    document.getElementById('vital-weight').value = '';
    document.getElementById('vital-height').value = '';
    document.getElementById('vital-oxygen').value = '';
    document.getElementById('vital-glucose').value = '';
    document.getElementById('vital-notes').value = '';
    
    setupFormValidation('vitals');
    openModal(modal);
}

/**
 * Create vital signs modal
 */
function createVitalsModal() {
    const modal = document.createElement('div');
    modal.id = 'vitals-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-box modal-lg">
            <div class="modal-header">
                <h2><i class="ph ph-heartbeat"></i> Registrar Signos Vitales</h2>
                <button class="modal-close" id="close-vitals-modal">
                    <i class="ph ph-x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Paciente *</label>
                    <select id="vital-patient" class="form-select">
                        <option value="">Seleccionar paciente</option>
                    </select>
                </div>
                
                <div class="vitals-form-grid">
                    <div class="form-group">
                        <label>Presión Sistólica (mmHg)</label>
                        <input type="number" id="vital-systolic" placeholder="120" min="60" max="250">
                    </div>
                    <div class="form-group">
                        <label>Presión Diastólica (mmHg)</label>
                        <input type="number" id="vital-diastolic" placeholder="80" min="40" max="150">
                    </div>
                    <div class="form-group">
                        <label>Pulso (bpm)</label>
                        <input type="number" id="vital-pulse" placeholder="72" min="30" max="220">
                    </div>
                    <div class="form-group">
                        <label>Temperatura (°C)</label>
                        <input type="number" id="vital-temperature" placeholder="36.5" step="0.1" min="34" max="42">
                    </div>
                    <div class="form-group">
                        <label>Peso (kg)</label>
                        <input type="number" id="vital-weight" placeholder="70" step="0.1" min="1" max="500">
                    </div>
                    <div class="form-group">
                        <label>Altura (cm)</label>
                        <input type="number" id="vital-height" placeholder="170" min="30" max="250">
                    </div>
                    <div class="form-group">
                        <label>Saturación O₂ (%)</label>
                        <input type="number" id="vital-oxygen" placeholder="98" min="70" max="100">
                    </div>
                    <div class="form-group">
                        <label>Glucosa (mg/dL)</label>
                        <input type="number" id="vital-glucose" placeholder="100" min="20" max="600">
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Observaciones</label>
                    <textarea id="vital-notes" rows="3" placeholder="Notas adicionales..."></textarea>
                </div>
                
                <div id="vitals-error" class="error-message" style="display: none;"></div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" id="cancel-vitals-btn">Cancelar</button>
                <button class="btn-primary" id="save-vitals-btn">
                    <i class="ph ph-check"></i> Guardar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('close-vitals-modal').addEventListener('click', () => closeModal(modal));
    document.getElementById('cancel-vitals-btn').addEventListener('click', () => closeModal(modal));
    document.getElementById('save-vitals-btn').addEventListener('click', saveVitalSigns);
    
    return modal;
}

/**
 * Save vital signs
 */
async function saveVitalSigns() {
    const patientId = document.getElementById('vital-patient').value;
    
    if (!patientId) {
        const errorEl = document.getElementById('vitals-error');
        errorEl.textContent = 'Selecciona un paciente';
        errorEl.style.display = 'block';
        return;
    }
    
    const vitalsData = {
        userId: state.currentUser.uid,
        patientId,
        systolic: document.getElementById('vital-systolic').value ? Number(document.getElementById('vital-systolic').value) : null,
        diastolic: document.getElementById('vital-diastolic').value ? Number(document.getElementById('vital-diastolic').value) : null,
        pulse: document.getElementById('vital-pulse').value ? Number(document.getElementById('vital-pulse').value) : null,
        temperature: document.getElementById('vital-temperature').value ? Number(document.getElementById('vital-temperature').value) : null,
        weight: document.getElementById('vital-weight').value ? Number(document.getElementById('vital-weight').value) : null,
        height: document.getElementById('vital-height').value ? Number(document.getElementById('vital-height').value) : null,
        oxygen: document.getElementById('vital-oxygen').value ? Number(document.getElementById('vital-oxygen').value) : null,
        glucose: document.getElementById('vital-glucose').value ? Number(document.getElementById('vital-glucose').value) : null,
        notes: document.getElementById('vital-notes').value.trim(),
        recordedAt: serverTimestamp()
    };
    
    // Calculate BMI if weight and height are provided
    if (vitalsData.weight && vitalsData.height) {
        const heightM = vitalsData.height / 100;
        vitalsData.bmi = Math.round((vitalsData.weight / (heightM * heightM)) * 10) / 10;
    }
    
    try {
        const docRef = await addDoc(collection(db, "vitalSigns"), vitalsData);
        
        // Update cache
        state.vitalSignsCache.unshift({ id: docRef.id, ...vitalsData, recordedAt: new Date() });
        
        closeModal(document.getElementById('vitals-modal'));
        showToast('Signos vitales registrados', 'success');
        renderVitalSigns();
    } catch (error) {
        console.error("Error saving vital signs:", error);
        showToast('Error al guardar signos vitales', 'error');
    }
}

/**
 * Show vitals history with charts
 */
export function showVitalsHistory(patientId) {
    const patient = state.patientsCache.find(p => p.id === patientId);
    const patientVitals = state.vitalSignsCache
        .filter(v => v.patientId === patientId)
        .sort((a, b) => {
            const dateA = a.recordedAt?.toDate ? a.recordedAt.toDate() : new Date(a.recordedAt);
            const dateB = b.recordedAt?.toDate ? b.recordedAt.toDate() : new Date(b.recordedAt);
            return dateA - dateB;
        });
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'vitals-history-modal';
    modal.innerHTML = `
        <div class="modal-box modal-xl">
            <div class="modal-header">
                <h2><i class="ph ph-chart-line"></i> Historial de ${patient?.name || 'Paciente'}</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="ph ph-x"></i>
                </button>
            </div>
            <div class="modal-body">
                ${patientVitals.length > 0 ? `
                    <div class="vitals-charts-grid">
                        <div class="chart-container">
                            <h4>Presión Arterial</h4>
                            <canvas id="bp-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h4>Pulso y Saturación</h4>
                            <canvas id="pulse-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h4>Peso</h4>
                            <canvas id="weight-chart"></canvas>
                        </div>
                        <div class="chart-container">
                            <h4>Temperatura</h4>
                            <canvas id="temp-chart"></canvas>
                        </div>
                    </div>
                    
                    <h4 style="margin-top: 24px;">Historial Detallado</h4>
                    <div class="vitals-history-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>P/A</th>
                                    <th>Pulso</th>
                                    <th>Temp</th>
                                    <th>Peso</th>
                                    <th>O₂</th>
                                    <th>Glucosa</th>
                                    <th>IMC</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${patientVitals.reverse().map(v => `
                                    <tr>
                                        <td>${formatDate(v.recordedAt)}</td>
                                        <td>${v.systolic || '-'}/${v.diastolic || '-'}</td>
                                        <td>${v.pulse || '-'}</td>
                                        <td>${v.temperature || '-'}°C</td>
                                        <td>${v.weight || '-'} kg</td>
                                        <td>${v.oxygen || '-'}%</td>
                                        <td>${v.glucose || '-'}</td>
                                        <td>${v.bmi || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : `
                    <div class="empty-state">
                        <i class="ph ph-chart-line"></i>
                        <p>No hay registros de signos vitales</p>
                    </div>
                `}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    openModal(modal);
    
    // Render charts if data exists
    if (patientVitals.length > 0) {
        renderVitalsCharts(patientVitals.reverse());
    }
}

/**
 * Render vitals charts
 */
function renderVitalsCharts(vitals) {
    const labels = vitals.map(v => formatDate(v.recordedAt, 'short'));
    
    // Blood Pressure Chart
    new Chart(document.getElementById('bp-chart'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Sistólica',
                    data: vitals.map(v => v.systolic),
                    borderColor: '#ef4444',
                    tension: 0.3
                },
                {
                    label: 'Diastólica',
                    data: vitals.map(v => v.diastolic),
                    borderColor: '#3b82f6',
                    tension: 0.3
                }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // Pulse and O2 Chart
    new Chart(document.getElementById('pulse-chart'), {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'Pulso (bpm)',
                    data: vitals.map(v => v.pulse),
                    borderColor: '#f97316',
                    tension: 0.3
                },
                {
                    label: 'O₂ (%)',
                    data: vitals.map(v => v.oxygen),
                    borderColor: '#22c55e',
                    tension: 0.3
                }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // Weight Chart
    new Chart(document.getElementById('weight-chart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Peso (kg)',
                data: vitals.map(v => v.weight),
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    
    // Temperature Chart
    new Chart(document.getElementById('temp-chart'), {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: 'Temperatura (°C)',
                data: vitals.map(v => v.temperature),
                borderColor: '#ec4899',
                tension: 0.3
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Export for global access
window.showVitalsHistory = showVitalsHistory;
