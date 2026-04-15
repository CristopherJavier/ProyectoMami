// ============================================================
// MedRecord Pro - Basic Tests
// ============================================================
// 
// Run with: node js/tests/basic-tests.js
// Or open tests.html in browser
//
// ============================================================

const TestSuite = {
    passed: 0,
    failed: 0,
    results: [],
    
    // Test runner
    run(name, testFn) {
        try {
            testFn();
            this.passed++;
            this.results.push({ name, status: 'PASS' });
            console.log(`✅ PASS: ${name}`);
        } catch (error) {
            this.failed++;
            this.results.push({ name, status: 'FAIL', error: error.message });
            console.log(`❌ FAIL: ${name}`);
            console.log(`   Error: ${error.message}`);
        }
    },
    
    // Assertions
    assertEqual(actual, expected, message = '') {
        if (actual !== expected) {
            throw new Error(`${message} Expected: ${expected}, Got: ${actual}`);
        }
    },
    
    assertTrue(value, message = '') {
        if (!value) {
            throw new Error(`${message} Expected true, got ${value}`);
        }
    },
    
    assertFalse(value, message = '') {
        if (value) {
            throw new Error(`${message} Expected false, got ${value}`);
        }
    },
    
    assertDefined(value, message = '') {
        if (value === undefined || value === null) {
            throw new Error(`${message} Expected defined value, got ${value}`);
        }
    },
    
    // Summary
    summary() {
        console.log('\n========================================');
        console.log(`Tests: ${this.passed + this.failed} | Passed: ${this.passed} | Failed: ${this.failed}`);
        console.log('========================================\n');
        return this.failed === 0;
    }
};

// ============================================================
// TESTS
// ============================================================

// Test: BMI Calculation
TestSuite.run('BMI calculation for normal weight', () => {
    const weight = 70;
    const height = 175;
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    
    TestSuite.assertTrue(bmi > 18.5 && bmi < 25, 'BMI should be in normal range');
    TestSuite.assertEqual(Math.round(bmi * 10) / 10, 22.9, 'BMI should be ~22.9');
});

TestSuite.run('BMI calculation for overweight', () => {
    const weight = 80;
    const height = 170;
    const heightM = height / 100;
    const bmi = weight / (heightM * heightM);
    // 80 / (1.7 * 1.7) = 27.68
    
    TestSuite.assertTrue(bmi >= 25 && bmi < 30, 'BMI should indicate overweight');
});

// Test: Age Calculation
TestSuite.run('Age calculation', () => {
    const birthDate = '1990-01-15';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    TestSuite.assertTrue(age >= 34, 'Age should be calculated correctly');
});

// Test: Creatinine Clearance (Cockcroft-Gault)
TestSuite.run('Creatinine clearance calculation', () => {
    const age = 45;
    const weight = 70;
    const creatinine = 1.0;
    const isFemale = false;
    
    let clearance = ((140 - age) * weight) / (72 * creatinine);
    if (isFemale) clearance *= 0.85;
    
    TestSuite.assertTrue(clearance > 80 && clearance < 120, 'CrCl should be in normal range');
});

// Test: Pediatric Dose (Clark's Rule)
TestSuite.run('Pediatric dose calculation', () => {
    const adultDose = 500;
    const childWeight = 20;
    const childDose = (childWeight / 70) * adultDose;
    
    TestSuite.assertEqual(Math.round(childDose), 143, 'Child dose should be ~143mg');
});

// Test: Body Surface Area (Mosteller)
TestSuite.run('BSA calculation', () => {
    const height = 170;
    const weight = 70;
    const bsa = Math.sqrt((height * weight) / 3600);
    
    TestSuite.assertTrue(bsa > 1.5 && bsa < 2.5, 'BSA should be reasonable');
    TestSuite.assertEqual(Math.round(bsa * 100) / 100, 1.82, 'BSA should be ~1.82 m²');
});

// Test: Mean Arterial Pressure
TestSuite.run('MAP calculation', () => {
    const systolic = 120;
    const diastolic = 80;
    const map = diastolic + (systolic - diastolic) / 3;
    
    TestSuite.assertEqual(Math.round(map), 93, 'MAP should be ~93 mmHg');
    TestSuite.assertTrue(map >= 60 && map <= 100, 'MAP should be in normal range');
});

// Test: Ideal Body Weight (Devine)
TestSuite.run('Ideal body weight calculation - male', () => {
    const height = 175;
    const heightInches = height / 2.54;
    const ibw = 50 + 2.3 * (heightInches - 60);
    
    TestSuite.assertTrue(ibw > 60 && ibw < 90, 'IBW should be reasonable for male');
});

TestSuite.run('Ideal body weight calculation - female', () => {
    const height = 165;
    const heightInches = height / 2.54;
    const ibw = 45.5 + 2.3 * (heightInches - 60);
    
    TestSuite.assertTrue(ibw > 50 && ibw < 80, 'IBW should be reasonable for female');
});

// Test: Date formatting
TestSuite.run('Date formatting', () => {
    const date = new Date('2024-03-15');
    const formatted = date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
    
    TestSuite.assertDefined(formatted, 'Date should format correctly');
    TestSuite.assertTrue(formatted.includes('2024'), 'Should contain year');
});

// Test: Allergy parsing
TestSuite.run('Allergy string parsing', () => {
    const allergiesStr = 'Penicilina, Látex, Mariscos';
    const allergies = allergiesStr.split(',').map(a => a.trim()).filter(a => a);
    
    TestSuite.assertEqual(allergies.length, 3, 'Should parse 3 allergies');
    TestSuite.assertEqual(allergies[0], 'Penicilina', 'First allergy should be Penicilina');
});

// Test: Empty allergy handling
TestSuite.run('Empty allergy handling', () => {
    const allergiesStr = '';
    const allergies = allergiesStr ? allergiesStr.split(',').map(a => a.trim()).filter(a => a) : [];
    
    TestSuite.assertEqual(allergies.length, 0, 'Should handle empty allergies');
});

// Test: Days remaining calculation
TestSuite.run('Medication days remaining', () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 3); // Started 3 days ago
    const durationDays = 7;
    const today = new Date();
    const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(0, durationDays - daysPassed);
    
    TestSuite.assertEqual(daysRemaining, 4, 'Should have 4 days remaining');
});

// Test: ID generation
TestSuite.run('Unique ID generation', () => {
    const generateId = () => 'id_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
    
    const id1 = generateId();
    const id2 = generateId();
    
    TestSuite.assertTrue(id1 !== id2, 'IDs should be unique');
    TestSuite.assertTrue(id1.startsWith('id_'), 'ID should start with id_');
});

// Test: Theme toggle
TestSuite.run('Theme value validation', () => {
    const validThemes = ['light', 'dark'];
    const currentTheme = 'light';
    
    TestSuite.assertTrue(validThemes.includes(currentTheme), 'Theme should be valid');
    
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    TestSuite.assertEqual(newTheme, 'dark', 'Theme toggle should switch correctly');
});

// Test: Backup date check
TestSuite.run('Backup reminder calculation', () => {
    const lastBackup = new Date();
    lastBackup.setDate(lastBackup.getDate() - 10); // 10 days ago
    const reminderDays = 7;
    const daysSinceBackup = Math.floor((Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24));
    
    TestSuite.assertTrue(daysSinceBackup >= reminderDays, 'Should trigger backup reminder');
});

// Run summary
const allPassed = TestSuite.summary();

// Export for browser/node
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TestSuite, allPassed };
}
if (typeof window !== 'undefined') {
    window.TestSuite = TestSuite;
    window.allTestsPassed = allPassed;
}
