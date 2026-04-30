// ============================================================
// MedRecord Pro - Backup & Data Export/Import
// ============================================================

export const BackupManager = {
    
    // Export all data to JSON file
    async exportAllData(db, userId) {
        try {
            const exportData = {
                exportDate: new Date().toISOString(),
                version: '1.0',
                userId: userId,
                data: {
                    patients: [],
                    appointments: [],
                    notes: [],
                    clinicalNotes: [],
                    vitalSigns: [],
                    prescriptions: [],
                    consultations: []
                }
            };

            return exportData;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw error;
        }
    },
    
    // Download data as JSON file
    downloadJSON(data, filename = 'medrecord-backup') {
        const jsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },
    
    // Import data from JSON file
    async importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // Validate structure
                    if (!data.version || !data.data) {
                        reject(new Error('Formato de archivo inválido'));
                        return;
                    }
                    
                    resolve(data);
                } catch (error) {
                    reject(new Error('Error al leer el archivo JSON'));
                }
            };
            
            reader.onerror = () => reject(new Error('Error al leer el archivo'));
            reader.readAsText(file);
        });
    },
    
    // Validate imported data
    validateImportData(data) {
        if (!data || typeof data !== 'object' || !data.data || typeof data.data !== 'object') {
            return { valid: false, errors: ['Estructura de respaldo invalida'] };
        }

        const requiredCollections = ['patients', 'appointments', 'vitalSigns', 'prescriptions'];
        const errors = [];

        requiredCollections.forEach(collection => {
            if (!Array.isArray(data.data[collection])) {
                errors.push(`Coleccion '${collection}' no encontrada o invalida`);
            }
        });

        const notes = data.data.notes ?? data.data.clinicalNotes;
        if (!Array.isArray(notes)) {
            errors.push("Coleccion 'notes/clinicalNotes' no encontrada o invalida");
        }

        if (data.data.consultations !== undefined && !Array.isArray(data.data.consultations)) {
            errors.push("Coleccion 'consultations' invalida");
        }

        return {
            valid: errors.length === 0,
            errors
        };
    },    // Render backup section HTML
    renderBackupSection() {
        return `
            <div class="backup-section">
                <h3><i class="ph ph-cloud-arrow-down"></i> Respaldo de Datos</h3>
                <p style="color: var(--text-secondary); margin-bottom: 16px;">
                    Exporta todos tus datos para respaldo o importa datos de un archivo previo.
                </p>
                <div class="backup-actions">
                    <button class="btn-backup export" id="export-data-btn">
                        <i class="ph ph-download"></i>
                        Exportar Datos
                    </button>
                    <button class="btn-backup import" id="import-data-btn">
                        <i class="ph ph-upload"></i>
                        Importar Datos
                    </button>
                    <input type="file" id="import-file-input" accept=".json" style="display: none;">
                </div>
                <div id="backup-status" style="margin-top: 16px;"></div>
            </div>
        `;
    },
    
    // Show export progress/status
    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('backup-status');
        if (statusDiv) {
            const colors = {
                info: 'var(--primary-blue)',
                success: 'var(--color-green)',
                error: 'var(--color-red)'
            };
            statusDiv.innerHTML = `
                <div style="padding: 12px; background: ${type === 'success' ? 'var(--bg-green-light)' : type === 'error' ? 'var(--bg-red-light)' : 'var(--bg-main)'}; 
                            border-radius: 8px; color: ${colors[type]};">
                    <i class="ph ph-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}"></i>
                    ${message}
                </div>
            `;
        }
    },
    
    // Auto-backup reminder (localStorage based)
    checkAutoBackupReminder() {
        const lastBackup = localStorage.getItem('medrecord-last-backup');
        const reminderDays = 7;
        
        if (!lastBackup) {
            return { needsBackup: true, message: 'Nunca has realizado un respaldo' };
        }
        
        const daysSinceBackup = Math.floor((Date.now() - new Date(lastBackup).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceBackup >= reminderDays) {
            return { 
                needsBackup: true, 
                message: `Han pasado ${daysSinceBackup} días desde tu último respaldo` 
            };
        }
        
        return { needsBackup: false };
    },
    
    setLastBackupDate() {
        localStorage.setItem('medrecord-last-backup', new Date().toISOString());
    }
};

export default BackupManager;
