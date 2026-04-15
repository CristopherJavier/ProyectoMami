// ============================================================
// MedRecord Pro - Allergy Alerts System
// ============================================================

export const AllergyAlerts = {
    
    // Severity levels
    SEVERITY: {
        MILD: 'mild',
        MODERATE: 'moderate',
        SEVERE: 'severe',
        LIFE_THREATENING: 'life-threatening'
    },
    
    // Common drug interactions/allergies
    commonAllergens: {
        medications: [
            'Penicilina', 'Amoxicilina', 'Ampicilina', 'Cefalosporinas',
            'Sulfonamidas', 'Aspirina', 'Ibuprofeno', 'Naproxeno',
            'Morfina', 'Codeína', 'Tramadol',
            'Lidocaína', 'Procaína',
            'Metformina', 'Insulina',
            'Contraste yodado', 'Gadolinio'
        ],
        foods: [
            'Mariscos', 'Pescado', 'Maní', 'Nueces', 'Huevo',
            'Leche', 'Soya', 'Trigo', 'Gluten'
        ],
        environmental: [
            'Látex', 'Polen', 'Ácaros', 'Pelo de mascota',
            'Picadura de abeja', 'Picadura de hormiga'
        ]
    },
    
    // Check if patient has allergies
    hasAllergies(patient) {
        return patient.allergies && patient.allergies.trim().length > 0;
    },
    
    // Parse allergies string into array
    parseAllergies(allergiesString) {
        if (!allergiesString) return [];
        return allergiesString
            .split(',')
            .map(a => a.trim())
            .filter(a => a.length > 0);
    },
    
    // Check for potential drug interaction
    checkDrugInteraction(patientAllergies, medication) {
        const allergies = this.parseAllergies(patientAllergies);
        const medLower = medication.toLowerCase();
        
        const interactions = [];
        
        allergies.forEach(allergy => {
            const allergyLower = allergy.toLowerCase();
            
            // Direct match
            if (medLower.includes(allergyLower) || allergyLower.includes(medLower)) {
                interactions.push({
                    allergy,
                    medication,
                    risk: 'HIGH',
                    message: `El paciente es alérgico a ${allergy}`
                });
            }
            
            // Cross-reactivity checks
            if (allergyLower.includes('penicilina') && 
                (medLower.includes('amoxicilina') || medLower.includes('ampicilina'))) {
                interactions.push({
                    allergy,
                    medication,
                    risk: 'HIGH',
                    message: 'Posible reacción cruzada con penicilinas'
                });
            }
            
            if (allergyLower.includes('aspirina') && 
                (medLower.includes('ibuprofeno') || medLower.includes('naproxeno'))) {
                interactions.push({
                    allergy,
                    medication,
                    risk: 'MODERATE',
                    message: 'Posible sensibilidad cruzada con AINEs'
                });
            }
        });
        
        return interactions;
    },
    
    // Render allergy alert banner
    renderAllergyAlert(patient) {
        if (!this.hasAllergies(patient)) return '';
        
        const allergies = this.parseAllergies(patient.allergies);
        
        return `
            <div class="allergy-alert">
                <i class="ph ph-warning-circle"></i>
                <div class="allergy-alert-content">
                    <h4>⚠️ ALERGIAS CONOCIDAS</h4>
                    <p>
                        ${allergies.map(a => `<span class="allergy-tag">${a}</span>`).join(' ')}
                    </p>
                </div>
            </div>
        `;
    },
    
    // Render compact allergy indicator
    renderAllergyIndicator(patient) {
        if (!this.hasAllergies(patient)) return '';
        
        const allergies = this.parseAllergies(patient.allergies);
        const count = allergies.length;
        
        return `
            <span class="allergy-indicator" title="Alergias: ${allergies.join(', ')}" 
                  style="display: inline-flex; align-items: center; gap: 4px; 
                         background: var(--bg-red-light); color: var(--color-red);
                         padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600;">
                <i class="ph ph-warning"></i> ${count} ${count === 1 ? 'Alergia' : 'Alergias'}
            </span>
        `;
    },
    
    // Render drug interaction warning modal
    renderInteractionWarning(interactions) {
        if (interactions.length === 0) return '';
        
        return `
            <div class="interaction-warning" style="
                background: var(--bg-red-light);
                border: 2px solid var(--color-red);
                border-radius: 12px;
                padding: 16px;
                margin: 16px 0;
            ">
                <h4 style="color: var(--color-red); display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
                    <i class="ph ph-warning-octagon"></i>
                    ⚠️ ALERTA DE INTERACCIÓN
                </h4>
                ${interactions.map(i => `
                    <div style="padding: 8px; background: white; border-radius: 8px; margin-bottom: 8px;">
                        <strong style="color: var(--color-red);">[${i.risk}]</strong>
                        ${i.message}
                    </div>
                `).join('')}
                <p style="font-size: 12px; color: var(--text-secondary); margin-top: 12px;">
                    Verifique la información antes de prescribir.
                </p>
            </div>
        `;
    },
    
    // Render allergy input with suggestions
    renderAllergyInput() {
        const allSuggestions = [
            ...this.commonAllergens.medications,
            ...this.commonAllergens.foods,
            ...this.commonAllergens.environmental
        ];
        
        return `
            <datalist id="allergy-suggestions">
                ${allSuggestions.map(a => `<option value="${a}">`).join('')}
            </datalist>
        `;
    },
    
    // Get allergy category
    getAllergyCategory(allergy) {
        const allergyLower = allergy.toLowerCase();
        
        if (this.commonAllergens.medications.some(m => m.toLowerCase() === allergyLower)) {
            return { category: 'medication', icon: 'pill', color: 'var(--color-red)' };
        }
        if (this.commonAllergens.foods.some(f => f.toLowerCase() === allergyLower)) {
            return { category: 'food', icon: 'bowl-food', color: 'var(--color-orange)' };
        }
        if (this.commonAllergens.environmental.some(e => e.toLowerCase() === allergyLower)) {
            return { category: 'environmental', icon: 'tree', color: 'var(--color-teal)' };
        }
        return { category: 'other', icon: 'warning', color: 'var(--text-secondary)' };
    }
};

export default AllergyAlerts;
