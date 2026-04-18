// ============================================================
// MedRecord Pro - Dashboard Charts & Statistics
// ============================================================

export const DashboardCharts = {
    
    // Calculate statistics from data
    calculateStats(patients, appointments, notes) {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
        
        // Patients stats
        const totalPatients = patients.length;
        const patientsThisMonth = patients.filter(p => {
            const created = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
            return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
        }).length;
        const patientsLastMonth = patients.filter(p => {
            const created = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
            return created.getMonth() === lastMonth && created.getFullYear() === lastMonthYear;
        }).length;
        
        // Appointments stats
        const today = now.toISOString().split('T')[0];
        const appointmentsToday = appointments.filter(a => a.date === today).length;
        const appointmentsThisMonth = appointments.filter(a => {
            const aptDate = new Date(a.date);
            return aptDate.getMonth() === thisMonth && aptDate.getFullYear() === thisYear;
        }).length;
        const appointmentsLastMonth = appointments.filter(a => {
            const aptDate = new Date(a.date);
            return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === lastMonthYear;
        }).length;
        
        // Notes stats
        const notesThisMonth = notes.filter(n => {
            const created = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
            return created.getMonth() === thisMonth && created.getFullYear() === thisYear;
        }).length;
        
        // Calculate percentage changes
        const patientChange = patientsLastMonth > 0 ? 
            Math.round(((patientsThisMonth - patientsLastMonth) / patientsLastMonth) * 100) : 
            patientsThisMonth > 0 ? 100 : 0;
        
        const appointmentChange = appointmentsLastMonth > 0 ?
            Math.round(((appointmentsThisMonth - appointmentsLastMonth) / appointmentsLastMonth) * 100) :
            appointmentsThisMonth > 0 ? 100 : 0;
        
        return {
            totalPatients,
            patientsThisMonth,
            patientChange,
            appointmentsToday,
            appointmentsThisMonth,
            appointmentChange,
            notesThisMonth
        };
    },
    
    // Get appointments by day of week
    getAppointmentsByDay(appointments) {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const counts = [0, 0, 0, 0, 0, 0, 0];
        
        appointments.forEach(apt => {
            const date = new Date(apt.date);
            counts[date.getDay()]++;
        });
        
        return days.map((day, i) => ({ day, count: counts[i] }));
    },
    
    // Get appointments by type
    getAppointmentsByType(appointments) {
        const types = {};
        
        appointments.forEach(apt => {
            const type = apt.type || 'Consulta General';
            types[type] = (types[type] || 0) + 1;
        });
        
        return Object.entries(types).map(([type, count]) => ({ type, count }));
    },
    
    // Get patients by age group
    getPatientsByAgeGroup(patients) {
        const groups = {
            '0-17': 0,
            '18-30': 0,
            '31-45': 0,
            '46-60': 0,
            '61+': 0
        };
        
        patients.forEach(p => {
            const age = this.calculateAge(p.dob);
            if (age <= 17) groups['0-17']++;
            else if (age <= 30) groups['18-30']++;
            else if (age <= 45) groups['31-45']++;
            else if (age <= 60) groups['46-60']++;
            else groups['61+']++;
        });
        
        return Object.entries(groups).map(([group, count]) => ({ group, count }));
    },
    
    // Get monthly trend data
    getMonthlyTrend(items, dateField = 'createdAt', months = 6) {
        const result = [];
        const now = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = month.toLocaleDateString('es-ES', { month: 'short' });
            
            const count = items.filter(item => {
                const itemDate = item[dateField]?.toDate ? item[dateField].toDate() : new Date(item[dateField]);
                return itemDate.getMonth() === month.getMonth() && 
                       itemDate.getFullYear() === month.getFullYear();
            }).length;
            
            result.push({ month: monthStr, count });
        }
        
        return result;
    },
    
    calculateAge(dob) {
        const today = new Date();
        const birth = new Date(dob);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    },
    
    // Render stats grid
    renderStatsGrid(stats) {
        return `
            <div class="stats-grid">
                <div class="mini-stat">
                    <div class="stat-icon" style="background: var(--bg-teal-light);">
                        <i class="ph ph-users" style="color: var(--color-teal);"></i>
                    </div>
                    <div class="stat-value">${stats.totalPatients}</div>
                    <div class="stat-label">Pacientes Total</div>
                    <div class="stat-change ${stats.patientChange >= 0 ? 'positive' : 'negative'}">
                        <i class="ph ph-trend-${stats.patientChange >= 0 ? 'up' : 'down'}"></i>
                        ${Math.abs(stats.patientChange)}% este mes
                    </div>
                </div>
                
                <div class="mini-stat">
                    <div class="stat-icon" style="background: var(--bg-purple-light);">
                        <i class="ph ph-calendar-check" style="color: var(--color-purple);"></i>
                    </div>
                    <div class="stat-value">${stats.appointmentsToday}</div>
                    <div class="stat-label">Citas Hoy</div>
                    <div class="stat-change ${stats.appointmentChange >= 0 ? 'positive' : 'negative'}">
                        <i class="ph ph-trend-${stats.appointmentChange >= 0 ? 'up' : 'down'}"></i>
                        ${Math.abs(stats.appointmentChange)}% vs mes anterior
                    </div>
                </div>
                
                <div class="mini-stat">
                    <div class="stat-icon" style="background: var(--bg-orange-light);">
                        <i class="ph ph-calendar" style="color: var(--color-orange);"></i>
                    </div>
                    <div class="stat-value">${stats.appointmentsThisMonth}</div>
                    <div class="stat-label">Citas Este Mes</div>
                </div>
                
                <div class="mini-stat">
                    <div class="stat-icon" style="background: var(--bg-green-light);">
                        <i class="ph ph-note" style="color: var(--color-green);"></i>
                    </div>
                    <div class="stat-value">${stats.notesThisMonth}</div>
                    <div class="stat-label">Notas Este Mes</div>
                </div>
            </div>
        `;
    },
    
    // Render simple bar chart (CSS-based)
    renderBarChart(data, title, maxValue = null) {
        const max = maxValue || Math.max(...data.map(d => d.count), 1);
        
        return `
            <div class="chart-container">
                <div class="chart-header">
                    <h3>${title}</h3>
                </div>
                <div class="bar-chart" style="display: flex; align-items: flex-end; gap: 8px; height: 200px; padding-top: 20px;">
                    ${data.map(item => `
                        <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                            <span style="font-size: 12px; font-weight: 600; margin-bottom: 4px;">${item.count}</span>
                            <div style="
                                width: 100%;
                                height: ${(item.count / max) * 150}px;
                                min-height: 4px;
                                background: linear-gradient(180deg, var(--primary-blue), var(--light-blue));
                                border-radius: 4px 4px 0 0;
                                transition: height 0.3s ease;
                            "></div>
                            <span style="font-size: 11px; color: var(--text-secondary); margin-top: 8px;">
                                ${item.day || item.month || item.group || item.type}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // Render pie/donut chart (CSS-based)
    renderDonutChart(data, title) {
        const total = data.reduce((sum, d) => sum + d.count, 0);
        const colors = ['#3B82F6', '#22C55E', '#F97316', '#A855F7', '#14B8A6', '#EF4444'];
        
        let cumulativePercent = 0;
        const segments = data.map((item, i) => {
            const percent = (item.count / total) * 100;
            const segment = {
                ...item,
                percent,
                color: colors[i % colors.length],
                startAngle: cumulativePercent * 3.6,
                endAngle: (cumulativePercent + percent) * 3.6
            };
            cumulativePercent += percent;
            return segment;
        });
        
        return `
            <div class="chart-container">
                <div class="chart-header">
                    <h3>${title}</h3>
                </div>
                <div style="display: flex; align-items: center; gap: 24px;">
                    <div style="
                        width: 150px;
                        height: 150px;
                        border-radius: 50%;
                        background: conic-gradient(
                            ${segments.map(s => `${s.color} ${s.startAngle}deg ${s.endAngle}deg`).join(', ')}
                        );
                        position: relative;
                    ">
                        <div style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            width: 80px;
                            height: 80px;
                            background: var(--bg-card);
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 24px;
                            font-weight: 700;
                        ">${total}</div>
                    </div>
                    <div class="chart-legend" style="flex: 1;">
                        ${segments.map(s => `
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                <div style="width: 12px; height: 12px; background: ${s.color}; border-radius: 3px;"></div>
                                <span style="flex: 1; font-size: 13px;">${s.type || s.group}</span>
                                <span style="font-weight: 600;">${s.count}</span>
                                <span style="color: var(--text-secondary); font-size: 12px;">(${s.percent.toFixed(0)}%)</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },
    
    // Render full dashboard
    renderDashboard(patients, appointments, notes) {
        const stats = this.calculateStats(patients, appointments, notes);
        const appointmentsByDay = this.getAppointmentsByDay(appointments);
        const appointmentsByType = this.getAppointmentsByType(appointments);
        const patientsByAge = this.getPatientsByAgeGroup(patients);
        const monthlyTrend = this.getMonthlyTrend(patients, 'createdAt', 6);
        
        return `
            ${this.renderStatsGrid(stats)}
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px;">
                ${this.renderBarChart(monthlyTrend, 'Pacientes Nuevos (Últimos 6 meses)')}
                ${this.renderBarChart(appointmentsByDay, 'Citas por Día de la Semana')}
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; margin-top: 24px;">
                ${this.renderDonutChart(appointmentsByType, 'Citas por Tipo')}
                ${this.renderDonutChart(patientsByAge, 'Pacientes por Edad')}
            </div>
        `;
    }
};

export default DashboardCharts;
