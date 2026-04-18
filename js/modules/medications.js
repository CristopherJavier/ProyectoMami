// ============================================================
// MedRecord Pro - Medication Tracker
// ============================================================

export const MedicationTracker = {
    
    // Calculate days remaining for a prescription
    calculateDaysRemaining(startDate, durationDays, takenDoses = 0, totalDosesPerDay = 1) {
        const start = new Date(startDate);
        const today = new Date();
        const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24));
        return Math.max(0, durationDays - daysPassed);
    },
    
    // Get medication status
    getMedicationStatus(daysRemaining, totalDays) {
        const percentRemaining = (daysRemaining / totalDays) * 100;
        
        if (daysRemaining === 0) {
            return { status: 'completed', label: 'Finalizado', color: 'var(--color-green)' };
        }
        if (percentRemaining <= 20) {
            return { status: 'ending', label: 'Por terminar', color: 'var(--color-orange)' };
        }
        return { status: 'active', label: 'Activo', color: 'var(--color-teal)' };
    },
    
    // Format dosage schedule
    formatSchedule(frequency) {
        const schedules = {
            'once': ['08:00'],
            'twice': ['08:00', '20:00'],
            'three': ['08:00', '14:00', '20:00'],
            'four': ['06:00', '12:00', '18:00', '00:00'],
            'prn': ['PRN']
        };
        return schedules[frequency] || schedules['once'];
    },
    
    // Render medication card
    renderMedicationCard(medication) {
        const daysRemaining = this.calculateDaysRemaining(
            medication.startDate, 
            medication.durationDays
        );
        const status = this.getMedicationStatus(daysRemaining, medication.durationDays);
        const schedule = this.formatSchedule(medication.frequency);
        
        return `
            <div class="medication-card">
                <div class="medication-icon">
                    <i class="ph ph-pill"></i>
                </div>
                <div class="medication-info">
                    <h4>${medication.name}</h4>
                    <p>${medication.dose} - ${medication.route}</p>
                    <div class="medication-schedule">
                        ${schedule.map(time => `
                            <span class="dose-time">${time}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="medication-status">
                    <div class="days-left" style="color: ${status.color}">${daysRemaining}</div>
                    <div class="days-label">días restantes</div>
                    <span class="status-badge" style="background: ${status.color}; color: white; 
                                                       padding: 2px 8px; border-radius: 10px; 
                                                       font-size: 10px; margin-top: 4px; display: inline-block;">
                        ${status.label}
                    </span>
                </div>
            </div>
        `;
    },
    
    // Render medications list
    renderMedicationsList(medications) {
        if (!medications || medications.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="ph ph-pill" style="font-size: 48px; opacity: 0.5;"></i>
                    <p style="margin-top: 12px;">No hay medicamentos activos</p>
                </div>
            `;
        }
        
        const activeMeds = medications.filter(m => {
            const daysRemaining = this.calculateDaysRemaining(m.startDate, m.durationDays);
            return daysRemaining > 0;
        });
        
        return activeMeds.map(med => this.renderMedicationCard(med)).join('');
    },
    
    // Convert prescription to medication tracking format
    prescriptionToMedication(prescription) {
        return {
            id: prescription.id,
            name: prescription.medication,
            dose: prescription.dose,
            route: prescription.route || 'Vía oral',
            frequency: prescription.frequency,
            startDate: prescription.date,
            durationDays: parseInt(prescription.duration) || 7,
            patientId: prescription.patientId,
            notes: prescription.instructions
        };
    },
    
    // Get upcoming dose reminders
    getUpcomingDoses(medications, hoursAhead = 4) {
        const now = new Date();
        const upcoming = [];
        
        medications.forEach(med => {
            const schedule = this.formatSchedule(med.frequency);
            schedule.forEach(time => {
                if (time === 'PRN') return;
                
                const [hours, minutes] = time.split(':').map(Number);
                const doseTime = new Date();
                doseTime.setHours(hours, minutes, 0, 0);
                
                const diffHours = (doseTime - now) / (1000 * 60 * 60);
                
                if (diffHours > 0 && diffHours <= hoursAhead) {
                    upcoming.push({
                        medication: med.name,
                        dose: med.dose,
                        time: time,
                        timeUntil: Math.round(diffHours * 60) // minutes
                    });
                }
            });
        });
        
        return upcoming.sort((a, b) => a.timeUntil - b.timeUntil);
    },
    
    // Render patient medication summary
    renderPatientMedicationSummary(patientId, prescriptions) {
        const patientPrescriptions = prescriptions.filter(p => p.patientId === patientId);
        const medications = patientPrescriptions.map(p => this.prescriptionToMedication(p));
        
        return `
            <div class="patient-medications-section">
                <h4><i class="ph ph-pill"></i> Medicamentos Activos</h4>
                ${this.renderMedicationsList(medications)}
            </div>
        `;
    }
};

export default MedicationTracker;
