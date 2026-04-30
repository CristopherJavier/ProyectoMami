// ============================================================
// MedRecord Pro - Complete PDF Export
// ============================================================

export const CompletePDFExport = {
    
    // Generate complete patient history PDF
    async generatePatientHistoryPDF(patient, notes, vitals, prescriptions, appointments) {
        // This uses the existing jsPDF from the app
        const { jsPDF } = window.jspdf || await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        
        const doc = new jsPDF();
        let yPos = 20;
        const lineHeight = 7;
        const pageHeight = 280;
        const margin = 20;
        
        // Helper to add new page if needed
        const checkNewPage = (neededSpace = 30) => {
            if (yPos + neededSpace > pageHeight) {
                doc.addPage();
                yPos = 20;
                return true;
            }
            return false;
        };
        
        // Header
        doc.setFillColor(30, 58, 95);
        doc.rect(0, 0, 210, 35, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('HISTORIAL CLÍNICO COMPLETO', margin, 20);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', { 
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
        })}`, margin, 28);
        
        yPos = 50;
        doc.setTextColor(0, 0, 0);
        
        // Patient Information Section
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, yPos - 5, 170, 50, 'F');
        doc.setDrawColor(226, 232, 240);
        doc.rect(margin, yPos - 5, 170, 50, 'S');
        
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS DEL PACIENTE', margin + 5, yPos + 5);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        yPos += 15;
        
        const age = this.calculateAge(patient.dob);
        doc.text(`Nombre: ${patient.name}`, margin + 5, yPos);
        doc.text(`Fecha de Nacimiento: ${new Date(patient.dob).toLocaleDateString('es-ES')}`, margin + 100, yPos);
        yPos += lineHeight;
        doc.text(`Edad: ${age} años`, margin + 5, yPos);
        doc.text(`Sexo: ${patient.sex}`, margin + 100, yPos);
        yPos += lineHeight;
        doc.text(`Tipo de Sangre: ${patient.bloodType || 'No especificado'}`, margin + 5, yPos);
        doc.text(`Teléfono: ${patient.phone || 'No especificado'}`, margin + 100, yPos);
        
        yPos += 20;
        
        // Allergies Warning
        if (patient.allergies && patient.allergies.trim()) {
            checkNewPage(25);
            doc.setFillColor(254, 226, 226);
            doc.rect(margin, yPos - 5, 170, 20, 'F');
            doc.setDrawColor(239, 68, 68);
            doc.rect(margin, yPos - 5, 170, 20, 'S');
            doc.setTextColor(185, 28, 28);
            doc.setFont('helvetica', 'bold');
            doc.text('⚠️ ALERGIAS:', margin + 5, yPos + 5);
            doc.setFont('helvetica', 'normal');
            doc.text(patient.allergies, margin + 40, yPos + 5);
            doc.setTextColor(0, 0, 0);
            yPos += 25;
        }
        
        // Active Conditions
        if (patient.conditions && patient.conditions.trim()) {
            checkNewPage(20);
            doc.setFont('helvetica', 'bold');
            doc.text('Condiciones Activas:', margin, yPos);
            doc.setFont('helvetica', 'normal');
            doc.text(patient.conditions, margin + 45, yPos);
            yPos += 15;
        }
        
        // Vital Signs Section
        if (vitals && vitals.length > 0) {
            checkNewPage(40);
            doc.setFillColor(220, 252, 231);
            doc.rect(margin, yPos - 3, 170, 10, 'F');
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('SIGNOS VITALES RECIENTES', margin + 5, yPos + 4);
            yPos += 15;
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text('Fecha', margin, yPos);
            doc.text('PA', margin + 35, yPos);
            doc.text('FC', margin + 60, yPos);
            doc.text('Temp', margin + 80, yPos);
            doc.text('FR', margin + 100, yPos);
            doc.text('SpO2', margin + 120, yPos);
            doc.text('Peso', margin + 145, yPos);
            yPos += lineHeight;
            
            doc.setFont('helvetica', 'normal');
            vitals.slice(0, 5).forEach(vital => {
                checkNewPage();
                const date = vital.date ? new Date(vital.date).toLocaleDateString('es-ES') : '-';
                doc.text(date, margin, yPos);
                doc.text(`${vital.systolic || '-'}/${vital.diastolic || '-'}`, margin + 35, yPos);
                doc.text(`${vital.pulse ?? vital.heartRate ?? '-'}`, margin + 60, yPos);
                doc.text(`${vital.temperature || '-'}°C`, margin + 80, yPos);
                doc.text(`${vital.respiratoryRate || '-'}`, margin + 100, yPos);
                doc.text(`${vital.oxygen ?? vital.oxygenSat ?? vital.oxygenSaturation ?? '-'}%`, margin + 120, yPos);
                doc.text(`${vital.weight || '-'} kg`, margin + 145, yPos);
                yPos += lineHeight;
            });
            yPos += 10;
        }
        
        // Clinical Notes Section
        if (notes && notes.length > 0) {
            checkNewPage(40);
            doc.setFillColor(243, 232, 255);
            doc.rect(margin, yPos - 3, 170, 10, 'F');
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('NOTAS CLÍNICAS', margin + 5, yPos + 4);
            yPos += 15;
            
            notes.forEach((note, index) => {
                checkNewPage(40);
                const noteDate = note.createdAt?.toDate ? note.createdAt.toDate() : new Date(note.createdAt);
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(`${index + 1}. ${note.type || 'Nota'} - ${noteDate.toLocaleDateString('es-ES')}`, margin, yPos);
                yPos += lineHeight;
                
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(9);
                
                // Wrap text for notes
                const lines = doc.splitTextToSize(note.content || '', 165);
                lines.forEach(line => {
                    checkNewPage();
                    doc.text(line, margin + 5, yPos);
                    yPos += 5;
                });
                yPos += 5;
            });
        }
        
        // Prescriptions Section
        if (prescriptions && prescriptions.length > 0) {
            checkNewPage(40);
            doc.setFillColor(255, 237, 213);
            doc.rect(margin, yPos - 3, 170, 10, 'F');
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('RECETAS MÉDICAS', margin + 5, yPos + 4);
            yPos += 15;
            
            prescriptions.forEach(rx => {
                checkNewPage(25);
                const rxDate = rx.date ? new Date(rx.date).toLocaleDateString('es-ES') : '-';
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                doc.text(`${rx.medication}`, margin, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(`(${rxDate})`, margin + 80, yPos);
                yPos += lineHeight;
                doc.setFontSize(9);
                doc.text(`Dosis: ${rx.dose} | Frecuencia: ${rx.frequency} | Duración: ${rx.duration}`, margin + 5, yPos);
                yPos += lineHeight;
                if (rx.instructions) {
                    doc.text(`Indicaciones: ${rx.instructions}`, margin + 5, yPos);
                    yPos += lineHeight;
                }
                yPos += 3;
            });
        }
        
        // Appointments History
        if (appointments && appointments.length > 0) {
            checkNewPage(40);
            doc.setFillColor(204, 251, 241);
            doc.rect(margin, yPos - 3, 170, 10, 'F');
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('HISTORIAL DE CITAS', margin + 5, yPos + 4);
            yPos += 15;
            
            doc.setFontSize(9);
            appointments.slice(0, 10).forEach(apt => {
                checkNewPage();
                const aptDate = apt.date ? new Date(apt.date).toLocaleDateString('es-ES') : '-';
                doc.text(`${aptDate} ${apt.time || ''} - ${apt.type || 'Consulta'} - ${apt.status || 'Programada'}`, margin, yPos);
                yPos += lineHeight;
            });
        }
        
        // Footer on all pages
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text(`MedRecord Pro - Historial de ${patient.name} - Página ${i} de ${pageCount}`, 105, 290, { align: 'center' });
            doc.text('DOCUMENTO CONFIDENCIAL - USO MÉDICO EXCLUSIVO', 105, 295, { align: 'center' });
        }
        
        // Save PDF
        doc.save(`Historial_${patient.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
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
    
    // Render export button
    renderExportButton() {
        return `
            <button class="btn-backup export" id="export-history-btn" style="margin-top: 12px;">
                <i class="ph ph-file-pdf"></i>
                Exportar Historial Completo (PDF)
            </button>
        `;
    }
};

export default CompletePDFExport;
