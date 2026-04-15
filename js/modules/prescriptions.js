// ============================================================
// MedRecord Pro - Prescriptions Module
// ============================================================

import { db, auth, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from './config.js';
import { state, setPrescriptionsCache } from './state.js';
import { formatDate, downloadBlob } from './utils.js';
import { showToast, animateContent, openModal, closeModal, showConfirm } from './ui.js';
import { validateForm, setupFormValidation } from './validation.js';

/**
 * Load prescriptions from Firestore
 */
export async function loadPrescriptions() {
    if (!state.currentUser) return;
    
    try {
        const q = query(
            collection(db, "prescriptions"),
            where("userId", "==", state.currentUser.uid),
            orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(q);
        setPrescriptionsCache(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
        console.error("Error loading prescriptions:", error);
        setPrescriptionsCache([]);
    }
}

/**
 * Render prescriptions view
 */
export function renderPrescriptions() {
    const mainContent = document.getElementById('main-content');
    const recentPrescriptions = state.prescriptionsCache.slice(0, 20);
    
    mainContent.innerHTML = `
        <div class="page-header">
            <h1><i class="ph ph-prescription"></i>Recetas Médicas</h1>
            <button class="btn-primary" id="add-prescription-btn">
                <i class="ph ph-plus"></i> Nueva Receta
            </button>
        </div>
        
        <div class="content-search">
            <i class="ph ph-magnifying-glass"></i>
            <input type="text" id="prescription-search" placeholder="Buscar por paciente o medicamento...">
        </div>
        
        ${recentPrescriptions.length > 0 ? `
            <div class="prescriptions-list" id="prescriptions-list">
                ${recentPrescriptions.map(rx => renderPrescriptionCard(rx)).join('')}
            </div>
        ` : `
            <div class="empty-state">
                <i class="ph ph-prescription"></i>
                <h3>No hay recetas</h3>
                <p>Crea una nueva receta médica</p>
            </div>
        `}
    `;
    
    // Event listeners
    document.getElementById('add-prescription-btn')?.addEventListener('click', () => openPrescriptionModal());
    
    // Search
    document.getElementById('prescription-search')?.addEventListener('input', (e) => {
        const search = e.target.value.toLowerCase();
        const filtered = state.prescriptionsCache.filter(rx => {
            const patient = state.patientsCache.find(p => p.id === rx.patientId);
            return patient?.name.toLowerCase().includes(search) ||
                   rx.medications?.some(m => m.name.toLowerCase().includes(search));
        });
        const listEl = document.getElementById('prescriptions-list');
        if (listEl) {
            listEl.innerHTML = filtered.map(rx => renderPrescriptionCard(rx)).join('');
            attachPrescriptionListeners();
        }
    });
    
    attachPrescriptionListeners();
    animateContent('prescriptions');
}

/**
 * Render prescription card
 */
function renderPrescriptionCard(rx) {
    const patient = state.patientsCache.find(p => p.id === rx.patientId);
    const medCount = rx.medications?.length || 0;
    
    return `
        <div class="prescription-card" data-prescription-id="${rx.id}">
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
                        <span><strong>${med.name}</strong> - ${med.dosage}</span>
                    </div>
                `).join('') || '<p class="text-muted">Sin medicamentos</p>'}
                ${rx.medications?.length > 3 ? `<p class="text-muted">+${rx.medications.length - 3} más...</p>` : ''}
            </div>
            
            ${rx.diagnosis ? `
                <div class="prescription-diagnosis">
                    <strong>Diagnóstico:</strong> ${rx.diagnosis}
                </div>
            ` : ''}
            
            <div class="prescription-actions">
                <button class="btn-icon" onclick="viewPrescription('${rx.id}')" title="Ver">
                    <i class="ph ph-eye"></i>
                </button>
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

/**
 * Attach event listeners
 */
function attachPrescriptionListeners() {
    // Listeners are attached via onclick in the HTML
}

/**
 * Open prescription modal
 */
export function openPrescriptionModal(patientId = null) {
    const modal = document.getElementById('prescription-modal') || createPrescriptionModal();
    const activePatients = state.patientsCache.filter(p => p.status === 'active' || !p.status);
    
    // Populate patient select
    const patientSelect = document.getElementById('rx-patient');
    patientSelect.innerHTML = `
        <option value="">Seleccionar paciente</option>
        ${activePatients.map(p => `
            <option value="${p.id}" ${patientId === p.id ? 'selected' : ''}>${p.name}</option>
        `).join('')}
    `;
    
    // Reset medications list
    document.getElementById('medications-list').innerHTML = '';
    document.getElementById('rx-diagnosis').value = '';
    document.getElementById('rx-instructions').value = '';
    
    // Add first medication row
    addMedicationRow();
    
    openModal(modal);
}

/**
 * Create prescription modal
 */
function createPrescriptionModal() {
    const modal = document.createElement('div');
    modal.id = 'prescription-modal';
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-box modal-lg">
            <div class="modal-header">
                <h2><i class="ph ph-prescription"></i> Nueva Receta Médica</h2>
                <button class="modal-close" id="close-rx-modal">
                    <i class="ph ph-x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label>Paciente *</label>
                    <select id="rx-patient" class="form-select">
                        <option value="">Seleccionar paciente</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Diagnóstico</label>
                    <input type="text" id="rx-diagnosis" placeholder="Ej: Infección de vías respiratorias">
                </div>
                
                <div class="medications-section">
                    <div class="section-header">
                        <h4><i class="ph ph-pill"></i> Medicamentos</h4>
                        <button type="button" class="btn-secondary btn-small" id="add-medication-btn">
                            <i class="ph ph-plus"></i> Agregar
                        </button>
                    </div>
                    <div id="medications-list"></div>
                </div>
                
                <div class="form-group">
                    <label>Instrucciones Adicionales</label>
                    <textarea id="rx-instructions" rows="3" placeholder="Indicaciones especiales, cuidados, etc."></textarea>
                </div>
                
                <div id="rx-error" class="error-message" style="display: none;"></div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" id="cancel-rx-btn">Cancelar</button>
                <button class="btn-primary" id="save-rx-btn">
                    <i class="ph ph-check"></i> Guardar Receta
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners
    document.getElementById('close-rx-modal').addEventListener('click', () => closeModal(modal));
    document.getElementById('cancel-rx-btn').addEventListener('click', () => closeModal(modal));
    document.getElementById('save-rx-btn').addEventListener('click', savePrescription);
    document.getElementById('add-medication-btn').addEventListener('click', addMedicationRow);
    
    return modal;
}

/**
 * Add medication row to form
 */
function addMedicationRow() {
    const container = document.getElementById('medications-list');
    const index = container.children.length;
    
    const row = document.createElement('div');
    row.className = 'medication-row';
    row.innerHTML = `
        <div class="medication-fields">
            <input type="text" class="med-name" placeholder="Nombre del medicamento *" required>
            <input type="text" class="med-dosage" placeholder="Dosis (ej: 500mg)">
            <input type="text" class="med-frequency" placeholder="Frecuencia (ej: c/8h)">
            <input type="text" class="med-duration" placeholder="Duración (ej: 7 días)">
            <input type="text" class="med-route" placeholder="Vía (oral, IM, IV)">
        </div>
        <button type="button" class="btn-icon danger remove-med-btn" onclick="this.closest('.medication-row').remove()">
            <i class="ph ph-trash"></i>
        </button>
    `;
    
    container.appendChild(row);
}

/**
 * Save prescription
 */
async function savePrescription() {
    const patientId = document.getElementById('rx-patient').value;
    
    if (!patientId) {
        const errorEl = document.getElementById('rx-error');
        errorEl.textContent = 'Selecciona un paciente';
        errorEl.style.display = 'block';
        return;
    }
    
    // Collect medications
    const medications = [];
    document.querySelectorAll('.medication-row').forEach(row => {
        const name = row.querySelector('.med-name').value.trim();
        if (name) {
            medications.push({
                name,
                dosage: row.querySelector('.med-dosage').value.trim(),
                frequency: row.querySelector('.med-frequency').value.trim(),
                duration: row.querySelector('.med-duration').value.trim(),
                route: row.querySelector('.med-route').value.trim()
            });
        }
    });
    
    if (medications.length === 0) {
        const errorEl = document.getElementById('rx-error');
        errorEl.textContent = 'Agrega al menos un medicamento';
        errorEl.style.display = 'block';
        return;
    }
    
    const prescriptionData = {
        userId: state.currentUser.uid,
        patientId,
        diagnosis: document.getElementById('rx-diagnosis').value.trim(),
        medications,
        instructions: document.getElementById('rx-instructions').value.trim(),
        doctorName: state.currentDoctorData?.nombre || 'Doctor',
        doctorLicense: state.currentDoctorData?.licencia || '',
        createdAt: serverTimestamp()
    };
    
    try {
        const docRef = await addDoc(collection(db, "prescriptions"), prescriptionData);
        
        // Update cache
        state.prescriptionsCache.unshift({ id: docRef.id, ...prescriptionData, createdAt: new Date() });
        
        closeModal(document.getElementById('prescription-modal'));
        showToast('Receta guardada exitosamente', 'success');
        renderPrescriptions();
    } catch (error) {
        console.error("Error saving prescription:", error);
        showToast('Error al guardar la receta', 'error');
    }
}

/**
 * View prescription details
 */
export function viewPrescription(prescriptionId) {
    const rx = state.prescriptionsCache.find(r => r.id === prescriptionId);
    if (!rx) return;
    
    const patient = state.patientsCache.find(p => p.id === rx.patientId);
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-box modal-lg">
            <div class="modal-header">
                <h2><i class="ph ph-prescription"></i> Receta Médica</h2>
                <button class="modal-close" onclick="this.closest('.modal').remove()">
                    <i class="ph ph-x"></i>
                </button>
            </div>
            <div class="modal-body prescription-preview" id="prescription-content">
                <div class="rx-header">
                    <div class="rx-doctor-info">
                        <h3>${rx.doctorName}</h3>
                        ${rx.doctorLicense ? `<p>Cédula: ${rx.doctorLicense}</p>` : ''}
                    </div>
                    <div class="rx-date">
                        <p>${formatDate(rx.createdAt, 'full')}</p>
                    </div>
                </div>
                
                <div class="rx-patient-info">
                    <p><strong>Paciente:</strong> ${patient?.name || 'N/A'}</p>
                    ${rx.diagnosis ? `<p><strong>Diagnóstico:</strong> ${rx.diagnosis}</p>` : ''}
                </div>
                
                <div class="rx-medications">
                    <h4>Rp/</h4>
                    <ol>
                        ${rx.medications.map(med => `
                            <li>
                                <strong>${med.name}</strong>
                                ${med.dosage ? ` - ${med.dosage}` : ''}
                                ${med.route ? ` (${med.route})` : ''}
                                <br>
                                ${med.frequency ? `<span class="med-instruction">${med.frequency}</span>` : ''}
                                ${med.duration ? `<span class="med-instruction">por ${med.duration}</span>` : ''}
                            </li>
                        `).join('')}
                    </ol>
                </div>
                
                ${rx.instructions ? `
                    <div class="rx-instructions">
                        <h4>Indicaciones:</h4>
                        <p>${rx.instructions}</p>
                    </div>
                ` : ''}
                
                <div class="rx-signature">
                    <div class="signature-line"></div>
                    <p>${rx.doctorName}</p>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-secondary" onclick="this.closest('.modal').remove()">Cerrar</button>
                <button class="btn-primary" onclick="printPrescription('${prescriptionId}')">
                    <i class="ph ph-printer"></i> Imprimir
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    openModal(modal);
}

/**
 * Print prescription
 */
export function printPrescription(prescriptionId) {
    const rx = state.prescriptionsCache.find(r => r.id === prescriptionId);
    if (!rx) return;
    
    const patient = state.patientsCache.find(p => p.id === rx.patientId);
    
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receta Médica - ${patient?.name || 'Paciente'}</title>
            <style>
                body { font-family: 'Times New Roman', serif; padding: 40px; max-width: 800px; margin: 0 auto; }
                .header { text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { color: #1e3a5f; margin: 0; font-size: 24px; }
                .header p { margin: 5px 0; color: #666; }
                .patient-info { margin-bottom: 30px; padding: 15px; background: #f5f5f5; border-radius: 8px; }
                .patient-info p { margin: 5px 0; }
                .medications { margin-bottom: 30px; }
                .medications h3 { color: #1e3a5f; font-size: 18px; }
                .medications ol { padding-left: 25px; }
                .medications li { margin-bottom: 15px; line-height: 1.6; }
                .instructions { margin-bottom: 30px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                .instructions h4 { margin-top: 0; color: #1e3a5f; }
                .signature { margin-top: 60px; text-align: center; }
                .signature-line { width: 200px; border-top: 1px solid #000; margin: 0 auto 10px; }
                .date { text-align: right; color: #666; margin-bottom: 20px; }
                @media print {
                    body { padding: 20px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>RECETA MÉDICA</h1>
                <p>${rx.doctorName}</p>
                ${rx.doctorLicense ? `<p>Cédula Profesional: ${rx.doctorLicense}</p>` : ''}
            </div>
            
            <p class="date">${formatDate(rx.createdAt, 'full')}</p>
            
            <div class="patient-info">
                <p><strong>Paciente:</strong> ${patient?.name || 'N/A'}</p>
                ${rx.diagnosis ? `<p><strong>Diagnóstico:</strong> ${rx.diagnosis}</p>` : ''}
            </div>
            
            <div class="medications">
                <h3>Rp/</h3>
                <ol>
                    ${rx.medications.map(med => `
                        <li>
                            <strong>${med.name}</strong>
                            ${med.dosage ? ` - ${med.dosage}` : ''}
                            ${med.route ? ` (vía ${med.route})` : ''}
                            <br>
                            ${med.frequency ? `Tomar ${med.frequency}` : ''}
                            ${med.duration ? ` durante ${med.duration}` : ''}
                        </li>
                    `).join('')}
                </ol>
            </div>
            
            ${rx.instructions ? `
                <div class="instructions">
                    <h4>Indicaciones adicionales:</h4>
                    <p>${rx.instructions}</p>
                </div>
            ` : ''}
            
            <div class="signature">
                <div class="signature-line"></div>
                <p><strong>${rx.doctorName}</strong></p>
            </div>
        </body>
        </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 250);
}

/**
 * Delete prescription
 */
export async function deletePrescription(prescriptionId) {
    const confirmed = await showConfirm(
        'Eliminar Receta',
        '¿Estás seguro de eliminar esta receta?',
        'Eliminar',
        'Cancelar'
    );
    
    if (!confirmed) return;
    
    try {
        await deleteDoc(doc(db, "prescriptions", prescriptionId));
        
        // Update cache
        const index = state.prescriptionsCache.findIndex(r => r.id === prescriptionId);
        if (index > -1) state.prescriptionsCache.splice(index, 1);
        
        showToast('Receta eliminada', 'success');
        renderPrescriptions();
    } catch (error) {
        console.error("Error deleting prescription:", error);
        showToast('Error al eliminar la receta', 'error');
    }
}

// Make functions globally available
window.viewPrescription = viewPrescription;
window.printPrescription = printPrescription;
window.deletePrescription = deletePrescription;
