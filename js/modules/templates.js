// ============================================================
// MedRecord Pro - Clinical Note Templates
// ============================================================

export const ClinicalTemplates = {
    
    templates: {
        'consulta-general': {
            name: 'Consulta General',
            icon: 'stethoscope',
            sections: [
                { title: 'Motivo de consulta', placeholder: 'Describa el motivo principal...' },
                { title: 'Historia de la enfermedad actual', placeholder: 'Cronología, síntomas, duración...' },
                { title: 'Examen físico', placeholder: 'Hallazgos relevantes...' },
                { title: 'Diagnóstico', placeholder: 'Diagnóstico principal y diferenciales...' },
                { title: 'Plan de tratamiento', placeholder: 'Medicamentos, indicaciones, seguimiento...' }
            ]
        },
        'urgencias': {
            name: 'Urgencias',
            icon: 'siren',
            sections: [
                { title: 'Motivo de ingreso', placeholder: 'Síntoma principal y tiempo de evolución...' },
                { title: 'Signos vitales', placeholder: 'TA, FC, FR, Temp, SatO2...' },
                { title: 'Examen físico', placeholder: 'Hallazgos por sistemas...' },
                { title: 'Estudios realizados', placeholder: 'Labs, imágenes, otros...' },
                { title: 'Diagnóstico', placeholder: 'Diagnóstico de urgencia...' },
                { title: 'Manejo inicial', placeholder: 'Tratamiento administrado...' },
                { title: 'Plan', placeholder: 'Alta, observación, hospitalización...' }
            ]
        },
        'pediatria': {
            name: 'Pediatría',
            icon: 'baby',
            sections: [
                { title: 'Motivo de consulta', placeholder: 'Síntoma principal...' },
                { title: 'Antecedentes perinatales', placeholder: 'Embarazo, parto, peso al nacer...' },
                { title: 'Desarrollo psicomotor', placeholder: 'Hitos del desarrollo...' },
                { title: 'Esquema de vacunación', placeholder: 'Vacunas al día, pendientes...' },
                { title: 'Alimentación', placeholder: 'Lactancia, fórmula, alimentación complementaria...' },
                { title: 'Examen físico', placeholder: 'Peso, talla, perímetro cefálico, hallazgos...' },
                { title: 'Diagnóstico y plan', placeholder: 'Diagnóstico y recomendaciones...' }
            ]
        },
        'ginecologia': {
            name: 'Ginecología',
            icon: 'gender-female',
            sections: [
                { title: 'Motivo de consulta', placeholder: 'Síntoma principal...' },
                { title: 'Antecedentes gineco-obstétricos', placeholder: 'G P A C, FUM, ciclos, MAC...' },
                { title: 'Historia clínica', placeholder: 'Detalles del padecimiento...' },
                { title: 'Examen físico', placeholder: 'Mamas, abdomen, especuloscopía...' },
                { title: 'Estudios', placeholder: 'Papanicolaou, US, labs...' },
                { title: 'Diagnóstico', placeholder: 'Diagnóstico principal...' },
                { title: 'Plan', placeholder: 'Tratamiento y seguimiento...' }
            ]
        },
        'control-prenatal': {
            name: 'Control Prenatal',
            icon: 'baby-carriage',
            sections: [
                { title: 'Datos obstétricos', placeholder: 'G P A C, FUM, FPP, SDG...' },
                { title: 'Signos vitales', placeholder: 'TA, peso, edema...' },
                { title: 'Altura de fondo uterino', placeholder: 'AFU en cm...' },
                { title: 'Frecuencia cardíaca fetal', placeholder: 'FCF, movimientos fetales...' },
                { title: 'Estudios de laboratorio', placeholder: 'BH, QS, EGO, VDRL, VIH...' },
                { title: 'Ultrasonido', placeholder: 'Hallazgos ecográficos...' },
                { title: 'Indicaciones', placeholder: 'Suplementos, signos de alarma, próxima cita...' }
            ]
        },
        'seguimiento': {
            name: 'Nota de Seguimiento',
            icon: 'clipboard-text',
            sections: [
                { title: 'Evolución', placeholder: 'Estado actual del paciente...' },
                { title: 'Adherencia al tratamiento', placeholder: 'Cumplimiento, efectos adversos...' },
                { title: 'Examen físico', placeholder: 'Cambios relevantes...' },
                { title: 'Resultados de estudios', placeholder: 'Labs, imágenes nuevas...' },
                { title: 'Ajustes al tratamiento', placeholder: 'Cambios en medicación...' },
                { title: 'Próxima cita', placeholder: 'Fecha y motivo del seguimiento...' }
            ]
        },
        'interconsulta': {
            name: 'Interconsulta',
            icon: 'users-three',
            sections: [
                { title: 'Servicio solicitante', placeholder: 'Departamento que refiere...' },
                { title: 'Motivo de interconsulta', placeholder: 'Razón de la consulta especializada...' },
                { title: 'Resumen clínico', placeholder: 'Historia relevante del caso...' },
                { title: 'Estudios relevantes', placeholder: 'Resultados importantes...' },
                { title: 'Opinión', placeholder: 'Evaluación y recomendaciones...' },
                { title: 'Plan sugerido', placeholder: 'Manejo propuesto...' }
            ]
        },
        'procedimiento': {
            name: 'Nota de Procedimiento',
            icon: 'first-aid-kit',
            sections: [
                { title: 'Procedimiento realizado', placeholder: 'Nombre del procedimiento...' },
                { title: 'Indicación', placeholder: 'Motivo del procedimiento...' },
                { title: 'Técnica', placeholder: 'Descripción paso a paso...' },
                { title: 'Hallazgos', placeholder: 'Observaciones durante el procedimiento...' },
                { title: 'Complicaciones', placeholder: 'Ninguna / Describir si aplica...' },
                { title: 'Indicaciones post-procedimiento', placeholder: 'Cuidados y seguimiento...' }
            ]
        }
    },
    
    getTemplate(templateId) {
        return this.templates[templateId] || null;
    },
    
    getAllTemplates() {
        return Object.entries(this.templates).map(([id, template]) => ({
            id,
            ...template
        }));
    },
    
    generateNoteContent(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) return '';
        
        return template.sections.map(section => 
            `## ${section.title}\n\n`
        ).join('\n');
    },
    
    renderTemplateSelector() {
        const templates = this.getAllTemplates();
        return `
            <div class="template-selector">
                <span style="color: var(--text-secondary); margin-right: 8px;">Plantilla:</span>
                ${templates.map(t => `
                    <button class="template-btn" data-template="${t.id}">
                        <i class="ph ph-${t.icon}"></i> ${t.name}
                    </button>
                `).join('')}
            </div>
        `;
    },
    
    renderTemplateForm(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) return '';
        
        return template.sections.map((section, index) => `
            <div class="form-group">
                <label>${section.title}</label>
                <textarea 
                    id="template-section-${index}" 
                    class="template-section" 
                    placeholder="${section.placeholder}"
                    rows="3"
                ></textarea>
            </div>
        `).join('');
    },
    
    collectFormData(templateId) {
        const template = this.getTemplate(templateId);
        if (!template) return '';
        
        return template.sections.map((section, index) => {
            const textarea = document.getElementById(`template-section-${index}`);
            const content = textarea ? textarea.value.trim() : '';
            return content ? `## ${section.title}\n${content}` : '';
        }).filter(Boolean).join('\n\n');
    }
};

export default ClinicalTemplates;
