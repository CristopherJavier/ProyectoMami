// ============================================================
// MedRecord Pro - Appointment Notifications System
// ============================================================

export const NotificationManager = {
    STORAGE_KEY: 'medrecord-notifications',
    notificationPermission: false,
    scheduledNotifications: [],
    
    async init() {
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                this.notificationPermission = true;
            }
        }
        
        // Load scheduled notifications from storage
        this.loadScheduledNotifications();
        
        // Start checking for upcoming appointments
        this.startNotificationChecker();
    },
    
    loadScheduledNotifications() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (stored) {
            this.scheduledNotifications = JSON.parse(stored);
        }
    },
    
    saveScheduledNotifications() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.scheduledNotifications));
    },
    
    scheduleAppointmentReminder(appointment) {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`);
        const reminders = [
            { minutes: 1440, label: '24 horas antes' },  // 24 hours
            { minutes: 60, label: '1 hora antes' },      // 1 hour
            { minutes: 15, label: '15 minutos antes' }   // 15 minutes
        ];
        
        reminders.forEach(reminder => {
            const notifyTime = new Date(appointmentDate.getTime() - reminder.minutes * 60000);
            if (notifyTime > new Date()) {
                this.scheduledNotifications.push({
                    id: `${appointment.id}_${reminder.minutes}`,
                    appointmentId: appointment.id,
                    patientName: appointment.patientName,
                    appointmentType: appointment.type,
                    notifyAt: notifyTime.toISOString(),
                    label: reminder.label,
                    sent: false
                });
            }
        });
        
        this.saveScheduledNotifications();
    },
    
    removeAppointmentReminders(appointmentId) {
        this.scheduledNotifications = this.scheduledNotifications.filter(
            n => n.appointmentId !== appointmentId
        );
        this.saveScheduledNotifications();
    },
    
    startNotificationChecker() {
        // Check every minute for pending notifications
        setInterval(() => this.checkPendingNotifications(), 60000);
        // Also check immediately
        this.checkPendingNotifications();
    },
    
    checkPendingNotifications() {
        const now = new Date();
        
        this.scheduledNotifications.forEach(notification => {
            if (!notification.sent && new Date(notification.notifyAt) <= now) {
                this.sendNotification(notification);
                notification.sent = true;
            }
        });
        
        // Clean up sent notifications
        this.scheduledNotifications = this.scheduledNotifications.filter(n => !n.sent);
        this.saveScheduledNotifications();
    },
    
    sendNotification(notification) {
        if (this.notificationPermission && 'Notification' in window) {
            new Notification('🏥 Recordatorio de Cita - MedRecord Pro', {
                body: `${notification.label}: Cita con ${notification.patientName} (${notification.appointmentType})`,
                icon: '/logo.png',
                badge: '/logo.png',
                tag: notification.id,
                requireInteraction: true
            });
        }
        
        // Also show in-app notification
        this.showInAppNotification(notification);
    },
    
    showInAppNotification(notification) {
        const container = document.getElementById('notification-container') || this.createNotificationContainer();
        
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="ph ph-calendar-check"></i>
            </div>
            <div class="toast-content">
                <h4>Recordatorio de Cita</h4>
                <p>${notification.label}: ${notification.patientName}</p>
                <small>${notification.appointmentType}</small>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="ph ph-x"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove after 10 seconds
        setTimeout(() => toast.remove(), 10000);
    },
    
    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
        return container;
    },
    
    getUpcomingAppointments(appointments, hoursAhead = 24) {
        const now = new Date();
        const cutoff = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000);
        
        return appointments.filter(apt => {
            const aptDate = new Date(`${apt.date}T${apt.time}`);
            return aptDate >= now && aptDate <= cutoff;
        }).sort((a, b) => {
            const dateA = new Date(`${a.date}T${a.time}`);
            const dateB = new Date(`${b.date}T${b.time}`);
            return dateA - dateB;
        });
    },
    
    renderNotificationBell(unreadCount = 0) {
        return `
            <div class="notification-bell" id="notification-bell">
                <i class="ph ph-bell"></i>
                ${unreadCount > 0 ? `<span class="notification-badge">${unreadCount}</span>` : ''}
            </div>
        `;
    }
};

// Add toast notification styles
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast-notification {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 16px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        max-width: 350px;
    }
    
    .toast-icon {
        width: 40px;
        height: 40px;
        background: var(--bg-teal-light);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-teal);
        font-size: 20px;
    }
    
    .toast-content h4 {
        font-size: 14px;
        font-weight: 600;
        color: var(--text-primary);
        margin-bottom: 4px;
    }
    
    .toast-content p {
        font-size: 13px;
        color: var(--text-secondary);
    }
    
    .toast-content small {
        font-size: 11px;
        color: var(--text-secondary);
    }
    
    .toast-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 4px;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(toastStyles);

export default NotificationManager;
