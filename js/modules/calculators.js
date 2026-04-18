// ============================================================
// MedRecord Pro - Medical Calculators
// ============================================================

export const MedicalCalculators = {
    
    // BMI Calculator
    calculateBMI(weightKg, heightCm) {
        const heightM = heightCm / 100;
        const bmi = weightKg / (heightM * heightM);
        return {
            value: bmi.toFixed(1),
            interpretation: this.interpretBMI(bmi),
            color: this.getBMIColor(bmi)
        };
    },
    
    interpretBMI(bmi) {
        if (bmi < 18.5) return { text: 'Bajo peso', severity: 'warning' };
        if (bmi < 25) return { text: 'Peso normal', severity: 'success' };
        if (bmi < 30) return { text: 'Sobrepeso', severity: 'warning' };
        if (bmi < 35) return { text: 'Obesidad Grado I', severity: 'danger' };
        if (bmi < 40) return { text: 'Obesidad Grado II', severity: 'danger' };
        return { text: 'Obesidad Grado III', severity: 'danger' };
    },
    
    getBMIColor(bmi) {
        if (bmi < 18.5 || bmi >= 25) return 'var(--color-orange)';
        return 'var(--color-green)';
    },
    
    // Creatinine Clearance (Cockcroft-Gault)
    calculateCreatinineClearance(age, weightKg, creatinine, isFemale) {
        let clearance = ((140 - age) * weightKg) / (72 * creatinine);
        if (isFemale) clearance *= 0.85;
        
        return {
            value: clearance.toFixed(1),
            interpretation: this.interpretCreatinineClearance(clearance),
            unit: 'mL/min'
        };
    },
    
    interpretCreatinineClearance(clearance) {
        if (clearance >= 90) return { text: 'Función renal normal', severity: 'success' };
        if (clearance >= 60) return { text: 'ERC Estadio 2 (leve)', severity: 'warning' };
        if (clearance >= 30) return { text: 'ERC Estadio 3 (moderada)', severity: 'warning' };
        if (clearance >= 15) return { text: 'ERC Estadio 4 (severa)', severity: 'danger' };
        return { text: 'ERC Estadio 5 (falla renal)', severity: 'danger' };
    },
    
    // Pediatric Dose Calculator (Clark's Rule)
    calculatePediatricDose(adultDose, childWeightKg) {
        // Clark's rule: Child dose = (Weight in kg / 70) × Adult dose
        const childDose = (childWeightKg / 70) * adultDose;
        return {
            value: childDose.toFixed(2),
            formula: `(${childWeightKg}kg / 70) × ${adultDose}mg`,
            unit: 'mg'
        };
    },
    
    // Body Surface Area (Mosteller formula)
    calculateBSA(heightCm, weightKg) {
        const bsa = Math.sqrt((heightCm * weightKg) / 3600);
        return {
            value: bsa.toFixed(2),
            unit: 'm²'
        };
    },
    
    // Ideal Body Weight (Devine formula)
    calculateIdealWeight(heightCm, isMale) {
        const heightInches = heightCm / 2.54;
        let ibw;
        
        if (isMale) {
            ibw = 50 + 2.3 * (heightInches - 60);
        } else {
            ibw = 45.5 + 2.3 * (heightInches - 60);
        }
        
        return {
            value: Math.max(ibw, 0).toFixed(1),
            unit: 'kg'
        };
    },
    
    // Corrected QT Interval (Bazett's formula)
    calculateQTc(qtInterval, heartRate) {
        const rrInterval = 60 / heartRate;
        const qtc = qtInterval / Math.sqrt(rrInterval);
        
        return {
            value: qtc.toFixed(0),
            unit: 'ms',
            interpretation: this.interpretQTc(qtc)
        };
    },
    
    interpretQTc(qtc) {
        if (qtc < 440) return { text: 'Normal', severity: 'success' };
        if (qtc < 460) return { text: 'Límite', severity: 'warning' };
        return { text: 'Prolongado', severity: 'danger' };
    },
    
    // Mean Arterial Pressure
    calculateMAP(systolic, diastolic) {
        const map = diastolic + (systolic - diastolic) / 3;
        return {
            value: map.toFixed(0),
            unit: 'mmHg',
            interpretation: this.interpretMAP(map)
        };
    },
    
    interpretMAP(map) {
        if (map < 60) return { text: 'Hipoperfusión', severity: 'danger' };
        if (map <= 100) return { text: 'Normal', severity: 'success' };
        return { text: 'Elevada', severity: 'warning' };
    },
    
    // Render calculator cards HTML
    renderCalculatorSection() {
        return `
            <div class="section-header">
                <h2><i class="ph ph-calculator"></i> Calculadoras Médicas</h2>
            </div>
            
            <div class="calculator-grid">
                <!-- BMI Calculator -->
                <div class="calculator-card">
                    <h3><i class="ph ph-scales"></i> Índice de Masa Corporal (IMC)</h3>
                    <div class="calc-input-group">
                        <label>Peso (kg)</label>
                        <input type="number" id="bmi-weight" placeholder="70" step="0.1">
                    </div>
                    <div class="calc-input-group">
                        <label>Altura (cm)</label>
                        <input type="number" id="bmi-height" placeholder="170">
                    </div>
                    <button class="btn-calculate" onclick="MedicalCalculators.displayBMI()">
                        Calcular IMC
                    </button>
                    <div class="calc-result" id="bmi-result" style="display: none;"></div>
                </div>
                
                <!-- Creatinine Clearance -->
                <div class="calculator-card">
                    <h3><i class="ph ph-drop"></i> Depuración de Creatinina</h3>
                    <div class="calc-input-group">
                        <label>Edad (años)</label>
                        <input type="number" id="crcl-age" placeholder="45">
                    </div>
                    <div class="calc-input-group">
                        <label>Peso (kg)</label>
                        <input type="number" id="crcl-weight" placeholder="70" step="0.1">
                    </div>
                    <div class="calc-input-group">
                        <label>Creatinina sérica (mg/dL)</label>
                        <input type="number" id="crcl-creatinine" placeholder="1.0" step="0.01">
                    </div>
                    <div class="calc-input-group">
                        <label>Sexo</label>
                        <select id="crcl-sex">
                            <option value="male">Masculino</option>
                            <option value="female">Femenino</option>
                        </select>
                    </div>
                    <button class="btn-calculate" onclick="MedicalCalculators.displayCrCl()">
                        Calcular CrCl
                    </button>
                    <div class="calc-result" id="crcl-result" style="display: none;"></div>
                </div>
                
                <!-- Pediatric Dose -->
                <div class="calculator-card">
                    <h3><i class="ph ph-baby"></i> Dosis Pediátrica</h3>
                    <div class="calc-input-group">
                        <label>Dosis adulto (mg)</label>
                        <input type="number" id="ped-adult-dose" placeholder="500" step="0.1">
                    </div>
                    <div class="calc-input-group">
                        <label>Peso del niño (kg)</label>
                        <input type="number" id="ped-weight" placeholder="20" step="0.1">
                    </div>
                    <button class="btn-calculate" onclick="MedicalCalculators.displayPedDose()">
                        Calcular Dosis
                    </button>
                    <div class="calc-result" id="ped-result" style="display: none;"></div>
                </div>
                
                <!-- Body Surface Area -->
                <div class="calculator-card">
                    <h3><i class="ph ph-person-arms-spread"></i> Superficie Corporal (BSA)</h3>
                    <div class="calc-input-group">
                        <label>Altura (cm)</label>
                        <input type="number" id="bsa-height" placeholder="170">
                    </div>
                    <div class="calc-input-group">
                        <label>Peso (kg)</label>
                        <input type="number" id="bsa-weight" placeholder="70" step="0.1">
                    </div>
                    <button class="btn-calculate" onclick="MedicalCalculators.displayBSA()">
                        Calcular BSA
                    </button>
                    <div class="calc-result" id="bsa-result" style="display: none;"></div>
                </div>
                
                <!-- Mean Arterial Pressure -->
                <div class="calculator-card">
                    <h3><i class="ph ph-heart-rate"></i> Presión Arterial Media</h3>
                    <div class="calc-input-group">
                        <label>Presión Sistólica (mmHg)</label>
                        <input type="number" id="map-systolic" placeholder="120">
                    </div>
                    <div class="calc-input-group">
                        <label>Presión Diastólica (mmHg)</label>
                        <input type="number" id="map-diastolic" placeholder="80">
                    </div>
                    <button class="btn-calculate" onclick="MedicalCalculators.displayMAP()">
                        Calcular PAM
                    </button>
                    <div class="calc-result" id="map-result" style="display: none;"></div>
                </div>
                
                <!-- Ideal Body Weight -->
                <div class="calculator-card">
                    <h3><i class="ph ph-target"></i> Peso Ideal</h3>
                    <div class="calc-input-group">
                        <label>Altura (cm)</label>
                        <input type="number" id="ibw-height" placeholder="170">
                    </div>
                    <div class="calc-input-group">
                        <label>Sexo</label>
                        <select id="ibw-sex">
                            <option value="male">Masculino</option>
                            <option value="female">Femenino</option>
                        </select>
                    </div>
                    <button class="btn-calculate" onclick="MedicalCalculators.displayIBW()">
                        Calcular Peso Ideal
                    </button>
                    <div class="calc-result" id="ibw-result" style="display: none;"></div>
                </div>
            </div>
        `;
    },
    
    // Display functions for each calculator
    displayBMI() {
        const weight = parseFloat(document.getElementById('bmi-weight').value);
        const height = parseFloat(document.getElementById('bmi-height').value);
        const resultDiv = document.getElementById('bmi-result');
        
        if (!weight || !height) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Complete todos los campos</p>';
            resultDiv.style.display = 'block';
            return;
        }
        
        const result = this.calculateBMI(weight, height);
        resultDiv.innerHTML = `
            <div class="result-value" style="color: ${result.color}">${result.value}</div>
            <div class="result-label">kg/m²</div>
            <div class="result-interpretation" style="color: ${result.color}">${result.interpretation.text}</div>
        `;
        resultDiv.style.display = 'block';
    },
    
    displayCrCl() {
        const age = parseFloat(document.getElementById('crcl-age').value);
        const weight = parseFloat(document.getElementById('crcl-weight').value);
        const creatinine = parseFloat(document.getElementById('crcl-creatinine').value);
        const isFemale = document.getElementById('crcl-sex').value === 'female';
        const resultDiv = document.getElementById('crcl-result');
        
        if (!age || !weight || !creatinine) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Complete todos los campos</p>';
            resultDiv.style.display = 'block';
            return;
        }
        
        const result = this.calculateCreatinineClearance(age, weight, creatinine, isFemale);
        const color = result.interpretation.severity === 'success' ? 'var(--color-green)' : 
                      result.interpretation.severity === 'warning' ? 'var(--color-orange)' : 'var(--color-red)';
        
        resultDiv.innerHTML = `
            <div class="result-value" style="color: ${color}">${result.value}</div>
            <div class="result-label">${result.unit}</div>
            <div class="result-interpretation" style="color: ${color}">${result.interpretation.text}</div>
        `;
        resultDiv.style.display = 'block';
    },
    
    displayPedDose() {
        const adultDose = parseFloat(document.getElementById('ped-adult-dose').value);
        const weight = parseFloat(document.getElementById('ped-weight').value);
        const resultDiv = document.getElementById('ped-result');
        
        if (!adultDose || !weight) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Complete todos los campos</p>';
            resultDiv.style.display = 'block';
            return;
        }
        
        const result = this.calculatePediatricDose(adultDose, weight);
        resultDiv.innerHTML = `
            <div class="result-value">${result.value}</div>
            <div class="result-label">${result.unit}</div>
            <div class="result-interpretation">Fórmula: ${result.formula}</div>
        `;
        resultDiv.style.display = 'block';
    },
    
    displayBSA() {
        const height = parseFloat(document.getElementById('bsa-height').value);
        const weight = parseFloat(document.getElementById('bsa-weight').value);
        const resultDiv = document.getElementById('bsa-result');
        
        if (!height || !weight) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Complete todos los campos</p>';
            resultDiv.style.display = 'block';
            return;
        }
        
        const result = this.calculateBSA(height, weight);
        resultDiv.innerHTML = `
            <div class="result-value">${result.value}</div>
            <div class="result-label">${result.unit}</div>
        `;
        resultDiv.style.display = 'block';
    },
    
    displayMAP() {
        const systolic = parseFloat(document.getElementById('map-systolic').value);
        const diastolic = parseFloat(document.getElementById('map-diastolic').value);
        const resultDiv = document.getElementById('map-result');
        
        if (!systolic || !diastolic) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Complete todos los campos</p>';
            resultDiv.style.display = 'block';
            return;
        }
        
        const result = this.calculateMAP(systolic, diastolic);
        const color = result.interpretation.severity === 'success' ? 'var(--color-green)' : 
                      result.interpretation.severity === 'warning' ? 'var(--color-orange)' : 'var(--color-red)';
        
        resultDiv.innerHTML = `
            <div class="result-value" style="color: ${color}">${result.value}</div>
            <div class="result-label">${result.unit}</div>
            <div class="result-interpretation" style="color: ${color}">${result.interpretation.text}</div>
        `;
        resultDiv.style.display = 'block';
    },
    
    displayIBW() {
        const height = parseFloat(document.getElementById('ibw-height').value);
        const isMale = document.getElementById('ibw-sex').value === 'male';
        const resultDiv = document.getElementById('ibw-result');
        
        if (!height) {
            resultDiv.innerHTML = '<p style="color: var(--color-red);">Ingrese la altura</p>';
            resultDiv.style.display = 'block';
            return;
        }
        
        const result = this.calculateIdealWeight(height, isMale);
        resultDiv.innerHTML = `
            <div class="result-value">${result.value}</div>
            <div class="result-label">${result.unit}</div>
        `;
        resultDiv.style.display = 'block';
    }
};

// Make globally available for onclick handlers
window.MedicalCalculators = MedicalCalculators;

export default MedicalCalculators;
