// ============================================================
// MedRecord Pro - Advanced Search
// ============================================================

export const AdvancedSearch = {
    
    // Search patients with multiple filters
    searchPatients(patients, filters) {
        let results = [...patients];
        
        // Text search (name, phone)
        if (filters.query) {
            const query = filters.query.toLowerCase();
            results = results.filter(p => 
                p.name.toLowerCase().includes(query) ||
                (p.phone && p.phone.includes(query))
            );
        }
        
        // Age range
        if (filters.minAge !== undefined || filters.maxAge !== undefined) {
            results = results.filter(p => {
                const age = this.calculateAge(p.dob);
                if (filters.minAge !== undefined && age < filters.minAge) return false;
                if (filters.maxAge !== undefined && age > filters.maxAge) return false;
                return true;
            });
        }
        
        // Sex filter
        if (filters.sex) {
            results = results.filter(p => p.sex === filters.sex);
        }
        
        // Blood type
        if (filters.bloodType) {
            results = results.filter(p => p.bloodType === filters.bloodType);
        }
        
        // Has allergies
        if (filters.hasAllergies !== undefined) {
            results = results.filter(p => {
                const hasAllergies = p.allergies && p.allergies.trim().length > 0;
                return filters.hasAllergies ? hasAllergies : !hasAllergies;
            });
        }
        
        // Has conditions
        if (filters.condition) {
            const condition = filters.condition.toLowerCase();
            results = results.filter(p => 
                p.conditions && p.conditions.toLowerCase().includes(condition)
            );
        }
        
        // Date range (created)
        if (filters.createdAfter) {
            const after = new Date(filters.createdAfter);
            results = results.filter(p => new Date(p.createdAt) >= after);
        }
        
        if (filters.createdBefore) {
            const before = new Date(filters.createdBefore);
            results = results.filter(p => new Date(p.createdAt) <= before);
        }
        
        return results;
    },
    
    // Search appointments
    searchAppointments(appointments, filters) {
        let results = [...appointments];
        
        // Patient filter
        if (filters.patientId) {
            results = results.filter(a => a.patientId === filters.patientId);
        }
        
        // Date range
        if (filters.dateFrom) {
            results = results.filter(a => a.date >= filters.dateFrom);
        }
        
        if (filters.dateTo) {
            results = results.filter(a => a.date <= filters.dateTo);
        }
        
        // Type filter
        if (filters.type) {
            results = results.filter(a => a.type === filters.type);
        }
        
        // Status filter
        if (filters.status) {
            results = results.filter(a => a.status === filters.status);
        }
        
        return results;
    },
    
    // Search clinical notes
    searchNotes(notes, filters) {
        let results = [...notes];
        
        // Patient filter
        if (filters.patientId) {
            results = results.filter(n => n.patientId === filters.patientId);
        }
        
        // Content search
        if (filters.query) {
            const query = filters.query.toLowerCase();
            results = results.filter(n => 
                n.content && n.content.toLowerCase().includes(query)
            );
        }
        
        // Type filter
        if (filters.type) {
            results = results.filter(n => n.type === filters.type);
        }
        
        // Date range
        if (filters.dateFrom) {
            results = results.filter(n => {
                const noteDate = n.createdAt?.toDate ? n.createdAt.toDate() : new Date(n.createdAt);
                return noteDate >= new Date(filters.dateFrom);
            });
        }
        
        return results;
    },
    
    // Calculate age from DOB
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
    
    // Render advanced search panel
    renderSearchPanel() {
        return `
            <div class="advanced-search-panel">
                <h3 style="margin-bottom: 16px; display: flex; align-items: center; gap: 8px;">
                    <i class="ph ph-magnifying-glass"></i> Búsqueda Avanzada
                </h3>
                <div class="search-filters">
                    <div class="filter-group">
                        <label>Nombre o Teléfono</label>
                        <input type="text" id="search-query" placeholder="Buscar...">
                    </div>
                    <div class="filter-group">
                        <label>Edad Mínima</label>
                        <input type="number" id="search-min-age" placeholder="0" min="0">
                    </div>
                    <div class="filter-group">
                        <label>Edad Máxima</label>
                        <input type="number" id="search-max-age" placeholder="120" min="0">
                    </div>
                    <div class="filter-group">
                        <label>Sexo</label>
                        <select id="search-sex">
                            <option value="">Todos</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Tipo de Sangre</label>
                        <select id="search-blood">
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
                        <label>Condición Médica</label>
                        <input type="text" id="search-condition" placeholder="Ej: Diabetes">
                    </div>
                    <div class="filter-group">
                        <label>Con Alergias</label>
                        <select id="search-allergies">
                            <option value="">Todos</option>
                            <option value="yes">Sí tiene alergias</option>
                            <option value="no">Sin alergias</option>
                        </select>
                    </div>
                    <div class="filter-group">
                        <label>Registrado Desde</label>
                        <input type="date" id="search-date-from">
                    </div>
                </div>
                <div class="search-actions">
                    <button class="btn-primary" id="apply-search-btn">
                        <i class="ph ph-magnifying-glass"></i> Buscar
                    </button>
                    <button class="btn-secondary" id="clear-search-btn">
                        <i class="ph ph-x"></i> Limpiar Filtros
                    </button>
                </div>
            </div>
        `;
    },
    
    // Get current filter values from form
    getFiltersFromForm() {
        return {
            query: document.getElementById('search-query')?.value || '',
            minAge: document.getElementById('search-min-age')?.value ? 
                    parseInt(document.getElementById('search-min-age').value) : undefined,
            maxAge: document.getElementById('search-max-age')?.value ? 
                    parseInt(document.getElementById('search-max-age').value) : undefined,
            sex: document.getElementById('search-sex')?.value || '',
            bloodType: document.getElementById('search-blood')?.value || '',
            condition: document.getElementById('search-condition')?.value || '',
            hasAllergies: document.getElementById('search-allergies')?.value === 'yes' ? true :
                          document.getElementById('search-allergies')?.value === 'no' ? false : undefined,
            createdAfter: document.getElementById('search-date-from')?.value || ''
        };
    },
    
    // Clear all filters
    clearFilters() {
        document.getElementById('search-query').value = '';
        document.getElementById('search-min-age').value = '';
        document.getElementById('search-max-age').value = '';
        document.getElementById('search-sex').value = '';
        document.getElementById('search-blood').value = '';
        document.getElementById('search-condition').value = '';
        document.getElementById('search-allergies').value = '';
        document.getElementById('search-date-from').value = '';
    },
    
    // Count active filters
    countActiveFilters() {
        const filters = this.getFiltersFromForm();
        let count = 0;
        
        if (filters.query) count++;
        if (filters.minAge !== undefined) count++;
        if (filters.maxAge !== undefined) count++;
        if (filters.sex) count++;
        if (filters.bloodType) count++;
        if (filters.condition) count++;
        if (filters.hasAllergies !== undefined) count++;
        if (filters.createdAfter) count++;
        
        return count;
    }
};

export default AdvancedSearch;
