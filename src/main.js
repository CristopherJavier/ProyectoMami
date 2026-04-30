import './style.css';

(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=`    <!-- Login Screen - Two Panel Layout -->\r
    <div id="login-screen">\r
        <!-- Left Panel - Login Form -->\r
        <div class="login-left-panel">\r
            <div class="login-form-container">\r
                <!-- Login Form -->\r
                <div id="login-form-view">\r
                    <h1 class="login-title">Login</h1>\r
                    <div class="form-group">\r
                        <label>Correo Electrónico</label>\r
                        <input type="email" id="login-email" placeholder="dra.chen@medrecord.com">\r
                    </div>\r
                    <div class="form-group password-group">\r
                        <label>Contraseña</label>\r
                        <div class="password-input-wrapper">\r
                            <input type="password" id="login-password" placeholder="••••••••">\r
                            <button type="button" class="toggle-password" id="toggle-login-password">\r
                                <i class="ph ph-eye"></i>\r
                            </button>\r
                        </div>\r
                    </div>\r
                    <div id="login-error" class="error-message" style="display: none;"></div>\r
                    <button id="login-btn" class="btn-auth">Ingresar</button>\r
                    <div class="forgot-password-link">\r
                        <a href="#" id="forgot-password-link">¿Olvidaste tu contraseña?</a>\r
                    </div>\r
                    <p class="auth-switch">\r
                        ¿Es la primera vez que estás aquí? <a href="#" id="show-register">Crear una cuenta</a>\r
                    </p>\r
                </div>\r
\r
                <!-- Forgot Password Form -->\r
                <div id="forgot-password-view" style="display: none;">\r
                    <h1 class="login-title">Recuperar Contraseña</h1>\r
                    <p style="color: var(--text-secondary); margin-bottom: 20px;">\r
                        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.\r
                    </p>\r
                    <div class="form-group">\r
                        <label>Correo Electrónico</label>\r
                        <input type="email" id="reset-email" placeholder="tu@email.com">\r
                    </div>\r
                    <div id="reset-error" class="error-message" style="display: none;"></div>\r
                    <div id="reset-success" class="success-message" style="display: none;"></div>\r
                    <button id="reset-btn" class="btn-auth">Enviar Enlace</button>\r
                    <p class="auth-switch">\r
                        <a href="#" id="back-to-login">← Volver al inicio de sesión</a>\r
                    </p>\r
                </div>\r
\r
                <!-- Register Form -->\r
                <div id="register-form-view" style="display: none;">\r
                    <h1 class="login-title">Crear Cuenta</h1>\r
                    <div class="form-group">\r
                        <label>Nombre Completo</label>\r
                        <input type="text" id="register-name" placeholder="Dr. Juan Pérez">\r
                    </div>\r
                    <div class="form-group">\r
                        <label>Correo Electrónico</label>\r
                        <input type="email" id="register-email" placeholder="dr.perez@medrecord.com">\r
                    </div>\r
                    <div class="form-group password-group">\r
                        <label>Contraseña</label>\r
                        <div class="password-input-wrapper">\r
                            <input type="password" id="register-password" placeholder="Mínimo 6 caracteres">\r
                            <button type="button" class="toggle-password" id="toggle-register-password">\r
                                <i class="ph ph-eye"></i>\r
                            </button>\r
                        </div>\r
                    </div>\r
                    <div class="form-group password-group">\r
                        <label>Confirmar Contraseña</label>\r
                        <div class="password-input-wrapper">\r
                            <input type="password" id="register-confirm" placeholder="Repetir contraseña">\r
                            <button type="button" class="toggle-password" id="toggle-register-confirm">\r
                                <i class="ph ph-eye"></i>\r
                            </button>\r
                        </div>\r
                    </div>\r
                    <div id="register-error" class="error-message" style="display: none;"></div>\r
                    <button id="register-btn" class="btn-auth">Registrarse</button>\r
                    <p class="auth-switch">\r
                        ¿Ya tienes cuenta? <a href="#" id="show-login">Inicia sesión</a>\r
                    </p>\r
                </div>\r
            </div>\r
        </div>\r
\r
        <!-- Right Panel - Branding & Illustration -->\r
        <div class="login-right-panel">\r
            <!-- Floating decorative dots -->\r
            <div class="floating-dot dot-1"></div>\r
            <div class="floating-dot dot-2"></div>\r
            <div class="floating-dot dot-3"></div>\r
            <div class="floating-dot dot-4"></div>\r
            <div class="floating-dot dot-5"></div>\r
            <!-- Floating plus symbols -->\r
            <div class="floating-plus plus-1">+</div>\r
            <div class="floating-plus plus-2">+</div>\r
            <div class="floating-plus plus-3">+</div>\r
            <div class="floating-plus plus-4">+</div>\r
\r
            <div class="brand-header">\r
                <svg viewBox="0 -10 100 95" style="width: 48px; height: auto;">\r
                    <g fill="none" stroke="#1e3a5f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">\r
                        <!-- Contorno exterior del corazón (Simple) -->\r
                        <path\r
                            d="M50,80 C15,52 2,30 2,16 C2,4 12,-4 26,-4 C38,-4 47,5 50,14 C53,5 62,-4 74,-4 C88,-4 98,4 98,16 C98,30 85,52 50,80 Z" />\r
                    </g>\r
                    <!-- Línea de pulso verde -->\r
                    <path\r
                        d="M-4,42 L10,42 C14,42 16,40 18,36 L24,22 C26,18 28,18 30,22 L38,44 C40,50 42,50 44,44 L50,18 C52,12 54,12 56,18 L62,44 C64,50 66,50 68,44 L74,30 C76,26 78,26 80,30 L84,42 C86,44 90,44 96,42 L104,42"\r
                        stroke="#9ACD32" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />\r
                </svg>\r
                <span style="color: #1e3a5f; font-size: 1.4rem; font-weight: 700; margin-left: 10px;">MedRecord</span>\r
            </div>\r
            <div class="illustration-container">\r
                <!-- Soft circular background -->\r
                <div class="illustration-circle-bg"></div>\r
                <!-- Medical SVG Illustration -->\r
                <svg viewBox="0 0 400 400" class="medical-illustration">\r
                    <!-- Stethoscope -->\r
                    <g class="stethoscope">\r
                        <!-- Ear pieces -->\r
                        <path d="M120 80 Q100 80 100 100 L100 140" stroke="#1e3a5f" stroke-width="6" fill="none"\r
                            stroke-linecap="round" />\r
                        <path d="M160 80 Q180 80 180 100 L180 140" stroke="#1e3a5f" stroke-width="6" fill="none"\r
                            stroke-linecap="round" />\r
                        <!-- Connection -->\r
                        <path d="M120 80 L160 80" stroke="#1e3a5f" stroke-width="6" fill="none"\r
                            stroke-linecap="round" />\r
                        <!-- Tube -->\r
                        <path d="M140 80 L140 180 Q140 220 180 240 L260 240 Q300 240 300 280 L300 300" stroke="#3b82f6"\r
                            stroke-width="8" fill="none" stroke-linecap="round" />\r
                        <!-- Chest piece -->\r
                        <circle cx="300" cy="320" r="30" fill="#1e3a5f" />\r
                        <circle cx="300" cy="320" r="20" fill="#3b82f6" />\r
                        <circle cx="300" cy="320" r="10" fill="#1e3a5f" />\r
                    </g>\r
\r
                    <!-- Measuring tape -->\r
                    <g class="measuring-tape">\r
                        <rect x="50" y="260" width="120" height="30" rx="5" fill="#f59e0b" />\r
                        <rect x="50" y="265" width="120" height="20" rx="3" fill="#fbbf24" />\r
                        <!-- Tick marks -->\r
                        <line x1="60" y1="265" x2="60" y2="280" stroke="#1e3a5f" stroke-width="2" />\r
                        <line x1="80" y1="265" x2="80" y2="275" stroke="#1e3a5f" stroke-width="1" />\r
                        <line x1="100" y1="265" x2="100" y2="280" stroke="#1e3a5f" stroke-width="2" />\r
                        <line x1="120" y1="265" x2="120" y2="275" stroke="#1e3a5f" stroke-width="1" />\r
                        <line x1="140" y1="265" x2="140" y2="280" stroke="#1e3a5f" stroke-width="2" />\r
                        <line x1="160" y1="265" x2="160" y2="275" stroke="#1e3a5f" stroke-width="1" />\r
                        <!-- Curl at end -->\r
                        <path d="M170 275 Q200 275 200 300 Q200 320 180 320 Q160 320 160 300" stroke="#fbbf24"\r
                            stroke-width="8" fill="none" stroke-linecap="round" />\r
                    </g>\r
\r
                    <!-- Apple -->\r
                    <g class="apple">\r
                        <ellipse cx="80" cy="180" rx="35" ry="40" fill="#22c55e" />\r
                        <ellipse cx="70" cy="175" rx="20" ry="30" fill="#4ade80" opacity="0.6" />\r
                        <!-- Stem -->\r
                        <path d="M80 140 Q85 130 90 135" stroke="#92400e" stroke-width="4" fill="none"\r
                            stroke-linecap="round" />\r
                        <!-- Leaf -->\r
                        <ellipse cx="100" cy="138" rx="15" ry="8" fill="#22c55e" transform="rotate(-30 100 138)" />\r
                        <!-- Highlight -->\r
                        <ellipse cx="65" cy="165" rx="8" ry="12" fill="white" opacity="0.4" />\r
                    </g>\r
\r
                    <!-- Pulse Oximeter -->\r
                    <g class="oximeter">\r
                        <!-- Device body -->\r
                        <rect x="230" y="120" width="70" height="50" rx="8" fill="#1e3a5f" />\r
                        <!-- Screen -->\r
                        <rect x="238" y="128" width="54" height="30" rx="4" fill="#0f172a" />\r
                        <!-- Display content -->\r
                        <text x="245" y="145" fill="#22c55e" font-size="12" font-weight="bold">98%</text>\r
                        <text x="245" y="155" fill="#ef4444" font-size="8">♥ 72</text>\r
                        <!-- Pulse wave -->\r
                        <polyline points="270,148 275,145 280,150 285,140 290,148" stroke="#22c55e" stroke-width="1.5"\r
                            fill="none" />\r
                        <!-- Finger clip -->\r
                        <path d="M230 145 L210 145 Q200 145 200 155 L200 175 Q200 185 210 185 L230 185" stroke="#64748b"\r
                            stroke-width="8" fill="#94a3b8" stroke-linecap="round" />\r
                        <ellipse cx="210" cy="165" rx="8" ry="15" fill="#fecaca" />\r
                    </g>\r
\r
                    <!-- Blood Pressure Monitor -->\r
                    <g class="bp-monitor">\r
                        <!-- Monitor body -->\r
                        <rect x="260" y="45" width="60" height="55" rx="6" fill="#1e3a5f" />\r
                        <!-- Screen -->\r
                        <rect x="267" y="52" width="46" height="28" rx="3" fill="#0f172a" />\r
                        <!-- Display -->\r
                        <text x="273" y="68" fill="#22c55e" font-size="10" font-weight="bold">120</text>\r
                        <text x="273" y="76" fill="#3b82f6" font-size="8">80</text>\r
                        <!-- Cuff tube -->\r
                        <path d="M260 72 L240 72 Q230 72 230 82 L230 100" stroke="#64748b" stroke-width="4" fill="none"\r
                            stroke-linecap="round" />\r
                        <!-- Cuff -->\r
                        <rect x="215" y="100" width="30" height="45" rx="4" fill="#3b82f6" />\r
                        <rect x="220" y="105" width="20" height="35" rx="2" fill="#60a5fa" />\r
                    </g>\r
                </svg>\r
            </div>\r
        </div>\r
    </div>\r`,t=`    <div class="app-container" id="main-app" style="display: none;">\r
        <!-- Sidebar -->\r
        <aside class="sidebar">\r
            <div class="sidebar-header">\r
                <svg viewBox="0 -10 100 95" style="width: 45px; height: auto;">\r
                    <g fill="none" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">\r
                        <!-- Contorno exterior del corazón (Simple) -->\r
                        <path\r
                            d="M50,80 C15,52 2,30 2,16 C2,4 12,-4 26,-4 C38,-4 47,5 50,14 C53,5 62,-4 74,-4 C88,-4 98,4 98,16 C98,30 85,52 50,80 Z" />\r
                    </g>\r
                    <!-- Línea de pulso verde -->\r
                    <path\r
                        d="M-4,42 L10,42 C14,42 16,40 18,36 L24,22 C26,18 28,18 30,22 L38,44 C40,50 42,50 44,44 L50,18 C52,12 54,12 56,18 L62,44 C64,50 66,50 68,44 L74,30 C76,26 78,26 80,30 L84,42 C86,44 90,44 96,42 L104,42"\r
                        stroke="#9ACD32" fill="none" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />\r
                </svg>\r
                <h2 style="color: #ffffff; margin-left: 10px;">MedRecord</h2>\r
            </div>\r
\r
            <nav class="sidebar-nav">\r
                <a href="#dashboard" class="nav-item" data-route="dashboard">\r
                    <i class="ph ph-squares-four"></i> Panel de Control\r
                </a>\r
                <a href="#pacientes" class="nav-item" data-route="pacientes">\r
                    <i class="ph ph-users"></i> Pacientes\r
                </a>\r
                <a href="#citas" class="nav-item" data-route="citas">\r
                    <i class="ph ph-calendar-blank"></i> Citas\r
                </a>\r
                <a href="#signos-vitales" class="nav-item" data-route="signos-vitales">\r
                    <i class="ph ph-heartbeat"></i> Signos Vitales\r
                </a>\r
                <a href="#recetas" class="nav-item" data-route="recetas">\r
                    <i class="ph ph-prescription"></i> Recetas\r
                </a>\r
                <a href="#informes" class="nav-item" data-route="informes">\r
                    <i class="ph ph-clipboard-text"></i> Informes\r
                </a>\r
                <a href="#calculadoras" class="nav-item" data-route="calculadoras">\r
                    <i class="ph ph-calculator"></i> Calculadoras\r
                </a>\r
            </nav>\r
\r
            <div class="sidebar-bottom">\r
                <a href="#configuracion" class="nav-item" data-route="configuracion">\r
                    <i class="ph ph-gear"></i> Configuración\r
                </a>\r
\r
                <a href="#" class="nav-item" id="logout-btn">\r
                    <i class="ph ph-sign-out"></i> Cerrar Sesión\r
                </a>\r
\r
                <div class="user-profile" id="user-profile-btn" style="cursor: pointer;" title="Editar Perfil">\r
                    <img src="https://i.pravatar.cc/150?img=32" alt="Perfil del Médico" id="sidebar-doc-photo">\r
                    <div class="user-info">\r
                        <span class="user-name" id="sidebar-doc-name">Dr. Cargando...</span>\r
                        <span class="user-role" id="sidebar-doc-role">Médico</span>\r
                    </div>\r
                </div>\r
            </div>\r
        </aside>\r
\r
        <!-- Main Content Area -->\r
        <main class="main-content" id="main-content">\r
            <!-- Content will be dynamically injected based on route -->\r
        </main>\r
    </div>\r
\r`,n=`    <!-- Logout Confirmation Modal -->\r
    <div id="logout-modal" class="modal-overlay" style="display: none;">\r
        <div class="modal-box">\r
            <div class="modal-icon">\r
                <i class="ph ph-sign-out"></i>\r
            </div>\r
            <h2>¿Cerrar Sesión?</h2>\r
            <p>¿Estás seguro que deseas cerrar sesión?</p>\r
            <div class="modal-buttons">\r
                <button id="cancel-logout-btn" class="btn-secondary">Cancelar</button>\r
                <button id="confirm-logout-btn" class="btn-danger">Cerrar Sesión</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Consolidated Modals will be at the bottom of the file -->\r
\r
\r
    <!-- Add Patient Modal -->\r
    <div id="patient-modal" class="modal-overlay" style="display: none;">\r
        <div class="modal-box modal-large" style="max-width: 640px;">\r
            <h2 id="patient-modal-title">Agregar Nuevo Paciente</h2>\r
            \r
            <!-- Auto-generated ID badge -->\r
            <div id="patient-id-badge" class="patient-id-badge" style="display: none;">\r
                <i class="ph ph-identification-card"></i>\r
                <span id="patient-id-display"></span>\r
            </div>\r
\r
            <div class="form-row">\r
                <div class="form-group">\r
                    <label>Nombre *</label>\r
                    <input type="text" id="patient-firstname" placeholder="Ej: María">\r
                </div>\r
                <div class="form-group">\r
                    <label>Apellido *</label>\r
                    <input type="text" id="patient-lastname" placeholder="Ej: García">\r
                </div>\r
            </div>\r
            <div class="form-row">\r
                <div class="form-group">\r
                    <label>Fecha de Nacimiento *</label>\r
                    <input type="date" id="patient-dob" min="1900-01-01" max="">\r
                </div>\r
                <div class="form-group">\r
                    <label>Sexo *</label>\r
                    <select id="patient-sex">\r
                        <option value="">Seleccionar...</option>\r
                        <option value="Masculino">Masculino</option>\r
                        <option value="Femenino">Femenino</option>\r
                        <option value="Otro">Otro</option>\r
                    </select>\r
                </div>\r
            </div>\r
            <div class="form-row">\r
                <div class="form-group">\r
                    <label>Teléfono</label>\r
                    <input type="tel" id="patient-phone" placeholder="(809) 555-0000" maxlength="14">\r
                </div>\r
                <div class="form-group">\r
                    <label>Provincia *</label>\r
                    <select id="patient-province">\r
                        <option value="">Seleccionar provincia...</option>\r
                        <option value="Azua">Azua</option>\r
                        <option value="Bahoruco">Bahoruco</option>\r
                        <option value="Barahona">Barahona</option>\r
                        <option value="Dajabón">Dajabón</option>\r
                        <option value="Distrito Nacional">Distrito Nacional</option>\r
                        <option value="Duarte">Duarte</option>\r
                        <option value="El Seibo">El Seibo</option>\r
                        <option value="Elías Piña">Elías Piña</option>\r
                        <option value="Espaillat">Espaillat</option>\r
                        <option value="Hato Mayor">Hato Mayor</option>\r
                        <option value="Hermanas Mirabal">Hermanas Mirabal</option>\r
                        <option value="Independencia">Independencia</option>\r
                        <option value="La Altagracia">La Altagracia</option>\r
                        <option value="La Romana">La Romana</option>\r
                        <option value="La Vega">La Vega</option>\r
                        <option value="María Trinidad Sánchez">María Trinidad Sánchez</option>\r
                        <option value="Monseñor Nouel">Monseñor Nouel</option>\r
                        <option value="Monte Cristi">Monte Cristi</option>\r
                        <option value="Monte Plata">Monte Plata</option>\r
                        <option value="Pedernales">Pedernales</option>\r
                        <option value="Peravia">Peravia</option>\r
                        <option value="Puerto Plata">Puerto Plata</option>\r
                        <option value="Samaná">Samaná</option>\r
                        <option value="San Cristóbal">San Cristóbal</option>\r
                        <option value="San José de Ocoa">San José de Ocoa</option>\r
                        <option value="San Juan">San Juan</option>\r
                        <option value="San Pedro de Macorís">San Pedro de Macorís</option>\r
                        <option value="Sánchez Ramírez">Sánchez Ramírez</option>\r
                        <option value="Santiago">Santiago</option>\r
                        <option value="Santiago Rodríguez">Santiago Rodríguez</option>\r
                        <option value="Santo Domingo">Santo Domingo</option>\r
                        <option value="Valverde">Valverde</option>\r
                    </select>\r
                </div>\r
            </div>\r
            <div class="form-group">\r
                <label>Motivo de Consulta *</label>\r
                <textarea id="patient-reason" rows="3" placeholder="Describa el motivo de la consulta..."></textarea>\r
            </div>\r
            <div id="patient-error" class="error-message" style="display: none;"></div>\r
            <div class="modal-buttons">\r
                <button id="cancel-patient-btn" class="btn-secondary">Cancelar</button>\r
                <button id="save-patient-btn" class="btn-primary-modal">Guardar Paciente</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Consultation Modal (for follow-up visits) -->\r
    <div id="consultation-modal" class="modal-overlay" style="display: none;">\r
        <div class="modal-box modal-large" style="max-width: 700px; max-height: 90vh; overflow-y: auto;">\r
            <h2><i class="ph ph-stethoscope"></i> Nueva Consulta</h2>\r
            <p id="consultation-patient-name" style="color: var(--text-secondary); margin-bottom: 20px; font-size: 14px;"></p>\r
            \r
            <!-- Patient Data Section (editable) -->\r
            <div class="consultation-section">\r
                <h3 class="consultation-section-title"><i class="ph ph-user"></i> Datos del Paciente</h3>\r
                <div class="form-row">\r
                    <div class="form-group">\r
                        <label>Nombre</label>\r
                        <input type="text" id="consult-firstname" placeholder="Nombre">\r
                    </div>\r
                    <div class="form-group">\r
                        <label>Apellido</label>\r
                        <input type="text" id="consult-lastname" placeholder="Apellido">\r
                    </div>\r
                </div>\r
                <div class="form-row">\r
                    <div class="form-group">\r
                        <label>Teléfono</label>\r
                        <input type="tel" id="consult-phone" placeholder="(809) 555-0000" maxlength="14">\r
                    </div>\r
                    <div class="form-group">\r
                        <label>Provincia</label>\r
                        <select id="consult-province">\r
                            <option value="">Seleccionar...</option>\r
                            <option value="Azua">Azua</option>\r
                            <option value="Bahoruco">Bahoruco</option>\r
                            <option value="Barahona">Barahona</option>\r
                            <option value="Dajabón">Dajabón</option>\r
                            <option value="Distrito Nacional">Distrito Nacional</option>\r
                            <option value="Duarte">Duarte</option>\r
                            <option value="El Seibo">El Seibo</option>\r
                            <option value="Elías Piña">Elías Piña</option>\r
                            <option value="Espaillat">Espaillat</option>\r
                            <option value="Hato Mayor">Hato Mayor</option>\r
                            <option value="Hermanas Mirabal">Hermanas Mirabal</option>\r
                            <option value="Independencia">Independencia</option>\r
                            <option value="La Altagracia">La Altagracia</option>\r
                            <option value="La Romana">La Romana</option>\r
                            <option value="La Vega">La Vega</option>\r
                            <option value="María Trinidad Sánchez">María Trinidad Sánchez</option>\r
                            <option value="Monseñor Nouel">Monseñor Nouel</option>\r
                            <option value="Monte Cristi">Monte Cristi</option>\r
                            <option value="Monte Plata">Monte Plata</option>\r
                            <option value="Pedernales">Pedernales</option>\r
                            <option value="Peravia">Peravia</option>\r
                            <option value="Puerto Plata">Puerto Plata</option>\r
                            <option value="Samaná">Samaná</option>\r
                            <option value="San Cristóbal">San Cristóbal</option>\r
                            <option value="San José de Ocoa">San José de Ocoa</option>\r
                            <option value="San Juan">San Juan</option>\r
                            <option value="San Pedro de Macorís">San Pedro de Macorís</option>\r
                            <option value="Sánchez Ramírez">Sánchez Ramírez</option>\r
                            <option value="Santiago">Santiago</option>\r
                            <option value="Santiago Rodríguez">Santiago Rodríguez</option>\r
                            <option value="Santo Domingo">Santo Domingo</option>\r
                            <option value="Valverde">Valverde</option>\r
                        </select>\r
                    </div>\r
                </div>\r
            </div>\r
\r
            <!-- Medical Info Section -->\r
            <div class="consultation-section">\r
                <h3 class="consultation-section-title"><i class="ph ph-heartbeat"></i> Información Médica</h3>\r
                <div class="form-row">\r
                    <div class="form-group">\r
                        <label>Peso Actual (lbs)</label>\r
                        <input type="number" id="consult-weight" placeholder="Ej: 150" step="0.1">\r
                        <div id="consult-weight-comparison" class="weight-comparison" style="display: none;"></div>\r
                    </div>\r
                    <div class="form-group">\r
                        <label>Fecha de Nacimiento</label>\r
                        <input type="date" id="consult-dob" min="1900-01-01" max="">\r
                        <small id="consult-age-display" style="color: var(--text-secondary); margin-top: 4px; display: block;"></small>\r
                    </div>\r
                </div>\r
                <div class="form-group">\r
                    <label>Alergias</label>\r
                    <input type="text" id="consult-allergies" placeholder="Penicilina, Látex, etc.">\r
                </div>\r
                <div class="form-group">\r
                    <label>Antecedentes Familiares</label>\r
                    <textarea id="consult-family-history" rows="2" placeholder="Madre: Diabetes, Padre: Hipertensión..."></textarea>\r
                </div>\r
            </div>\r
\r
            <!-- Consultation Section -->\r
            <div class="consultation-section">\r
                <h3 class="consultation-section-title"><i class="ph ph-clipboard-text"></i> Datos de esta Consulta</h3>\r
                <div class="form-group">\r
                    <label>Motivo de Consulta *</label>\r
                    <textarea id="consult-reason" rows="3" placeholder="Describa el motivo de la consulta..."></textarea>\r
                </div>\r
                <div class="form-group">\r
                    <label>Medicamentos Recetados</label>\r
                    <textarea id="consult-medications" rows="2" placeholder="Ej: Acetaminofén 500mg c/8h por 5 días..."></textarea>\r
                </div>\r
            </div>\r
\r
            <!-- Consultation History -->\r
            <div id="consultation-history-section" class="consultation-section" style="display: none;">\r
                <h3 class="consultation-section-title"><i class="ph ph-clock-counter-clockwise"></i> Historial de Consultas</h3>\r
                <div id="consultation-history-list"></div>\r
            </div>\r
\r
            <div id="consultation-error" class="error-message" style="display: none;"></div>\r
            <div class="modal-buttons">\r
                <button id="cancel-consultation-btn" class="btn-secondary">Cancelar</button>\r
                <button id="save-consultation-btn" class="btn-primary-modal">Guardar Consulta</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Add Appointment Modal -->\r
    <div id="appointment-modal" class="modal-overlay" style="display: none;">\r
        <div class="modal-box modal-large">\r
            <h2 id="appointment-modal-title">Agendar Nueva Cita</h2>\r
            <div class="form-group">\r
                <label>Paciente *</label>\r
                <select id="appointment-patient">\r
                    <option value="">Seleccionar paciente...</option>\r
                </select>\r
            </div>\r
            <div class="form-row">\r
                <div class="form-group">\r
                    <label>Fecha *</label>\r
                    <input type="date" id="appointment-date">\r
                </div>\r
                <div class="form-group">\r
                    <label>Hora *</label>\r
                    <input type="time" id="appointment-time">\r
                </div>\r
            </div>\r
            <div class="form-group">\r
                <label>Tipo de Consulta *</label>\r
                <select id="appointment-type">\r
                    <option value="Primera vez">Primera vez</option>\r
                    <option value="Seguimiento">Seguimiento</option>\r
                    <option value="Urgencia">Urgencia</option>\r
                    <option value="Control">Control</option>\r
                    <option value="Procedimiento">Procedimiento</option>\r
                </select>\r
            </div>\r
            <div class="form-group">\r
                <label>Notas (opcional)</label>\r
                <textarea id="appointment-notes" rows="3" placeholder="Notas adicionales..."></textarea>\r
            </div>\r
            <div id="appointment-error" class="error-message" style="display: none;"></div>\r
            <div class="modal-buttons">\r
                <button id="cancel-appointment-btn" class="btn-secondary">Cancelar</button>\r
                <button id="save-appointment-btn" class="btn-primary-modal">Guardar Cita</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Add Clinical Note Modal -->\r
    <div id="note-modal" class="modal-overlay" style="display: none;">\r
        <div class="modal-box">\r
            <h2>Agregar Nota Clínica</h2>\r
            <div class="form-group">\r
                <label>Paciente *</label>\r
                <select id="note-patient">\r
                    <option value="">Seleccionar paciente...</option>\r
                </select>\r
            </div>\r
            <div class="form-group">\r
                <label>Tipo de Registro</label>\r
                <select id="note-type">\r
                    <option value="CLÍNICO">Clínico</option>\r
                    <option value="LABORATORIO">Laboratorio</option>\r
                    <option value="IMAGEN">Imagen</option>\r
                    <option value="PROCEDIMIENTO">Procedimiento</option>\r
                </select>\r
            </div>\r
            <div class="form-group">\r
                <label>Descripción *</label>\r
                <textarea id="note-content" rows="4" placeholder="Escriba los detalles aquí..."></textarea>\r
            </div>\r
            <div id="note-error" class="error-message" style="display: none;"></div>\r
            <div class="modal-buttons">\r
                <button id="cancel-note-btn" class="btn-secondary">Cancelar</button>\r
                <button id="save-note-btn" class="btn-primary-modal">Guardar Nota</button>\r
            </div>\r
        </div>\r
    </div>\r
\r
    <!-- Doctor Profile Modal -->\r
    <div id="doctor-profile-modal" class="modal-overlay" style="display: none;">\r
        <div class="modal-box modal-large" style="max-height: 90vh; overflow-y: auto;">\r
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">\r
                <h2 style="margin: 0;">Perfil del Médico</h2>\r
                <span id="doc-id-display"\r
                    style="background: var(--light-blue); color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">#ID</span>\r
            </div>\r
\r
            <!-- Drag & Drop Photo Area -->\r
            <div class="form-group">\r
                <label>Foto de Perfil (Arrastra la imagen o haz clic)</label>\r
                <div id="photo-drop-zone" class="drop-zone"\r
                    style="border: 2px dashed var(--border-color); padding: 20px; text-align: center; border-radius: 12px; cursor: pointer; margin-bottom: 16px;">\r
                    <span id="drop-zone-text">Arrastra una imagen aquí o haz clic para subir</span>\r
                    <input type="file" id="file-input" accept="image/*" style="display: none;">\r
                    <div id="cropper-container"\r
                        style="display: none; width: 100%; max-height: 300px; margin-top: 10px;">\r
                        <img id="cropper-image" src="" alt="Previsualización" style="max-width: 100%;">\r
                    </div>\r
                    <input type="hidden" id="doc-photo-input">\r
                </div>\r
            </div>\r
\r
            <div class="form-group">\r
                <label>Nombre Completo *</label>\r
                <input type="text" id="doc-name-input" placeholder="Ej: Dra. Sarah Chen"\r
                    style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 16px;">\r
            </div>\r
\r
            <div style="display: flex; gap: 12px; margin-bottom: 16px;">\r
                <div class="form-group" style="flex: 1;">\r
                    <label>Título / Rol Principal</label>\r
                    <input type="text" id="doc-role-input" placeholder="Ej: Cardióloga"\r
                        style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">\r
                </div>\r
                <div class="form-group" style="flex: 1;">\r
                    <label>Exequátur / Licencia</label>\r
                    <input type="text" id="doc-license-input" placeholder="Ej: CM-98342"\r
                        style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px;">\r
                </div>\r
            </div>\r
\r
            <div class="form-group">\r
                <label>Especialidades</label>\r
                <input type="text" id="doc-specialties-input" placeholder="Ej: Cardiología, Medicina Interna"\r
                    style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 16px;">\r
            </div>\r
\r
            <div class="form-group">\r
                <label>Biografía Breve</label>\r
                <textarea id="doc-bio-input" rows="3"\r
                    style="width: 100%; padding: 12px; border: 1px solid var(--border-color); border-radius: 8px; font-family: inherit; resize: vertical;"\r
                    placeholder="10 años de experiencia..."></textarea>\r
            </div>\r
\r
            <div class="modal-buttons" style="display: flex; gap: 12px; margin-top: 24px;">\r
                <button id="cancel-profile-btn" class="btn-secondary" style="flex: 1;">Cancelar</button>\r
                <button id="save-profile-btn" class="btn-primary-modal" style="flex: 1;">Guardar Perfil</button>\r
            </div>\r
        </div>\r
    </div>\r`,r=`modulepreload`,i=function(e){return`/`+e},a={},o=function(e,t,n){let o=Promise.resolve();if(t&&t.length>0){let e=document.getElementsByTagName(`link`),s=document.querySelector(`meta[property=csp-nonce]`),c=s?.nonce||s?.getAttribute(`nonce`);function l(e){return Promise.all(e.map(e=>Promise.resolve(e).then(e=>({status:`fulfilled`,value:e}),e=>({status:`rejected`,reason:e}))))}o=l(t.map(t=>{if(t=i(t,n),t in a)return;a[t]=!0;let o=t.endsWith(`.css`),s=o?`[rel="stylesheet"]`:``;if(n)for(let n=e.length-1;n>=0;n--){let r=e[n];if(r.href===t&&(!o||r.rel===`stylesheet`))return}else if(document.querySelector(`link[href="${t}"]${s}`))return;let l=document.createElement(`link`);if(l.rel=o?`stylesheet`:r,o||(l.as=`script`),l.crossOrigin=``,l.href=t,c&&l.setAttribute(`nonce`,c),document.head.appendChild(l),o)return new Promise((e,n)=>{l.addEventListener(`load`,e),l.addEventListener(`error`,()=>n(Error(`Unable to preload CSS for ${t}`)))})}))}function s(e){let t=new Event(`vite:preloadError`,{cancelable:!0});if(t.payload=e,window.dispatchEvent(t),!t.defaultPrevented)throw e}return o.then(t=>{for(let e of t||[])e.status===`rejected`&&s(e.reason);return e().catch(s)})},s=(e,t=`beforeend`)=>{document.body.insertAdjacentHTML(t,e)};s(e),s(t),s(n),o(()=>import(`./app-compiled.js`).then(()=>{console.log(`App logic loaded after HTML injection`)}),[]);