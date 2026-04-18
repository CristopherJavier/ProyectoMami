// ============================================================
// MedRecord Pro - Access Logs / Audit Trail
// ============================================================

export const AccessLogs = {
    STORAGE_KEY: 'medrecord-access-logs',
    MAX_LOGS: 1000,
    
    LOG_ACTIONS: {
        VIEW_PATIENT: 'view_patient',
        EDIT_PATIENT: 'edit_patient',
        CREATE_PATIENT: 'create_patient',
        DELETE_PATIENT: 'delete_patient',
        VIEW_NOTE: 'view_note',
        CREATE_NOTE: 'create_note',
        EDIT_NOTE: 'edit_note',
        VIEW_PRESCRIPTION: 'view_prescription',
        CREATE_PRESCRIPTION: 'create_prescription',
        EXPORT_DATA: 'export_data',
        LOGIN: 'login',
        LOGOUT: 'logout'
    },
    
    // Initialize logs from localStorage
    init() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        this.logs = stored ? JSON.parse(stored) : [];
    },
    
    // Add a new log entry
    log(action, details = {}) {
        if (!this.logs) this.init();
        
        const entry = {
            id: this.generateId(),
            timestamp: new Date().toISOString(),
            action,
            details,
            userAgent: navigator.userAgent.substring(0, 100)
        };
        
        this.logs.unshift(entry);
        
        // Trim to max size
        if (this.logs.length > this.MAX_LOGS) {
            this.logs = this.logs.slice(0, this.MAX_LOGS);
        }
        
        this.save();
        return entry;
    },
    
    // Generate unique ID
    generateId() {
        return 'log_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    },
    
    // Save to localStorage
    save() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    },
    
    // Get logs with optional filters
    getLogs(filters = {}) {
        if (!this.logs) this.init();
        
        let filtered = [...this.logs];
        
        if (filters.action) {
            filtered = filtered.filter(l => l.action === filters.action);
        }
        
        if (filters.patientId) {
            filtered = filtered.filter(l => l.details.patientId === filters.patientId);
        }
        
        if (filters.startDate) {
            const start = new Date(filters.startDate);
            filtered = filtered.filter(l => new Date(l.timestamp) >= start);
        }
        
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            filtered = filtered.filter(l => new Date(l.timestamp) <= end);
        }
        
        if (filters.limit) {
            filtered = filtered.slice(0, filters.limit);
        }
        
        return filtered;
    },
    
    // Get logs for a specific patient
    getPatientLogs(patientId, limit = 50) {
        return this.getLogs({ patientId, limit });
    },
    
    // Get recent activity
    getRecentActivity(limit = 20) {
        return this.getLogs({ limit });
    },
    
    // Format action for display
    formatAction(action) {
        const actionLabels = {
            view_patient: { label: 'Vio expediente', icon: 'eye', type: 'view' },
            edit_patient: { label: 'Editó paciente', icon: 'pencil', type: 'edit' },
            create_patient: { label: 'Creó paciente', icon: 'plus', type: 'create' },
            delete_patient: { label: 'Eliminó paciente', icon: 'trash', type: 'delete' },
            view_note: { label: 'Vio nota clínica', icon: 'eye', type: 'view' },
            create_note: { label: 'Creó nota clínica', icon: 'plus', type: 'create' },
            edit_note: { label: 'Editó nota', icon: 'pencil', type: 'edit' },
            view_prescription: { label: 'Vio receta', icon: 'eye', type: 'view' },
            create_prescription: { label: 'Creó receta', icon: 'plus', type: 'create' },
            export_data: { label: 'Exportó datos', icon: 'download', type: 'export' },
            login: { label: 'Inició sesión', icon: 'sign-in', type: 'auth' },
            logout: { label: 'Cerró sesión', icon: 'sign-out', type: 'auth' }
        };
        
        return actionLabels[action] || { label: action, icon: 'info', type: 'other' };
    },
    
    // Format timestamp for display
    formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours} h`;
        if (diffDays < 7) return `Hace ${diffDays} días`;
        
        return date.toLocaleDateString('es-ES', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Render single log entry
    renderLogEntry(log) {
        const action = this.formatAction(log.action);
        const target = log.details.patientName || log.details.target || '';
        
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
                    ${this.formatTimestamp(log.timestamp)}
                </div>
            </div>
        `;
    },
    
    // Render logs list
    renderLogsList(limit = 20) {
        const logs = this.getRecentActivity(limit);
        
        if (logs.length === 0) {
            return `
                <div style="text-align: center; padding: 40px; color: var(--text-secondary);">
                    <i class="ph ph-clipboard-text" style="font-size: 48px; opacity: 0.5;"></i>
                    <p style="margin-top: 12px;">No hay actividad registrada</p>
                </div>
            `;
        }
        
        return `
            <div class="access-logs-container">
                ${logs.map(log => this.renderLogEntry(log)).join('')}
            </div>
        `;
    },
    
    // Render audit section for settings/reports
    renderAuditSection() {
        return `
            <div class="audit-section" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 24px; margin-bottom: 24px;">
                <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
                    <i class="ph ph-clipboard-text"></i> Registro de Actividad
                </h3>
                <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 14px;">
                    Historial de accesos y modificaciones a expedientes médicos.
                </p>
                ${this.renderLogsList(15)}
                <div style="text-align: center; margin-top: 16px;">
                    <button class="btn-secondary" onclick="AccessLogs.showFullLogs()">
                        Ver historial completo
                    </button>
                </div>
            </div>
        `;
    },
    
    // Export logs for compliance
    exportLogs(startDate, endDate) {
        const logs = this.getLogs({ startDate, endDate });
        const csv = this.logsToCSV(logs);
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-log_${startDate}_${endDate}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    },
    
    // Convert logs to CSV format
    logsToCSV(logs) {
        const headers = ['Timestamp', 'Acción', 'Detalles', 'User Agent'];
        const rows = logs.map(log => [
            log.timestamp,
            this.formatAction(log.action).label,
            JSON.stringify(log.details),
            log.userAgent
        ]);
        
        return [
            headers.join(','),
            ...rows.map(r => r.map(c => `"${c}"`).join(','))
        ].join('\n');
    },
    
    showFullLogs() {
        // This would open a modal with full logs
        console.log('Show full logs modal');
    }
};

// Initialize on load
AccessLogs.init();

// Make globally available
window.AccessLogs = AccessLogs;

export default AccessLogs;
