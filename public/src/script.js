// Configuração do Supabase (será definida via variáveis de ambiente)
let supabaseClient = null;

// Inicializar Supabase quando as variáveis estiverem disponíveis
function initializeSupabase() {
    if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY) {
        supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        console.log('✅ Supabase inicializado');
    }
}

// Estado da aplicação
let currentUser = null;
let isLoggedIn = false;

// Utilitários
const showLoading = (button) => {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline-block';
    button.disabled = true;
};

const hideLoading = (button) => {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    if (btnText) btnText.style.display = 'inline';
    if (btnLoader) btnLoader.style.display = 'none';
    button.disabled = false;
};

const showError = (elementId, message) => {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
};

const clearErrors = (formId) => {
    const form = document.getElementById(formId);
    if (form) {
        const errorElements = form.querySelectorAll('.error-message');
        errorElements.forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
    }
};

const showNotification = (message, type = 'success') => {
    // Criar notificação toast
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">${type === 'success' ? '✅' : '❌'}</span>
            <span class="notification-message">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Mostrar notificação
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 5000);
};

// Validação de formulários
const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validatePhone = (phone) => {
    const re = /^[+]?[\d\s\-\(\)]{8,}$/;
    return re.test(phone);
};

const calculateAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    
    return age;
};

// Gerenciamento de modais
const openModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focar no primeiro input
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
};

const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
        
        // Limpar formulário
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            clearErrors(form.id);
        }
    }
};

// Sistema de autenticação
const login = async (email, password) => {
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha: password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro no login');
        }

        // Salvar token e dados do usuário
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('userData', JSON.stringify(data.usuario));
        
        currentUser = data.usuario;
        isLoggedIn = true;
        
        updateUIForLoggedInUser();
        showNotification('Login realizado com sucesso!');
        closeModal('login-modal');
        
        return data;
    } catch (error) {
        console.error('Erro no login:', error);
        throw error;
    }
};

const register = async (userData) => {
    try {
        const response = await fetch('/api/inscricao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro no registro');
        }

        showNotification('Inscrição realizada com sucesso! Entraremos em contacto em breve.');
        closeModal('signup-modal');
        
        return data;
    } catch (error) {
        console.error('Erro no registro:', error);
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    currentUser = null;
    isLoggedIn = false;
    updateUIForLoggedOutUser();
    showNotification('Logout realizado com sucesso!');
};

const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        try {
            const response = await fetch('/api/verify-token', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            
            if (response.ok) {
                const data = await response.json();
                currentUser = data.usuario;
                isLoggedIn = true;
                updateUIForLoggedInUser();
            } else {
                // Token inválido, limpar dados
                logout();
            }
        } catch (error) {
            console.error('Erro ao verificar token:', error);
            logout();
        }
    }
};

const updateUIForLoggedInUser = () => {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    if (loginBtn) {
        loginBtn.innerHTML = `
            <span class="action-icon">👤</span>
            <span>${currentUser?.nome || 'Usuário'}</span>
        `;
        loginBtn.onclick = () => {
            // Mostrar menu do usuário ou logout
            if (confirm('Deseja fazer logout?')) {
                logout();
            }
        };
    }
    
    if (signupBtn) {
        signupBtn.style.display = 'none';
    }
};

const updateUIForLoggedOutUser = () => {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    if (loginBtn) {
        loginBtn.innerHTML = `
            <span class="action-icon">👤</span>
            <span>Login</span>
        `;
        loginBtn.onclick = () => openModal('login-modal');
    }
    
    if (signupBtn) {
        signupBtn.style.display = 'flex';
    }
};

// Perfis das acompanhantes
const profilesData = {
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
        bio: 'Sofia é uma modelo profissional com vasta experiência em campanhas publicitárias e eventos corporativos. Elegante, sofisticada e sempre impecável.',
        services: ['Acompanhamento em eventos', 'Sessões fotográficas', 'Campanhas publicitárias', 'Eventos corporativos'],
        specialties: ['Elegância', 'Profissionalismo', 'Discrição', 'Sofisticação'],
        whatsapp: '258865595417',
        availability: '24/7'
    },
    isabella: {
        name: 'Isabella',
        category: 'Modelo Experiente',
        age: '28 anos',
        location: 'Nampula',
        mainImage: 'https://i.postimg.cc/25N7YD0r/123997228-3627243123965219-2863826447702482559-o.jpg',
        gallery: [
            'https://i.postimg.cc/25N7YD0r/123997228-3627243123965219-2863826447702482559-o.jpg',
            'https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg',
            'https://i.postimg.cc/Xv6mztFy/236376192-3857235194382171-763223918932869912-n.jpg'
        ],
        bio: 'Isabella combina experiência e charme natural. Com anos de experiência no mercado, oferece serviços de alta qualidade com total profissionalismo.',
        services: ['Acompanhamento VIP', 'Eventos sociais', 'Viagens de negócios', 'Jantares executivos'],
        specialties: ['Experiência', 'Charme', 'Versatilidade', 'Confiança'],
        whatsapp: '258865595417',
        availability: 'Seg-Sex 9h-22h'
    },
    valentina: {
        name: 'Valentina',
        category: 'Modelo Premium',
        age: '26 anos',
        location: 'Nampula',
        mainImage: 'https://i.postimg.cc/qRMnBMyV/143127941-421898882477563-1534463607340270020-o.jpg',
        gallery: [
            'https://i.postimg.cc/qRMnBMyV/143127941-421898882477563-1534463607340270020-o.jpg',
            'https://i.postimg.cc/66ZR9SGQ/236757367-4188721321213616-458560518676334121-n.jpg',
            'https://i.postimg.cc/Xv2KCCV7/121973195-351310436287938-1918747329702667523-n.jpg'
        ],
        bio: 'Valentina representa o que há de melhor em elegância e sofisticação. Modelo premium com presença marcante e personalidade cativante.',
        services: ['Serviços premium', 'Eventos exclusivos', 'Acompanhamento internacional', 'Sessões de luxo'],
        specialties: ['Luxo', 'Exclusividade', 'Presença', 'Sofisticação'],
        whatsapp: '258865595417',
        availability: 'Sob consulta'
    },
    adriana: {
        name: 'Adriana',
        category: 'Modelo Exclusiva',
        age: '24 anos',
        location: 'Nampula',
        mainImage: 'https://i.postimg.cc/Xv6mztFy/236376192-3857235194382171-763223918932869912-n.jpg',
        gallery: [
            'https://i.postimg.cc/Xv6mztFy/236376192-3857235194382171-763223918932869912-n.jpg',
            'https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg',
            'https://i.postimg.cc/25N7YD0r/123997228-3627243123965219-2863826447702482559-o.jpg'
        ],
        bio: 'Adriana é jovem, dinâmica e cheia de energia. Modelo exclusiva que traz frescor e modernidade aos seus serviços.',
        services: ['Modelagem jovem', 'Eventos modernos', 'Campanhas digitais', 'Influência digital'],
        specialties: ['Juventude', 'Energia', 'Modernidade', 'Dinamismo'],
        whatsapp: '258865595417',
        availability: 'Flexível'
    },
    camila: {
        name: 'Camila',
        category: 'Modelo VIP',
        age: '27 anos',
        location: 'Nampula',
        mainImage: 'https://i.postimg.cc/66ZR9SGQ/236757367-4188721321213616-458560518676334121-n.jpg',
        gallery: [
            'https://i.postimg.cc/66ZR9SGQ/236757367-4188721321213616-458560518676334121-n.jpg',
            'https://i.postimg.cc/qRMnBMyV/143127941-421898882477563-1534463607340270020-o.jpg',
            'https://i.postimg.cc/Xv6mztFy/236376192-3857235194382171-763223918932869912-n.jpg'
        ],
        bio: 'Camila oferece serviços VIP com o mais alto padrão de qualidade. Profissional dedicada e comprometida com a excelência.',
        services: ['Serviços VIP', 'Atendimento personalizado', 'Eventos de gala', 'Acompanhamento executivo'],
        specialties: ['VIP', 'Personalização', 'Excelência', 'Dedicação'],
        whatsapp: '258865595417',
        availability: '24/7'
    },
    beatriz: {
        name: 'Beatriz',
        category: 'Modelo Elite',
        age: '29 anos',
        location: 'Nampula',
        mainImage: 'https://i.postimg.cc/Xv2KCCV7/121973195-351310436287938-1918747329702667523-n.jpg',
        gallery: [
            'https://i.postimg.cc/Xv2KCCV7/121973195-351310436287938-1918747329702667523-n.jpg',
            'https://i.postimg.cc/66ZR9SGQ/236757367-4188721321213616-458560518676334121-n.jpg',
            'https://i.postimg.cc/25N7YD0r/123997228-3627243123965219-2863826447702482559-o.jpg'
        ],
        bio: 'Beatriz representa o topo da elite. Com maturidade e experiência, oferece serviços de altíssimo nível para clientes exigentes.',
        services: ['Serviços elite', 'Consultoria de imagem', 'Eventos de alto nível', 'Acompanhamento internacional'],
        specialties: ['Elite', 'Maturidade', 'Experiência', 'Alto nível'],
        whatsapp: '258865595417',
        availability: 'Agendamento prévio'
    }
};

// Função para mostrar perfil
const showProfile = (profileId) => {
    const profile = profilesData[profileId];
    if (!profile) return;

    // Preencher dados do perfil
    document.getElementById('profile-name').textContent = profile.name;
    document.getElementById('profile-category').textContent = profile.category;
    document.getElementById('profile-age').textContent = profile.age;
    document.getElementById('profile-location').textContent = profile.location;
    document.getElementById('profile-main-img').src = profile.mainImage;
    document.getElementById('profile-bio').textContent = profile.bio;
    document.getElementById('profile-availability').textContent = profile.availability;

    // Preencher galeria
    const gallery = document.getElementById('profile-gallery');
    gallery.innerHTML = '';
    profile.gallery.forEach(img => {
        const imgElement = document.createElement('img');
        imgElement.src = img;
        imgElement.alt = `Foto de ${profile.name}`;
        imgElement.className = 'gallery-image';
        imgElement.onclick = () => {
            document.getElementById('profile-main-img').src = img;
        };
        gallery.appendChild(imgElement);
    });

    // Preencher serviços
    const services = document.getElementById('profile-services');
    services.innerHTML = '';
    profile.services.forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.className = 'service-item';
        serviceElement.innerHTML = `<span class="service-icon">✓</span> ${service}`;
        services.appendChild(serviceElement);
    });

    // Preencher especialidades
    const specialties = document.getElementById('profile-specialties');
    specialties.innerHTML = '';
    profile.specialties.forEach(specialty => {
        const specialtyElement = document.createElement('span');
        specialtyElement.className = 'specialty-tag';
        specialtyElement.textContent = specialty;
        specialties.appendChild(specialtyElement);
    });

    // Configurar WhatsApp
    const whatsappBtn = document.getElementById('profile-whatsapp');
    whatsappBtn.href = `https://wa.me/${profile.whatsapp}?text=Olá!%20Tenho%20interesse%20em%20conhecer%20mais%20sobre%20os%20serviços%20da%20${profile.name}%20na%20Galeria%20Secreta.`;

    openModal('profile-modal');
};

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Galeria Secreta carregada');
    
    // Verificar status de autenticação
    checkAuthStatus();
    
    // Inicializar Supabase se disponível
    initializeSupabase();

    // Navigation
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Smooth scrolling para links de navegação
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                // Fechar menu mobile se estiver aberto
                if (navMenu) navMenu.classList.remove('active');
                if (navToggle) navToggle.classList.remove('active');
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Botões principais
    const joinBtn = document.getElementById('join-btn');
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const supportBtn = document.getElementById('support-btn');
    const toggleGalleryBtn = document.getElementById('toggle-gallery-btn');

    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            openModal('signup-modal');
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            if (isLoggedIn) {
                if (confirm('Deseja fazer logout?')) {
                    logout();
                }
            } else {
                openModal('login-modal');
            }
        });
    }

    if (signupBtn) {
        signupBtn.addEventListener('click', () => {
            openModal('signup-modal');
        });
    }

    if (supportBtn) {
        supportBtn.addEventListener('click', () => {
            openModal('support-modal');
        });
    }

    if (toggleGalleryBtn) {
        toggleGalleryBtn.addEventListener('click', () => {
            const acompanhantesSection = document.getElementById('acompanhantes');
            if (acompanhantesSection) {
                acompanhantesSection.classList.toggle('hidden');
                if (!acompanhantesSection.classList.contains('hidden')) {
                    acompanhantesSection.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    }

    // Botões de perfil das acompanhantes
    document.querySelectorAll('.btn-view-profile').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const profileId = e.target.getAttribute('data-profile');
            if (profileId) {
                showProfile(profileId);
            }
        });
    });

    // Modais - Botões de fechar
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Fechar modal clicando no overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                closeModal(modal.id);
            }
        });
    });

    // Fechar modal com ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const openModal = document.querySelector('.modal:not(.hidden)');
            if (openModal) {
                closeModal(openModal.id);
            }
        }
    });

    // Switch entre login e signup
    const switchToLogin = document.getElementById('switch-to-login');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal('signup-modal');
            openModal('login-modal');
        });
    }

    // Formulário de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            // Limpar erros anteriores
            clearErrors('login-form');

            // Validações
            if (!email) {
                showError('login-email-error', 'Email é obrigatório');
                return;
            }

            if (!validateEmail(email)) {
                showError('login-email-error', 'Email inválido');
                return;
            }

            if (!password) {
                showError('login-password-error', 'Palavra-passe é obrigatória');
                return;
            }

            try {
                showLoading(submitBtn);
                await login(email, password);
            } catch (error) {
                showError('login-password-error', error.message);
            } finally {
                hideLoading(submitBtn);
            }
        });
    }

    // Formulário de inscrição
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            
            // Coletar dados do formulário
            const formData = new FormData(signupForm);
            const userData = {};
            
            for (let [key, value] of formData.entries()) {
                if (key === 'experiencia_anterior' || key === 'newsletter' || key === 'termos_aceitos') {
                    userData[key] = value === 'on';
                } else {
                    userData[key] = value;
                }
            }

            // Limpar erros anteriores
            clearErrors('signup-form');

            // Validações
            let hasErrors = false;

            if (!userData.nome) {
                showError('signup-nome-error', 'Nome é obrigatório');
                hasErrors = true;
            }

            if (!userData.email) {
                showError('signup-email-error', 'Email é obrigatório');
                hasErrors = true;
            } else if (!validateEmail(userData.email)) {
                showError('signup-email-error', 'Email inválido');
                hasErrors = true;
            }

            if (!userData.telefone) {
                showError('signup-telefone-error', 'Telefone é obrigatório');
                hasErrors = true;
            } else if (!validatePhone(userData.telefone)) {
                showError('signup-telefone-error', 'Telefone inválido');
                hasErrors = true;
            }

            if (!userData.data_nascimento) {
                showError('signup-data-nascimento-error', 'Data de nascimento é obrigatória');
                hasErrors = true;
            } else {
                const age = calculateAge(userData.data_nascimento);
                if (age < 18) {
                    showError('signup-data-nascimento-error', 'Deve ter pelo menos 18 anos');
                    hasErrors = true;
                }
            }

            if (!userData.genero) {
                showError('signup-genero-error', 'Gênero é obrigatório');
                hasErrors = true;
            }

            if (!userData.cidade) {
                showError('signup-cidade-error', 'Cidade é obrigatória');
                hasErrors = true;
            }

            if (!userData.provincia) {
                showError('signup-provincia-error', 'Província é obrigatória');
                hasErrors = true;
            }

            if (!userData.disponibilidade) {
                showError('signup-disponibilidade-error', 'Disponibilidade é obrigatória');
                hasErrors = true;
            }

            if (!userData.termos_aceitos) {
                showError('signup-termos-error', 'Deve aceitar os termos e condições');
                hasErrors = true;
            }

            if (hasErrors) return;

            try {
                showLoading(submitBtn);
                await register(userData);
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                hideLoading(submitBtn);
            }
        });
    }

    // Formulário de candidatura
    const applicationForm = document.getElementById('application-form');
    if (applicationForm) {
        applicationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = applicationForm.querySelector('button[type="submit"]');
            const formData = new FormData(applicationForm);

            try {
                showLoading(submitBtn);
                
                const response = await fetch('/api/candidatura', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erro ao enviar candidatura');
                }

                showNotification('Candidatura enviada com sucesso! Entraremos em contacto em breve.');
                applicationForm.reset();
                
                // Mostrar modal de sucesso
                openModal('success-modal');
                
            } catch (error) {
                showNotification(error.message, 'error');
            } finally {
                hideLoading(submitBtn);
            }
        });
    }

    // Preview de foto no formulário de candidatura
    const fotoInput = document.getElementById('foto');
    const photoPreview = document.getElementById('photo-preview');
    
    if (fotoInput && photoPreview) {
        fotoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoPreview.src = e.target.result;
                    photoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Modal de sucesso
    const successOkBtn = document.getElementById('success-ok');
    if (successOkBtn) {
        successOkBtn.addEventListener('click', () => {
            closeModal('success-modal');
        });
    }

    // Animações de scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar elementos para animação
    document.querySelectorAll('.section-header, .service-card, .benefit-card, .acompanhante-card').forEach(el => {
        observer.observe(el);
    });

    console.log('✅ Todos os event listeners configurados');
});

// Particles animation
function createParticles() {
    const particles = document.querySelector('.hero-particles');
    if (!particles) return;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particles.appendChild(particle);
    }
}

// Inicializar partículas quando a página carregar
window.addEventListener('load', createParticles);