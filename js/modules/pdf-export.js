// ============================================================
// MedRecord Pro - PDF Export Module
// ============================================================

import { state } from './state.js';
import { formatDate, calculateAge, filterClinicalContent } from './utils.js';
import { showToast, showLoading, hideLoading } from './ui.js';

/**
 * Generate patient record PDF
 */
export async function exportPatientPDF(patientId) {
    const patient = state.patientsCache.find(p => p.id === patientId);
    if (!patient) {
        showToast('Paciente no encontrado', 'error');
        return;
    }
    
    showLoading('Generando PDF...');
    
    try {
        // Get patient data
        const patientNotes = state.notesCache.filter(n => n.patientId === patientId);
        const patientAppointments = state.appointmentsCache.filter(a => a.patientId === patientId);
        const patientVitals = state.vitalSignsCache?.filter(v => v.patientId === patientId) || [];
        const patientPrescriptions = state.prescriptionsCache?.filter(r => r.patientId === patientId) || [];
        
        const age = calculateAge(patient.birthDate);
        const doctor = state.currentDoctorData;
        
        // Generate HTML content
        const htmlContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Expediente - ${patient.name}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { 
                        font-family: 'Segoe UI', Arial, sans-serif; 
                        padding: 40px; 
                        color: #333;
                        line-height: 1.6;
                    }
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        border-bottom: 3px solid #1e3a5f;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    .logo-section h1 {
                        color: #1e3a5f;
                        font-size: 28px;
                        margin-bottom: 5px;
                    }
                    .logo-section p {
                        color: #666;
                        font-size: 14px;
                    }
                    .doctor-info {
                        text-align: right;
                        font-size: 14px;
                    }
                    .doctor-info strong {
                        color: #1e3a5f;
                        font-size: 16px;
                    }
                    .section {
                        margin-bottom: 30px;
                        page-break-inside: avoid;
                    }
                    .section-title {
                        background: #1e3a5f;
                        color: white;
                        padding: 10px 15px;
                        font-size: 16px;
                        font-weight: 600;
                        margin-bottom: 15px;
                        border-radius: 4px;
                    }
                    .info-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 15px;
                    }
                    .info-item {
                        padding: 10px;
                        background: #f8f9fa;
                        border-radius: 4px;
                    }
                    .info-item label {
                        display: block;
                        font-size: 11px;
                        color: #666;
                        text-transform: uppercase;
                        margin-bottom: 4px;
                    }
                    .info-item span {
                        font-size: 14px;
                        font-weight: 500;
                        color: #333;
                    }
                    .notes-list, .appointments-list, .vitals-list {
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        overflow: hidden;
                    }
                    .note-item, .appointment-item, .vital-item {
                        padding: 15px;
                        border-bottom: 1px solid #eee;
                    }
                    .note-item:last-child, .appointment-item:last-child, .vital-item:last-child {
                        border-bottom: none;
                    }
                    .note-header, .appointment-header {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 8px;
                    }
                    .note-type, .appointment-type {
                        background: #e3f2fd;
                        color: #1565c0;
                        padding: 2px 8px;
                        border-radius: 3px;
                        font-size: 12px;
                    }
                    .note-date, .appointment-date {
                        color: #666;
                        font-size: 12px;
                    }
                    .note-content {
                        font-size: 14px;
                        white-space: pre-wrap;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 13px;
                    }
                    th, td {
                        padding: 10px;
                        text-align: left;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background: #f5f5f5;
                        font-weight: 600;
                        color: #333;
                    }
                    .footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                    .empty-message {
                        padding: 20px;
                        text-align: center;
                        color: #999;
                        font-style: italic;
                    }
                    @media print {
                        body { padding: 20px; }
                        .section { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-section">
                        <h1>MedRecord Pro</h1>
                        <p>Expediente Clínico Digital</p>
                    </div>
                    <div class="doctor-info">
                        <strong>${doctor?.nombre || 'Doctor'}</strong><br>
                        ${doctor?.rol || 'Médico'}<br>
                        ${doctor?.licencia ? `Cédula: ${doctor.licencia}` : ''}
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">📋 Datos del Paciente</div>
                    <div class="info-grid">
                        <div class="info-item">
                            <label>Nombre Completo</label>
                            <span>${patient.name}</span>
                        </div>
                        <div class="info-item">
                            <label>ID de Paciente</label>
                            <span>${patient.id.substring(0, 8).toUpperCase()}</span>
                        </div>
                        <div class="info-item">
                            <label>Fecha de Nacimiento</label>
                            <span>${formatDate(patient.birthDate, 'full')}</span>
                        </div>
                        <div class="info-item">
                            <label>Edad</label>
                            <span>${age} años</span>
                        </div>
                        <div class="info-item">
                            <label>Sexo</label>
                            <span>${patient.sex}</span>
                        </div>
                        <div class="info-item">
                            <label>Tipo de Sangre</label>
                            <span>${patient.bloodType || 'No registrado'}</span>
                        </div>
                        <div class="info-item">
                            <label>Teléfono</label>
                            <span>${patient.phone || 'No registrado'}</span>
                        </div>
                        <div class="info-item">
                            <label>Alergias</label>
                            <span>${patient.allergies || 'Ninguna conocida'}</span>
                        </div>
                        <div class="info-item">
                            <label>Condiciones Preexistentes</label>
                            <span>${patient.conditions || 'Ninguna'}</span>
                        </div>
                    </div>
                </div>
                
                ${patientVitals.length > 0 ? `
                    <div class="section">
                        <div class="section-title">💓 Últimos Signos Vitales</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>P/A</th>
                                    <th>Pulso</th>
                                    <th>Temp</th>
                                    <th>Peso</th>
                                    <th>O₂</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${patientVitals.slice(0, 5).map(v => `
                                    <tr>
                                        <td>${formatDate(v.recordedAt)}</td>
                                        <td>${v.systolic || '-'}/${v.diastolic || '-'} mmHg</td>
                                        <td>${v.pulse || '-'} bpm</td>
                                        <td>${v.temperature || '-'}°C</td>
                                        <td>${v.weight || '-'} kg</td>
                                        <td>${v.oxygen || '-'}%</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                
                <div class="section">
                    <div class="section-title">📝 Notas Clínicas</div>
                    ${patientNotes.length > 0 ? `
                        <div class="notes-list">
                            ${patientNotes.map(note => `
                                <div class="note-item">
                                    <div class="note-header">
                                        <span class="note-type">${note.type}</span>
                                        <span class="note-date">${formatDate(note.createdAt, 'full')}</span>
                                    </div>
                                    <div class="note-content">${filterClinicalContent(note.content)}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="empty-message">No hay notas clínicas registradas</div>'}
                </div>
                
                <div class="section">
                    <div class="section-title">📅 Historial de Citas</div>
                    ${patientAppointments.length > 0 ? `
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Tipo</th>
                                    <th>Notas</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${patientAppointments.map(apt => `
                                    <tr>
                                        <td>${formatDate(apt.date)}</td>
                                        <td>${formatDate(apt.date, 'time')}</td>
                                        <td>${apt.type}</td>
                                        <td>${apt.notes || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    ` : '<div class="empty-message">No hay citas registradas</div>'}
                </div>
                
                ${patientPrescriptions.length > 0 ? `
                    <div class="section">
                        <div class="section-title">💊 Recetas Emitidas</div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Diagnóstico</th>
                                    <th>Medicamentos</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${patientPrescriptions.map(rx => `
                                    <tr>
                                        <td>${formatDate(rx.createdAt)}</td>
                                        <td>${rx.diagnosis || '-'}</td>
                                        <td>${rx.medications.map(m => m.name).join(', ')}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                
                <div class="footer">
                    <p>Documento generado el ${formatDate(new Date(), 'full')} por MedRecord Pro</p>
                    <p>Este documento es confidencial y está protegido por la ley de protección de datos personales.</p>
                </div>
            </body>
            </html>
        `;
        
        // Open print dialog
        const printWindow = window.open('', '_blank');
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        
        hideLoading();
        
        setTimeout(() => {
            printWindow.print();
        }, 500);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        hideLoading();
        showToast('Error al generar el PDF', 'error');
    }
}

/**
 * Export appointments report
 */
export function exportAppointmentsReport(startDate, endDate) {
    const filteredAppointments = state.appointmentsCache.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= new Date(startDate) && aptDate <= new Date(endDate);
    });
    
    const htmlContent = generateReportHTML(
        'Reporte de Citas',
        `Del ${formatDate(startDate)} al ${formatDate(endDate)}`,
        `
            <table>
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
                    ${filteredAppointments.map(apt => {
                        const patient = state.patientsCache.find(p => p.id === apt.patientId);
                        return `
                            <tr>
                                <td>${formatDate(apt.date)}</td>
                                <td>${formatDate(apt.date, 'time')}</td>
                                <td>${patient?.name || 'N/A'}</td>
                                <td>${apt.type}</td>
                                <td>${apt.notes || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
            <p style="margin-top: 20px;"><strong>Total de citas:</strong> ${filteredAppointments.length}</p>
        `
    );
    
    openPrintWindow(htmlContent);
}

/**
 * Export patients list
 */
export function exportPatientsList() {
    const activePatients = state.patientsCache.filter(p => p.status === 'active' || !p.status);
    
    const htmlContent = generateReportHTML(
        'Lista de Pacientes',
        `Total: ${activePatients.length} pacientes activos`,
        `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Edad</th>
                        <th>Sexo</th>
                        <th>Teléfono</th>
                        <th>Tipo de Sangre</th>
                    </tr>
                </thead>
                <tbody>
                    ${activePatients.map(p => `
                        <tr>
                            <td>${p.id.substring(0, 8).toUpperCase()}</td>
                            <td>${p.name}</td>
                            <td>${calculateAge(p.birthDate)} años</td>
                            <td>${p.sex}</td>
                            <td>${p.phone || '-'}</td>
                            <td>${p.bloodType || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `
    );
    
    openPrintWindow(htmlContent);
}

/**
 * Generate report HTML template
 */
function generateReportHTML(title, subtitle, content) {
    const doctor = state.currentDoctorData;
    
    return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <title>${title}</title>
            <style>
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    padding: 40px; 
                    color: #333;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px solid #1e3a5f;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .header h1 {
                    color: #1e3a5f;
                    margin-bottom: 5px;
                }
                .header p {
                    color: #666;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                }
                th, td {
                    padding: 10px;
                    text-align: left;
                    border-bottom: 1px solid #ddd;
                }
                th {
                    background: #f5f5f5;
                    font-weight: 600;
                }
                .footer {
                    margin-top: 40px;
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${title}</h1>
                <p>${subtitle}</p>
                <p>${doctor?.nombre || 'Doctor'} - ${formatDate(new Date(), 'full')}</p>
            </div>
            
            ${content}
            
            <div class="footer">
                <p>Generado por MedRecord Pro</p>
            </div>
        </body>
        </html>
    `;
}

/**
 * Open print window
 */
function openPrintWindow(htmlContent) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
}

// Make functions globally available
window.exportPatientPDF = exportPatientPDF;
window.exportAppointmentsReport = exportAppointmentsReport;
window.exportPatientsList = exportPatientsList;
