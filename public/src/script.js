// Galeria Secreta - JavaScript Principal

// Configurações globais
const CONFIG = {
    API_BASE_URL: window.location.origin,
    WHATSAPP_NUMBER: '258851551556',
    EMAIL: 'galeriasecretamz@gmail.com'
};

// Estado da aplicação
const AppState = {
    currentUser: null,
    isLoggedIn: false,
    modals: new Set(),
    formSubmissions: new Map()
};

// Utilitários
const Utils = {
    // Debounce para otimizar eventos
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Validação de email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validação de telefone
    isValidPhone(phone) {
        const phoneRegex = /^(\+258|258)?[0-9]{9}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },

    // Formatação de telefone
    formatPhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.startsWith('258')) {
            return '+' + cleaned;
        }
        if (cleaned.length === 9) {
            return '+258' + cleaned;
        }
        return phone;
    },

    // Sanitização de entrada
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    // Mostrar/esconder loading
    showLoading(show = true) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.toggle('hidden', !show);
        }
    },

    // Mostrar notificação
    showNotification(message, type = 'info') {
        // Criar elemento de notificação se não existir
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                border-radius: 10px;
                color: white;
                font-weight: 500;
                z-index: 3000;
                transform: translateX(400px);
                transition: transform 0.3s ease;
                max-width: 300px;
                word-wrap: break-word;
            `;
            document.body.appendChild(notification);
        }

        // Definir cor baseada no tipo
        const colors = {
            success: '#10b981',
            error: '#ef4444',
            warning: '#f59e0b',
            info: '#3b82f6'
        };

        notification.style.backgroundColor = colors[type] || colors.info;
        notification.textContent = message;
        notification.style.transform = 'translateX(0)';

        // Auto-hide após 5 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
        }, 5000);
    }
};

// Gerenciador de Modais
const ModalManager = {
    open(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
            AppState.modals.add(modalId);
            
            // Focus no primeiro elemento focável
            const focusable = modal.querySelector('input, button, select, textarea');
            if (focusable) {
                setTimeout(() => focusable.focus(), 100);
            }
        }
    },

    close(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            AppState.modals.delete(modalId);
            
            if (AppState.modals.size === 0) {
                document.body.style.overflow = '';
            }
        }
    },

    closeAll() {
        AppState.modals.forEach(modalId => this.close(modalId));
    }
};

// Gerenciador de Formulários
const FormManager = {
    // Validar formulário
    validateForm(form) {
        const errors = {};
        const formData = new FormData(form);
        
        // Validações específicas por tipo de formulário
        if (form.id === 'login-form') {
            const email = formData.get('email');
            const password = formData.get('password');
            
            if (!email) errors.email = 'Email é obrigatório';
            else if (!Utils.isValidEmail(email)) errors.email = 'Email inválido';
            
            if (!password) errors.password = 'Palavra-passe é obrigatória';
            else if (password.length < 6) errors.password = 'Palavra-passe deve ter pelo menos 6 caracteres';
        }
        
        if (form.id === 'signup-form') {
            const nome = formData.get('nome');
            const email = formData.get('email');
            const password = formData.get('password');
            
            if (!nome || nome.trim().length < 2) errors.nome = 'Nome deve ter pelo menos 2 caracteres';
            if (!email) errors.email = 'Email é obrigatório';
            else if (!Utils.isValidEmail(email)) errors.email = 'Email inválido';
            if (!password) errors.password = 'Palavra-passe é obrigatória';
            else if (password.length < 6) errors.password = 'Palavra-passe deve ter pelo menos 6 caracteres';
        }
        
        if (form.id === 'application-form') {
            const nome = formData.get('nome');
            const idade = formData.get('idade');
            const email = formData.get('email');
            const whatsapp = formData.get('whatsapp');
            const provincia = formData.get('provincia');
            const foto = formData.get('foto');
            const termos = formData.get('termos');
            
            if (!nome || nome.trim().length < 2) errors.nome = 'Nome deve ter pelo menos 2 caracteres';
            if (!idade || idade < 18 || idade > 65) errors.idade = 'Idade deve estar entre 18 e 65 anos';
            if (!email) errors.email = 'Email é obrigatório';
            else if (!Utils.isValidEmail(email)) errors.email = 'Email inválido';
            if (!whatsapp) errors.whatsapp = 'WhatsApp é obrigatório';
            else if (!Utils.isValidPhone(whatsapp)) errors.whatsapp = 'Número de WhatsApp inválido';
            if (!provincia) errors.provincia = 'Província é obrigatória';
            if (!foto || foto.size === 0) errors.foto = 'Foto é obrigatória';
            else if (foto.size > 10 * 1024 * 1024) errors.foto = 'Foto deve ter menos de 10MB';
            if (!termos) errors.termos = 'Deve aceitar os termos e condições';
        }
        
        return errors;
    },

    // Mostrar erros no formulário
    showErrors(form, errors) {
        // Limpar erros anteriores
        form.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });
        
        // Mostrar novos erros
        Object.keys(errors).forEach(field => {
            const errorElement = form.querySelector(`#${form.id.replace('-form', '')}-${field}-error`);
            if (errorElement) {
                errorElement.textContent = errors[field];
                errorElement.classList.add('show');
            }
        });
    },

    // Limpar erros
    clearErrors(form) {
        form.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });
    },

    // Submeter formulário
    async submitForm(form, endpoint) {
        const formId = form.id;
        
        // Prevenir múltiplas submissões
        if (AppState.formSubmissions.has(formId)) {
            return;
        }
        
        const errors = this.validateForm(form);
        if (Object.keys(errors).length > 0) {
            this.showErrors(form, errors);
            return;
        }
        
        this.clearErrors(form);
        AppState.formSubmissions.set(formId, true);
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoader = submitBtn.querySelector('.btn-loader');
        
        // Mostrar loading
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'block';
        
        try {
            const formData = new FormData(form);
            const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                Utils.showNotification(result.message || 'Operação realizada com sucesso!', 'success');
                
                // Ações específicas por formulário
                if (formId === 'login-form') {
                    localStorage.setItem('authToken', result.token);
                    AppState.currentUser = result.usuario;
                    AppState.isLoggedIn = true;
                    ModalManager.close('login-modal');
                    this.updateUIForLoggedInUser();
                } else if (formId === 'signup-form') {
                    ModalManager.close('signup-modal');
                    form.reset();
                } else if (formId === 'application-form') {
                    ModalManager.close('application');
                    ModalManager.open('success-modal');
                    form.reset();
                    this.resetFileUpload();
                }
            } else {
                Utils.showNotification(result.error || 'Erro ao processar solicitação', 'error');
                if (result.detalhes) {
                    console.error('Detalhes do erro:', result.detalhes);
                }
            }
        } catch (error) {
            console.error('Erro na submissão:', error);
            Utils.showNotification('Erro de conexão. Tente novamente.', 'error');
        } finally {
            // Restaurar botão
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            btnLoader.style.display = 'none';
            AppState.formSubmissions.delete(formId);
        }
    },

    // Resetar upload de arquivo
    resetFileUpload() {
        const fileInput = document.getElementById('foto');
        const preview = document.getElementById('photo-preview');
        const uploadText = document.querySelector('.file-upload-text');
        
        if (fileInput) fileInput.value = '';
        if (preview) preview.style.display = 'none';
        if (uploadText) uploadText.style.display = 'block';
    },

    // Atualizar UI para usuário logado
    updateUIForLoggedInUser() {
        const loginBtn = document.getElementById('login-btn');
        const signupBtn = document.getElementById('signup-btn');
        
        if (loginBtn && AppState.currentUser) {
            loginBtn.innerHTML = `
                <span class="action-icon">👤</span>
                <span>${AppState.currentUser.nome}</span>
            `;
            loginBtn.onclick = () => this.showUserMenu();
        }
        
        if (signupBtn) {
            signupBtn.style.display = 'none';
        }
    },

    // Mostrar menu do usuário
    showUserMenu() {
        // Implementar menu dropdown para usuário logado
        console.log('Menu do usuário:', AppState.currentUser);
    }
};

// Gerenciador de Perfis
const ProfileManager = {
    profiles: {
        sofia: {
            name: 'Sofia',
            category: 'Modelo Profissional',
            age: '25 anos',
            location: 'Nampula',
            mainImage: 'https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg',
            gallery: [
                'https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg',
                'https://i.postimg.cc/25N7YD0r/123997228-3627243123965219-2863826447702482559-o.jpg',
                'https://i.postimg.cc/qRMnBMyV/143127941-421898882477563-1534463607340270020-o.jpg'
            ],
            bio: 'Modelo profissional com experiência em campanhas publicitárias e eventos corporativos. Especializada em fotografia de moda e comercial.',
            services: ['Modelagem Fotográfica', 'Eventos Corporativos', 'Campanhas Publicitárias', 'Desfiles de Moda'],
            specialties: ['Fotografia', 'Moda', 'Comercial', 'Eventos'],
            availability: '24/7',
            whatsapp: `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Olá!%20Tenho%20interesse%20em%20conhecer%20a%20Sofia`
        },
        isabella: {
            name: 'Isabella',
            category: 'Modelo Experiente',
            age: '28 anos',
            location: 'Nampula',
            mainImage: 'https://i.postimg.cc/25N7YD0r/123997228-3627243123965219-2863826447702482559-o.jpg',
            gallery: [
                'https://i.postimg.cc/25N7YD0r/123997228-3627243123965219-2863826447702482559-o.jpg',
                'https://i.postimg.cc/qRMnBMyV/143127941-421898882477563-1534463607340270020-o.jpg',
                'https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg'
            ],
            bio: 'Modelo experiente com mais de 5 anos no mercado. Especializada em trabalhos de alta qualidade e atendimento personalizado.',
            services: ['Acompanhamento VIP', 'Eventos Sociais', 'Viagens', 'Jantares Executivos'],
            specialties: ['Elegância', 'Sofisticação', 'Discrição', 'Profissionalismo'],
            availability: 'Sob consulta',
            whatsapp: `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Olá!%20Tenho%20interesse%20em%20conhecer%20a%20Isabella`
        },
        valentina: {
            name: 'Valentina',
            category: 'Modelo Premium',
            age: '26 anos',
            location: 'Nampula',
            mainImage: 'https://i.postimg.cc/qRMnBMyV/143127941-421898882477563-1534463607340270020-o.jpg',
            gallery: [
                'https://i.postimg.cc/qRMnBMyV/143127941-421898882477563-1534463607340270020-o.jpg',
                'https://i.postimg.cc/Xv6mztFy/236376192-3857235194382171-763223918932869912-n.jpg',
                'https://i.postimg.cc/66ZR9SGQ/236757367-4188721321213616-458560518676334121-n.jpg'
            ],
            bio: 'Modelo premium com formação internacional. Oferece serviços exclusivos para clientes exigentes.',
            services: ['Serviços Premium', 'Acompanhamento Internacional', 'Eventos Exclusivos', 'Consultoria de Imagem'],
            specialties: ['Luxo', 'Exclusividade', 'Internacional', 'Premium'],
            availability: 'Agendamento prévio',
            whatsapp: `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Olá!%20Tenho%20interesse%20em%20conhecer%20a%20Valentina`
        },
        adriana: {
            name: 'Adriana',
            category: 'Modelo Exclusiva',
            age: '24 anos',
            location: 'Nampula',
            mainImage: 'https://i.postimg.cc/Xv6mztFy/236376192-3857235194382171-763223918932869912-n.jpg',
            gallery: [
                'https://i.postimg.cc/Xv6mztFy/236376192-3857235194382171-763223918932869912-n.jpg',
                'https://i.postimg.cc/66ZR9SGQ/236757367-4188721321213616-458560518676334121-n.jpg',
                'https://i.postimg.cc/Xv2KCCV7/121973195-351310436287938-1918747329702667523-n.jpg'
            ],
            bio: 'Jovem modelo com energia e carisma únicos. Especializada em criar experiências memoráveis.',
            services: ['Modelagem Jovem', 'Eventos Casuais', 'Acompanhamento Descontraído', 'Sessões Criativas'],
            specialties: ['Juventude', 'Energia', 'Criatividade', 'Carisma'],
            availability: 'Flexível',
            whatsapp: `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Olá!%20Tenho%20interesse%20em%20conhecer%20a%20Adriana`
        },
        camila: {
            name: 'Camila',
            category: 'Modelo VIP',
            age: '27 anos',
            location: 'Nampula',
            mainImage: 'https://i.postimg.cc/66ZR9SGQ/236757367-4188721321213616-458560518676334121-n.jpg',
            gallery: [
                'https://i.postimg.cc/66ZR9SGQ/236757367-4188721321213616-458560518676334121-n.jpg',
                'https://i.postimg.cc/Xv2KCCV7/121973195-351310436287938-1918747329702667523-n.jpg',
                'https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg'
            ],
            bio: 'Modelo VIP com experiência em atendimento de alto padrão. Focada em proporcionar momentos únicos.',
            services: ['Atendimento VIP', 'Eventos Corporativos', 'Viagens de Negócios', 'Jantares Formais'],
            specialties: ['VIP', 'Corporativo', 'Formal', 'Exclusivo'],
            availability: '24/7',
            whatsapp: `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Olá!%20Tenho%20interesse%20em%20conhecer%20a%20Camila`
        },
        beatriz: {
            name: 'Beatriz',
            category: 'Modelo Elite',
            age: '29 anos',
            location: 'Nampula',
            mainImage: 'https://i.postimg.cc/Xv2KCCV7/121973195-351310436287938-1918747329702667523-n.jpg',
            gallery: [
                'https://i.postimg.cc/Xv2KCCV7/121973195-351310436287938-1918747329702667523-n.jpg',
                'https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg',
                'https://i.postimg.cc/25N7YD0r/123997228-3627243123965219-2863826447702482559-o.jpg'
            ],
            bio: 'Modelo elite com vasta experiência e refinamento. Ideal para clientes que buscam o melhor.',
            services: ['Serviços Elite', 'Consultoria Executiva', 'Eventos de Gala', 'Acompanhamento Diplomático'],
            specialties: ['Elite', 'Refinamento', 'Diplomacia', 'Gala'],
            availability: 'Sob consulta',
            whatsapp: `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Olá!%20Tenho%20interesse%20em%20conhecer%20a%20Beatriz`
        }
    },

    showProfile(profileId) {
        const profile = this.profiles[profileId];
        if (!profile) return;

        // Preencher dados do perfil
        document.getElementById('profile-name').textContent = profile.name;
        document.getElementById('profile-category').textContent = profile.category;
        document.getElementById('profile-age').textContent = profile.age;
        document.getElementById('profile-location').textContent = profile.location;
        document.getElementById('profile-main-img').src = profile.mainImage;
        document.getElementById('profile-bio').textContent = profile.bio;
        document.getElementById('profile-availability').textContent = profile.availability;
        document.getElementById('profile-whatsapp').href = profile.whatsapp;

        // Preencher galeria
        const gallery = document.getElementById('profile-gallery');
        gallery.innerHTML = '';
        profile.gallery.forEach(img => {
            const imgElement = document.createElement('img');
            imgElement.src = img;
            imgElement.alt = `Foto de ${profile.name}`;
            imgElement.onclick = () => this.showImageModal(img);
            gallery.appendChild(imgElement);
        });

        // Preencher serviços
        const services = document.getElementById('profile-services');
        services.innerHTML = '';
        profile.services.forEach(service => {
            const serviceElement = document.createElement('div');
            serviceElement.className = 'service-tag';
            serviceElement.textContent = service;
            services.appendChild(serviceElement);
        });

        // Preencher especialidades
        const specialties = document.getElementById('profile-specialties');
        specialties.innerHTML = '';
        profile.specialties.forEach(specialty => {
            const specialtyElement = document.createElement('div');
            specialtyElement.className = 'specialty-tag';
            specialtyElement.textContent = specialty;
            specialties.appendChild(specialtyElement);
        });

        ModalManager.open('profile-modal');
    },

    showImageModal(imageSrc) {
        // Criar modal de imagem se não existir
        let imageModal = document.getElementById('image-modal');
        if (!imageModal) {
            imageModal = document.createElement('div');
            imageModal.id = 'image-modal';
            imageModal.className = 'modal hidden';
            imageModal.innerHTML = `
                <div class="modal-overlay"></div>
                <div class="modal-content" style="background: transparent; border: none; max-width: 90vw; max-height: 90vh;">
                    <img id="modal-image" src="" alt="Imagem ampliada" style="width: 100%; height: auto; border-radius: 10px;">
                    <button class="modal-close" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; border: none; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; cursor: pointer;">&times;</button>
                </div>
            `;
            document.body.appendChild(imageModal);

            // Adicionar event listeners
            imageModal.querySelector('.modal-close').onclick = () => ModalManager.close('image-modal');
            imageModal.querySelector('.modal-overlay').onclick = () => ModalManager.close('image-modal');
        }

        document.getElementById('modal-image').src = imageSrc;
        ModalManager.open('image-modal');
    }
};

// Navegação
const Navigation = {
    init() {
        const navbar = document.getElementById('navbar');
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');
        const navLinks = document.querySelectorAll('.nav-link');

        // Scroll effect
        window.addEventListener('scroll', Utils.debounce(() => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }, 10));

        // Mobile menu toggle
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Smooth scroll para links internos
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href.startsWith('#')) {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                        // Fechar menu mobile se estiver aberto
                        if (navMenu) navMenu.classList.remove('active');
                        if (navToggle) navToggle.classList.remove('active');
                    }
                }
            });
        });
    }
};

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Galeria Secreta - Inicializando aplicação...');

    // Inicializar navegação
    Navigation.init();

    // Event listeners para botões principais
    const joinBtn = document.getElementById('join-btn');
    const signupBtn = document.getElementById('signup-btn');
    const loginBtn = document.getElementById('login-btn');
    const supportBtn = document.getElementById('support-btn');
    const toggleGalleryBtn = document.getElementById('toggle-gallery-btn');
    const contactAcompanhantesBtn = document.getElementById('contact-acompanhantes');

    // Botão "Quero Fazer Parte"
    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            document.getElementById('application').classList.remove('hidden');
            document.getElementById('application').scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Botão "Escreva-se"
    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            ModalManager.open('signup-modal');
        });
    }

    // Botão Login
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            ModalManager.open('login-modal');
        });
    }

    // Botão Suporte
    if (supportBtn) {
        supportBtn.addEventListener('click', () => {
            ModalManager.open('support-modal');
        });
    }

    // Botão Ver Acompanhantes
    if (toggleGalleryBtn) {
        toggleGalleryBtn.addEventListener('click', () => {
            const acompanhantesSection = document.getElementById('acompanhantes');
            if (acompanhantesSection) {
                acompanhantesSection.classList.toggle('hidden');
                if (!acompanhantesSection.classList.contains('hidden')) {
                    acompanhantesSection.scrollIntoView({ behavior: 'smooth' });
                    toggleGalleryBtn.textContent = 'Ocultar Acompanhantes';
                } else {
                    toggleGalleryBtn.textContent = 'Ver Nossas Acompanhantes';
                }
            }
        });
    }

    // Botão Contactar Acompanhantes
    if (contactAcompanhantesBtn) {
        contactAcompanhantesBtn.addEventListener('click', () => {
            window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=Olá!%20Tenho%20interesse%20em%20conhecer%20mais%20sobre%20os%20serviços%20da%20Galeria%20Secreta`, '_blank');
        });
    }

    // Event listeners para botões de perfil
    document.querySelectorAll('.btn-view-profile').forEach(btn => {
        btn.addEventListener('click', () => {
            const profileId = btn.getAttribute('data-profile');
            ProfileManager.showProfile(profileId);
        });
    });

    // Event listeners para fechar modais
    document.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
        element.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                ModalManager.close(modal.id);
            }
        });
    });

    // Event listener para ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            ModalManager.closeAll();
        }
    });

    // Event listeners para formulários
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const applicationForm = document.getElementById('application-form');

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            FormManager.submitForm(loginForm, '/api/login');
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            FormManager.submitForm(signupForm, '/api/registro');
        });
    }

    if (applicationForm) {
        applicationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            FormManager.submitForm(applicationForm, '/api/candidatura');
        });
    }

    // Switch entre login e signup
    const switchToLogin = document.getElementById('switch-to-login');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            ModalManager.close('signup-modal');
            ModalManager.open('login-modal');
        });
    }

    // Upload de foto com preview
    const fotoInput = document.getElementById('foto');
    const photoPreview = document.getElementById('photo-preview');
    const uploadText = document.querySelector('.file-upload-text');

    if (fotoInput && photoPreview) {
        fotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Validar tipo de arquivo
                if (!file.type.startsWith('image/')) {
                    Utils.showNotification('Por favor, selecione apenas arquivos de imagem', 'error');
                    fotoInput.value = '';
                    return;
                }

                // Validar tamanho
                if (file.size > 10 * 1024 * 1024) {
                    Utils.showNotification('A imagem deve ter menos de 10MB', 'error');
                    fotoInput.value = '';
                    return;
                }

                // Mostrar preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoPreview.src = e.target.result;
                    photoPreview.style.display = 'block';
                    if (uploadText) uploadText.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Botão OK do modal de sucesso
    const successOkBtn = document.getElementById('success-ok');
    if (successOkBtn) {
        successOkBtn.addEventListener('click', () => {
            ModalManager.close('success-modal');
        });
    }

    // Link da política de privacidade
    const privacyLink = document.querySelector('.privacy-link');
    if (privacyLink) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            ModalManager.open('privacy-modal');
        });
    }

    // Verificar se usuário está logado
    const token = localStorage.getItem('authToken');
    if (token) {
        // Verificar validade do token
        fetch(`${CONFIG.API_BASE_URL}/api/verify-token`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                AppState.currentUser = data.usuario;
                AppState.isLoggedIn = true;
                FormManager.updateUIForLoggedInUser();
            } else {
                localStorage.removeItem('authToken');
            }
        })
        .catch(error => {
            console.error('Erro ao verificar token:', error);
            localStorage.removeItem('authToken');
        });
    }

    console.log('✅ Aplicação inicializada com sucesso!');
});

// Exportar para uso global se necessário
window.GaleriaSecreta = {
    Utils,
    ModalManager,
    FormManager,
    ProfileManager,
    Navigation,
    AppState,
    CONFIG
};