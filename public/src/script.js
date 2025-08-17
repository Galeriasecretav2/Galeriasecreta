// DOM Elements
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const applicationForm = document.getElementById('application-form');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const supportBtn = document.getElementById('support-btn');
const joinBtn = document.getElementById('join-btn');
const signupBtn = document.getElementById('signup-btn');
const contactAcompanhantesBtn = document.getElementById('contact-acompanhantes');
const loginModal = document.getElementById('login-modal');
const signupModal = document.getElementById('signup-modal');
const supportModal = document.getElementById('support-modal');

// Privacy Policy Modal
const privacyLink = document.querySelector('.privacy-link');
const privacyModal = document.getElementById('privacy-modal');
const privacyClose = document.getElementById('privacy-close');

const successModal = document.getElementById('success-modal');
const loadingOverlay = document.getElementById('loading-overlay');
const loginClose = document.getElementById('login-close');
const signupClose = document.getElementById('signup-close');
const supportClose = document.getElementById('support-close');
const successClose = document.getElementById('success-close');
const successOk = document.getElementById('success-ok');
const switchToLogin = document.getElementById('switch-to-login');
const photoInput = document.getElementById('foto');
const photoPreview = document.getElementById('photo-preview');
const toggleGalleryBtn = document.getElementById('toggle-gallery-btn');
const acompanhantesSection = document.getElementById('acompanhantes');
const profileModal = document.getElementById('profile-modal');
const profileClose = document.getElementById('profile-close');

// State Management
let isSubmitting = false;
let formData = {};
let galleryVisible = false;
let profilesData = {};
let currentUser = null;
let authToken = localStorage.getItem('authToken');

// Enhanced Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    checkAuthStatus();
    setupEventListeners();
    setupFormValidation();
    setupIntersectionObserver();
    setupScrollEffects();
    setupFormAutoSave();
    preloadCriticalResources();
    createScrollToTopButton();
    initializeProfilesData();
    setupProfileEvents();
    
    // Show page after initialization
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
}

// Função para verificar status de autenticação
async function checkAuthStatus() {
    if (!authToken) {
        updateAuthUI(false);
        return;
    }

    try {
        const response = await fetch('/api/verify-token', {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            currentUser = data.usuario;
            updateAuthUI(true);
        } else {
            // Token inválido
            localStorage.removeItem('authToken');
            authToken = null;
            updateAuthUI(false);
        }
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        updateAuthUI(false);
    }
}

// Função para atualizar UI baseada no status de auth
function updateAuthUI(isLoggedIn) {
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    
    if (isLoggedIn && currentUser) {
        // Usuário logado
        if (loginBtn) {
            loginBtn.innerHTML = `
                <span class="action-icon">👤</span>
                <span>${currentUser.nome}</span>
            `;
            loginBtn.onclick = showUserMenu;
        }
        
        if (signupBtn) {
            signupBtn.innerHTML = '<span>Sair</span>';
            signupBtn.onclick = logout;
        }
    } else {
        // Usuário não logado
        if (loginBtn) {
            loginBtn.innerHTML = `
                <span class="action-icon">👤</span>
                <span>Login</span>
            `;
            loginBtn.onclick = () => openModal(loginModal);
        }
        
        if (signupBtn) {
            signupBtn.innerHTML = '<span>Escreva-se</span>';
            signupBtn.onclick = () => openModal(signupModal);
        }
    }
}

// Função para mostrar menu do usuário (placeholder)
function showUserMenu() {
    // Implementar menu dropdown do usuário
    console.log('Menu do usuário:', currentUser);
}

// Função para logout
async function logout() {
    try {
        if (authToken) {
            await fetch('/api/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        }
    } catch (error) {
        console.error('Erro no logout:', error);
    } finally {
        localStorage.removeItem('authToken');
        authToken = null;
        currentUser = null;
        updateAuthUI(false);
        showNotification('Logout realizado com sucesso!', 'success');
    }
}

function setupEventListeners() {
    // Join button functionality
    if (joinBtn) {
        joinBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showApplicationForm();
        });
    }
    
    // Signup button functionality
    if (signupBtn) {
        signupBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal(signupModal);
        });
    }
    
    // Contact acompanhantes button
    if (contactAcompanhantesBtn) {
        contactAcompanhantesBtn.addEventListener('click', function(e) {
            e.preventDefault();
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Toggle gallery button
    if (toggleGalleryBtn) {
        toggleGalleryBtn.addEventListener('click', function(e) {
            e.preventDefault();
            toggleGallery();
        });
    }

    // Modal functionality
    setupModalEvents();
    
    // Navigation events
    setupNavigationEvents();
    
    // Form events
    setupFormEvents();
    
    // Keyboard events
    setupKeyboardEvents();
}

// Initialize profiles data
function initializeProfilesData() {
    profilesData = {
        sofia: {
            name: 'Sofia',
            category: 'Modelo Profissional',
            age: '25 anos',
            location: 'Nampula',
            mainImage: 'https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg',
            gallery: [
               
            ],
            bio: 'Olá, sou a Sofia! Uma modelo profissional com 5 anos de experiência no ramo. Sou uma pessoa elegante, educada e sempre disposta a proporcionar momentos únicos e inesquecíveis. Valorizo a discrição, o respeito mútuo e a qualidade em todos os encontros. Adoro conversas interessantes, jantares sofisticados e experiências culturais.',
            services: [
                { icon: '🍽️', name: 'Jantares Exclusivos', description: 'Acompanhamento em restaurantes e eventos sociais' },
                { icon: '🎭', name: 'Eventos Culturais', description: 'Teatro, ópera, exposições e eventos artísticos' },
                { icon: '✈️', name: 'Viagens', description: 'Acompanhamento em viagens nacionais e internacionais' },
                { icon: '🏢', name: 'Eventos Corporativos', description: 'Reuniões de negócios e eventos empresariais' }
            ],
            specialties: ['Elegância', 'Discrição', 'Conversação', 'Etiqueta Social', 'Idiomas'],
            whatsapp: 'https://wa.me/258851551556?text=Olá!%20Tenho%20interesse%20na%20Galeria%20Secreta',
            availability: '24/7'
        },
        isabella: {
            name: 'Isabella',
            category: 'Modelo Experiente',
            age: '28 anos',
            location: 'Nampula',
            mainImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400',
            gallery: [
                
            ],
            bio: 'Sou a Isabella, uma acompanhante experiente que valoriza a autenticidade e a conexão genuína. Com formação em psicologia, ofereço não apenas beleza, mas também inteligência emocional e capacidade de adaptação a qualquer ambiente social. Sou apaixonada por arte, literatura e gastronomia.',
            services: [
                { icon: '🎨', name: 'Eventos Artísticos', description: 'Vernissages, exposições e eventos culturais' },
                { icon: '📚', name: 'Encontros Intelectuais', description: 'Conversas profundas e troca de conhecimentos' },
                { icon: '🍷', name: 'Degustações', description: 'Vinhos, gastronomia e experiências culinárias' },
                { icon: '🌃', name: 'Vida Noturna', description: 'Bares sofisticados e ambientes exclusivos' }
            ],
            specialties: ['Psicologia', 'Arte', 'Gastronomia', 'Literatura', 'Empatia'],
            whatsapp: 'https://wa.me/258851551556?text=Olá!%20Tenho%20interesse%20na%20Galeria%20Secreta',
            availability: 'Seg-Dom 18h-02h'
        },
        valentina: {
            name: 'Valentina',
            category: 'Modelo Premium',
            age: '26 anos',
            location: 'Nampula',
            mainImage: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400',
            gallery: [
                
            ],
            bio: 'Olá, sou a Valentina! Modelo premium com experiência internacional. Falo fluentemente português, inglês e francês. Sou sofisticada, bem-educada e sempre impecavelmente apresentada. Adoro viajar, conhecer novas culturas e proporcionar experiências memoráveis aos meus clientes mais exigentes.',
            services: [
                { icon: '🌍', name: 'Viagens Internacionais', description: 'Acompanhamento em destinos exclusivos' },
                { icon: '🥂', name: 'Eventos VIP', description: 'Festas exclusivas e eventos de alto nível' },
                { icon: '🏖️', name: 'Resorts & Spas', description: 'Relaxamento e bem-estar em locais paradisíacos' },
                { icon: '💎', name: 'Experiências Luxury', description: 'Serviços premium e experiências únicas' }
            ],
            specialties: ['Multilíngue', 'Viagens', 'Luxo', 'Protocolo', 'Sofisticação'],
            whatsapp: 'https://wa.me/258851551556?text=Olá!%20Tenho%20interesse%20na%20Galeria%20Secreta',
            availability: 'Sob consulta'
        },
        adriana: {
            name: 'Adriana',
            category: 'Modelo Exclusiva',
            age: '24 anos',
            location: 'Nampula',
            mainImage: 'https://i.postimg.cc/N0J5XXxz/236376192-3857235194382171-763223918932869912-n.jpg',
            gallery: [
                
            ],
            bio: 'Sou a Adriana, jovem, vibrante e cheia de energia! Modelo exclusiva que adora aventuras e experiências novas. Sou espontânea, divertida e sempre trago alegria aos encontros. Adoro música, dança, praia e tudo que envolva diversão e descontração, sempre mantendo a elegância.',
            services: [
                { icon: '🎵', name: 'Eventos Musicais', description: 'Concertos, festivais e shows exclusivos' },
                { icon: '🏖️', name: 'Aventuras na Praia', description: 'Dias relaxantes à beira-mar' },
                { icon: '🎉', name: 'Festas Privadas', description: 'Celebrações íntimas e divertidas' },
                { icon: '🌅', name: 'Experiências Naturais', description: 'Passeios e atividades ao ar livre' }
            ],
            specialties: ['Juventude', 'Energia', 'Música', 'Dança', 'Aventura'],
            whatsapp: 'https://wa.me/258851551556?text=Olá!%20Tenho%20interesse%20na%20Galeria%20Secreta',
            availability: 'Ter-Sáb 20h-04h'
        },
        camila: {
            name: 'Camila',
            category: 'Modelo VIP',
            age: '27 anos',
            location: 'Nampula',
            mainImage: 'https://i.postimg.cc/26Hm3Vqw/235028980-1158931497943394-4321605246009855057-n.jpg',
            gallery: [
                
            ],
            bio: 'Olá, sou a Camila! Modelo VIP com experiência em moda e publicidade. Sou carismática, inteligente e sempre bem-humorada. Tenho facilidade para me adaptar a qualquer situação social, desde jantares formais até eventos descontraídos. Valorizo a qualidade dos encontros e a satisfação dos meus clientes.',
            services: [
                { icon: '📸', name: 'Sessões Fotográficas', description: 'Acompanhamento em ensaios e campanhas' },
                { icon: '🎪', name: 'Eventos de Moda', description: 'Desfiles, lançamentos e eventos fashion' },
                { icon: '🍾', name: 'Celebrações Especiais', description: 'Aniversários, comemorações e datas especiais' },
                { icon: '🎯', name: 'Networking', description: 'Eventos profissionais e conexões de negócios' }
            ],
            specialties: ['Moda', 'Fotografia', 'Carisma', 'Networking', 'Versatilidade'],
            whatsapp: 'https://wa.me/258851551556?text=Olá!%20Tenho%20interesse%20na%20Galeria%20Secreta',
            availability: 'Qua-Dom 19h-03h'
        },
        beatriz: {
            name: 'Beatriz',
            category: 'Modelo Elite',
            age: '29 anos',
            location: 'Nampula',
            mainImage: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=400',
            gallery: [
                
            ],
            bio: 'Sou a Beatriz, modelo elite com vasta experiência e maturidade. Ofereço companhia refinada para homens de bom gosto que valorizam a excelência. Sou culta, elegante e possuo uma presença marcante. Especializo-me em encontros de alto nível, sempre priorizando a discrição e a qualidade.',
            services: [
                { icon: '👑', name: 'Serviços Elite', description: 'Experiências exclusivas para clientes VIP' },
                { icon: '🏛️', name: 'Eventos Institucionais', description: 'Cerimônias oficiais e eventos de gala' },
                { icon: '🎼', name: 'Cultura Clássica', description: 'Ópera, música clássica e arte refinada' },
                { icon: '💼', name: 'Executivo Premium', description: 'Acompanhamento para executivos e empresários' }
            ],
            specialties: ['Elite', 'Maturidade', 'Refinamento', 'Discrição', 'Excelência'],
            whatsapp: 'https://wa.me/258851551556?text=Olá!%20Tenho%20interesse%20na%20Galeria%20Secreta',
            availability: 'Seg-Sex 18h-24h'
        }
    };
}

function setupProfileEvents() {
    // Profile modal close events
    if (profileClose) {
        profileClose.addEventListener('click', () => closeModal(profileModal));
    }
    
    // Close modal when clicking overlay
    if (profileModal) {
        profileModal.addEventListener('click', function(e) {
            if (e.target === profileModal || e.target.classList.contains('modal-overlay')) {
                closeModal(profileModal);
            }
        });
    }
    
    // Profile buttons
    document.querySelectorAll('.btn-view-profile').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const profileId = this.getAttribute('data-profile');
            openProfile(profileId);
        });
    });
    
    // Make acompanhante cards clickable
    document.querySelectorAll('.acompanhante-card').forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking the button
            if (e.target.classList.contains('btn-view-profile')) return;
            
            const btn = this.querySelector('.btn-view-profile');
            if (btn) {
                const profileId = btn.getAttribute('data-profile');
                openProfile(profileId);
            }
        });
        
        // Add cursor pointer to indicate clickability
        card.style.cursor = 'pointer';
    });
}

function openProfile(profileId) {
    const profile = profilesData[profileId];
    if (!profile) {
        showNotification('Perfil não encontrado.', 'error');
        return;
    }
    
    // Populate profile data
    document.getElementById('profile-name').textContent = profile.name;
    document.getElementById('profile-category').textContent = profile.category;
    document.getElementById('profile-age').textContent = profile.age;
    document.getElementById('profile-location').textContent = profile.location;
    document.getElementById('profile-main-img').src = profile.mainImage;
    document.getElementById('profile-main-img').alt = `Foto de ${profile.name}`;
    document.getElementById('profile-bio').textContent = profile.bio;
    document.getElementById('profile-availability').textContent = profile.availability;
    
    // Populate gallery
    const galleryContainer = document.getElementById('profile-gallery');
    galleryContainer.innerHTML = '';
    profile.gallery.forEach((imageUrl, index) => {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.innerHTML = `
            <img src="${imageUrl}" alt="Foto ${index + 1} de ${profile.name}" loading="lazy">
        `;
        
        // Add click event to gallery items for full-screen view
        galleryItem.addEventListener('click', () => {
            openImageFullscreen(imageUrl, profile.name);
        });
        
        galleryContainer.appendChild(galleryItem);
    });
    
    // Populate services
    const servicesContainer = document.getElementById('profile-services');
    servicesContainer.innerHTML = '';
    profile.services.forEach(service => {
        const serviceItem = document.createElement('div');
        serviceItem.className = 'service-item';
        serviceItem.innerHTML = `
            <div class="service-icon">${service.icon}</div>
            <div class="service-details">
                <h5>${service.name}</h5>
                <p>${service.description}</p>
            </div>
        `;
        servicesContainer.appendChild(serviceItem);
    });
    
    // Populate specialties
    const specialtiesContainer = document.getElementById('profile-specialties');
    specialtiesContainer.innerHTML = '';
    profile.specialties.forEach(specialty => {
        const specialtyTag = document.createElement('span');
        specialtyTag.className = 'specialty-tag';
        specialtyTag.textContent = specialty;
        specialtiesContainer.appendChild(specialtyTag);
    });
    
    // Setup WhatsApp link
    const whatsappBtn = document.getElementById('profile-whatsapp');
    const whatsappMessage = encodeURIComponent(`Olá ${profile.name}! Vi o seu perfil na Galeria Secreta e gostaria de saber mais sobre os seus serviços. Estou interessado em marcar um encontro.`);
    const whatsappNumber = profile.whatsapp.replace(/[^\d]/g, ''); // Remove all non-digits
    whatsappBtn.href = `https://wa.me/258865595417?text=Olá!%20Tenho%20interesse%20na%20Galeria%20Secreta}`;
    
    // Add click tracking for WhatsApp button
    whatsappBtn.addEventListener('click', function(e) {
        // Track the click (you can add analytics here)
        console.log(`WhatsApp contact initiated for ${profile.name}`);
        
        // Show feedback to user
        showNotification(`Redirecionando para WhatsApp de ${profile.name}...`, 'info');
    });
    
    // Setup call button
    const callBtn = document.getElementById('profile-call');
    // Remove any existing event listeners
    const newCallBtn = callBtn.cloneNode(true);
    callBtn.parentNode.replaceChild(newCallBtn, callBtn);
    
    newCallBtn.addEventListener('click', function() {
        showNotification(`Iniciando chamada para ${profile.name}...`, 'info');
        setTimeout(() => {
            window.location.href = `tel:${profile.whatsapp}`;
        }, 1000);
    });
    
    // Open modal
    openModal(profileModal);
    
    // Scroll to top of modal content
    const profileContent = document.querySelector('.profile-content');
    if (profileContent) {
        profileContent.scrollTop = 0;
    }
    
    // Add escape key listener for this specific modal
    const handleProfileEscape = (e) => {
        if (e.key === 'Escape') {
            closeModal(profileModal);
            document.removeEventListener('keydown', handleProfileEscape);
        }
    };
    document.addEventListener('keydown', handleProfileEscape);
}

function openImageFullscreen(imageUrl, modelName) {
    // Create fullscreen image overlay
    const overlay = document.createElement('div');
    overlay.className = 'image-fullscreen-overlay';
    overlay.innerHTML = `
        <div class="fullscreen-content">
            <img src="${imageUrl}" alt="Foto de ${modelName}">
            <button class="fullscreen-close" aria-label="Fechar">&times;</button>
        </div>
    `;
    
    // Add styles
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 20000;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    const content = overlay.querySelector('.fullscreen-content');
    content.style.cssText = `
        position: relative;
        max-width: 90%;
        max-height: 90%;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const img = overlay.querySelector('img');
    img.style.cssText = `
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
        border-radius: 10px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    `;
    
    const closeBtn = overlay.querySelector('.fullscreen-close');
    closeBtn.style.cssText = `
        position: absolute;
        top: -50px;
        right: -50px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 2rem;
        cursor: pointer;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s ease;
    `;
    
    // Add to DOM
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';
    
    // Show with animation
    setTimeout(() => {
        overlay.style.opacity = '1';
    }, 10);
    
    // Close events
    const closeFullscreen = () => {
        overlay.style.opacity = '0';
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            document.body.style.overflow = 'auto';
        }, 300);
    };
    
    closeBtn.addEventListener('click', closeFullscreen);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            closeFullscreen();
        }
    });
    
    // Close with Escape key
    const handleEscape = (e) => {
        if (e.key === 'Escape') {
            closeFullscreen();
            document.removeEventListener('keydown', handleEscape);
        }
    };
    document.addEventListener('keydown', handleEscape);
}

function setupModalEvents() {
    // Login modal
    if (loginModal && loginClose) {
        loginClose.addEventListener('click', () => closeModal(loginModal));
        
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    }
    
    // Signup modal
    if (signupModal && signupClose) {
        signupClose.addEventListener('click', () => closeModal(signupModal));
        
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            signupForm.addEventListener('submit', handleSignup);
        }
    }

    // Support modal
    if (supportBtn) {
        supportBtn.addEventListener('click', () => openModal(supportModal));
    }
    if (supportClose) {
        supportClose.addEventListener('click', () => closeModal(supportModal));
    }

    // Privacy Policy Modal Events
    if (privacyLink && privacyModal) {
        privacyLink.addEventListener('click', (e) => {
            e.preventDefault();
            openModal(privacyModal);
        });
    }

    if (privacyClose) {
        privacyClose.addEventListener('click', () => {
            closeModal(privacyModal);
        });
    }

    // Success modal
    if (successClose) {
        successClose.addEventListener('click', () => closeModal(successModal));
    }
    if (successOk) {
        successOk.addEventListener('click', () => closeModal(successModal));
    }
    
    // Switch between login and signup
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal(signupModal);
            openModal(loginModal);
        });
    }
    

    // Close modals when clicking overlay
    [loginModal, signupModal, supportModal, successModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', function(e) {
                if (e.target === modal || e.target.classList.contains('modal-overlay')) {
                    closeModal(modal);
                }
            });
        }
    });
}

// Handler para login
async function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Mostrar loading
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                senha: formData.get('password')
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Login bem-sucedido
            authToken = data.token;
            currentUser = data.usuario;
            localStorage.setItem('authToken', authToken);
            
            closeModal(loginModal);
            updateAuthUI(true);
            showNotification('Login realizado com sucesso!', 'success');
            form.reset();
        } else {
            // Erro no login
            showNotification(data.error || 'Erro no login', 'error');
        }
    } catch (error) {
        console.error('Erro no login:', error);
        showNotification('Erro de conexão. Tente novamente.', 'error');
    } finally {
        // Esconder loading
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

// Handler para signup (registro)
async function handleSignup(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    // Validar campos obrigatórios
    const requiredFields = ['nome', 'email', 'telefone', 'data_nascimento', 'genero', 'cidade', 'provincia', 'disponibilidade'];
    for (const field of requiredFields) {
        if (!formData.get(field)) {
            showNotification(`Campo ${field} é obrigatório`, 'error');
            return;
        }
    }
    
    // Validar termos
    if (!formData.get('termos_aceitos')) {
        showNotification('Você deve aceitar os termos e condições', 'error');
        return;
    }
    
    // Mostrar loading
    btnText.style.display = 'none';
    btnLoader.style.display = 'block';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch('/api/inscricao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: formData.get('nome'),
                email: formData.get('email'),
                telefone: formData.get('telefone'),
                data_nascimento: formData.get('data_nascimento'),
                genero: formData.get('genero'),
                cidade: formData.get('cidade'),
                provincia: formData.get('provincia'),
                profissao: formData.get('profissao') || '',
                experiencia_anterior: formData.get('experiencia_anterior') === 'on',
                motivacao: formData.get('motivacao') || '',
                disponibilidade: formData.get('disponibilidade'),
                termos_aceitos: formData.get('termos_aceitos') === 'on',
                newsletter: formData.get('newsletter') === 'on'
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Inscrição bem-sucedida
            closeModal(signupModal);
            showNotification('Inscrição realizada com sucesso!', 'success');
            form.reset();
        } else {
            // Erro na inscrição
            showNotification(data.error || 'Erro na inscrição', 'error');
        }
    } catch (error) {
        console.error('Erro na inscrição:', error);
        showNotification('Erro de conexão. Tente novamente.', 'error');
    } finally {
        // Esconder loading
        btnText.style.display = 'block';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
    }
}

function setupNavigationEvents() {
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu) navMenu.classList.remove('active');
            if (navToggle) navToggle.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 100;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function setupFormEvents() {
    // Application form submission
    if (applicationForm) {
        applicationForm.addEventListener('submit', handleApplicationSubmit);
    }

    // Photo upload functionality
    if (photoInput) {
        photoInput.addEventListener('change', handlePhotoUpload);
        setupDragAndDrop();
    }
}

function setupKeyboardEvents() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllModals();
            closeMobileMenu();
            hideAllNotifications();
        }
    });
}

// Gallery Toggle Functionality
function toggleGallery() {
    if (!acompanhantesSection) return;
    
    galleryVisible = !galleryVisible;
    
    if (galleryVisible) {
        // Show gallery
        acompanhantesSection.classList.remove('hidden');
        toggleGalleryBtn.innerHTML = `
            Ocultar Galeria
            <div class="btn-shine"></div>
        `;
        
        // Smooth scroll to gallery after a short delay
        setTimeout(() => {
            acompanhantesSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
        
    } else {
        // Hide gallery
        acompanhantesSection.classList.add('hidden');
        toggleGalleryBtn.innerHTML = `
            Ver Nossas Acompanhantes
            <div class="btn-shine"></div>
        `;
        
        // Scroll back to the button
        toggleGalleryBtn.scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Modal Management
function openModal(modal) {
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus management for accessibility
        const firstInput = modal.querySelector('input, button');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function closeAllModals() {
    [loginModal, signupModal, supportModal, successModal, profileModal].forEach(modal => {
        if (modal) closeModal(modal);
    });
}

function closeMobileMenu() {
    if (navMenu) navMenu.classList.remove('active');
    if (navToggle) navToggle.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Application Form Management
function showApplicationForm() {
    const applicationSection = document.getElementById('application');
    if (applicationSection) {
        applicationSection.classList.remove('hidden');
        applicationSection.scrollIntoView({ behavior: 'smooth' });
    }
}

async function handleApplicationSubmit(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validate form
    if (!validateForm(applicationForm)) {
        showNotification('Por favor, corrija os erros no formulário.', 'error');
        return;
    }

    // Age validation
    const idade = parseInt(document.getElementById('idade').value);
    if (idade < 18 || idade > 65) {
        showNotification('A idade deve estar entre 18 e 65 anos.', 'error');
        return;
    }

    isSubmitting = true;
    showLoading(true);
    setSubmitButtonState(true);

    try {
        const formData = new FormData(applicationForm);
        formData.append('timestamp', new Date().toISOString());

        const response = await fetchWithRetry('/api/candidatura', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            handleSubmissionSuccess();
        } else {
            const result = await response.json();
            throw new Error(result.detalhe || result.error || 'Erro desconhecido');
        }
    } catch (error) {
        handleSubmissionError(error);
    } finally {
        isSubmitting = false;
        showLoading(false);
        setSubmitButtonState(false);
    }
}

function handleSubmissionSuccess() {
    showLoading(false);
    openModal(successModal);
    applicationForm.reset();
    resetPhotoPreview();
    clearFormAutoSave();
    clearFormErrors(applicationForm);
}

function handleSubmissionError(error) {
    showNotification('❌ Erro ao enviar: ' + error.message, 'error');
}

function setSubmitButtonState(loading) {
    const submitBtn = document.querySelector('.btn-submit');
    if (!submitBtn) return;
    
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
    }
}

// Photo Upload Management
function handlePhotoUpload(event) {
    const file = event.target.files[0];
    const fileUploadText = document.querySelector('.file-upload-text');
    
    if (file) {
        if (!validateFile(file)) {
            event.target.value = '';
            resetPhotoPreview();
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            showPhotoPreview(e.target.result);
        };
        reader.readAsDataURL(file);
    } else {
        resetPhotoPreview();
    }
}

function validateFile(file) {
    if (!file.type.startsWith('image/')) {
        showNotification('Por favor, selecione apenas arquivos de imagem.', 'error');
        return false;
    }

    if (file.size > 10 * 1024 * 1024) {
        showNotification('O arquivo deve ter no máximo 10MB.', 'error');
        return false;
    }

    return true;
}

function showPhotoPreview(src) {
    const fileUploadText = document.querySelector('.file-upload-text');
    
    if (fileUploadText) fileUploadText.style.display = 'none';
    if (photoPreview) {
        photoPreview.src = src;
        photoPreview.style.display = 'block';
        photoPreview.style.opacity = '0';
        photoPreview.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            photoPreview.style.transition = 'all 0.3s ease';
            photoPreview.style.opacity = '1';
            photoPreview.style.transform = 'scale(1)';
        }, 100);
    }
}

function resetPhotoPreview() {
    const fileUploadText = document.querySelector('.file-upload-text');
    
    if (fileUploadText) fileUploadText.style.display = 'flex';
    if (photoPreview) {
        photoPreview.style.display = 'none';
        photoPreview.src = '#';
    }
}

function setupDragAndDrop() {
    const fileUpload = document.querySelector('.file-upload');
    
    if (!fileUpload) return;

    ['dragover', 'dragenter'].forEach(eventName => {
        fileUpload.addEventListener(eventName, function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--primary-color)';
            this.style.background = 'rgba(201, 168, 118, 0.1)';
            this.style.transform = 'scale(1.02)';
        });
    });

    ['dragleave', 'dragend'].forEach(eventName => {
        fileUpload.addEventListener(eventName, function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--border-color)';
            this.style.background = 'rgba(255, 255, 255, 0.02)';
            this.style.transform = 'scale(1)';
        });
    });

    fileUpload.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--border-color)';
        this.style.background = 'rgba(255, 255, 255, 0.02)';
        this.style.transform = 'scale(1)';
        
        const files = e.dataTransfer.files;
        if (files.length > 0 && photoInput) {
            photoInput.files = files;
            photoInput.dispatchEvent(new Event('change'));
        }
    });
}

// Form Validation
function setupFormValidation() {
    const inputs = document.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField({ target: input })) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    clearFieldError(event);

    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Este campo é obrigatório.';
    } else if (value) {
        // Type-specific validation
        switch (field.type) {
            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Por favor, insira um email válido.';
                }
                break;
            
            case 'tel':
                const phoneRegex = /^[+]?[\d\s\-\(\)]{9,}$/;
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Por favor, insira um número de telefone válido.';
                }
                break;
            
            case 'number':
                if (field.name === 'idade') {
                    const age = parseInt(value);
                    if (age < 18) {
                        isValid = false;
                        errorMessage = 'A idade mínima é 18 anos.';
                    } else if (age > 65) {
                        isValid = false;
                        errorMessage = 'A idade máxima é 65 anos.';
                    }
                }
                break;
            
            case 'text':
                if (field.name === 'nome' && value.length < 2) {
                    isValid = false;
                    errorMessage = 'O nome deve ter pelo menos 2 caracteres.';
                }
                if (field.name === 'cidade' && value.length < 2) {
                    isValid = false;
                    errorMessage = 'A cidade deve ter pelo menos 2 caracteres.';
                }
                break;
            
            case 'date':
                if (field.name === 'data_nascimento') {
                    const birthDate = new Date(value);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    
                    if (age < 18) {
                        isValid = false;
                        errorMessage = 'É necessário ter pelo menos 18 anos.';
                    } else if (age > 80) {
                        isValid = false;
                        errorMessage = 'Idade máxima permitida é 80 anos.';
                    }
                }
                break;
        }

        // Textarea validation
        if (field.tagName === 'TEXTAREA' && field.hasAttribute('required')) {
            if (value.length < 10) {
                isValid = false;
                errorMessage = 'Por favor, forneça uma descrição mais detalhada (mínimo 10 caracteres).';
            }
        }
        
        // Select validation
        if (field.tagName === 'SELECT' && field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Por favor, selecione uma opção.';
        }
    }

    // File validation
    if (field.type === 'file' && field.hasAttribute('required') && field.files.length === 0) {
        isValid = false;
        errorMessage = 'Por favor, selecione uma foto.';
    }

    // Checkbox validation
    if (field.type === 'checkbox' && field.hasAttribute('required') && !field.checked) {
        if (field.name === 'termos_aceitos') {
            isValid = false;
            errorMessage = 'Deve concordar com os termos e condições.';
        }
    }
    

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    const errorElement = document.getElementById(field.name + '-error') || 
                        field.parentNode.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
    }
}

function clearFieldError(event) {
    const field = event.target;
    field.classList.remove('error');
    
    const errorElement = document.getElementById(field.name + '-error') || 
                        field.parentNode.querySelector('.error-message');
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.classList.remove('show');
    }
}

function clearFormErrors(form) {
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.classList.remove('error');
        const errorElement = document.getElementById(input.name + '-error') || 
                            input.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('show');
        }
    });
}

// Scroll Effects
function setupScrollEffects() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', debounce(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Navbar scroll effect
        if (navbar) {
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // Hide/show navbar on scroll
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
        }
        
        // Scroll to top button
        const scrollTopBtn = document.querySelector('.scroll-top-btn');
        if (scrollTopBtn) {
            if (scrollTop > 500) {
                scrollTopBtn.classList.add('show');
            } else {
                scrollTopBtn.classList.remove('show');
            }
        }
        
        lastScrollTop = scrollTop;
    }, 10));
}

// Intersection Observer for animations
function setupIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('loaded');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.value-item, .service-card, .benefit-card, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(el);
    });
}

// Form Auto-save
function setupFormAutoSave() {
    const formFields = document.querySelectorAll('#application-form input, #application-form select, #application-form textarea');
    
    formFields.forEach(field => {
        // Load saved data
        const savedValue = localStorage.getItem(`galeria_secreta_form_${field.name}`);
        if (savedValue && field.type !== 'file' && field.type !== 'checkbox') {
            field.value = savedValue;
        }
        
        // Save data on change
        field.addEventListener('input', debounce(function() {
            if (this.type !== 'file' && this.type !== 'checkbox') {
                localStorage.setItem(`galeria_secreta_form_${this.name}`, this.value);
            }
        }, 500));
    });
}

function clearFormAutoSave() {
    const formFields = document.querySelectorAll('#application-form input, #application-form select, #application-form textarea');
    formFields.forEach(field => {
        localStorage.removeItem(`galeria_secreta_form_${field.name}`);
    });
}

// Scroll to Top Button
function createScrollToTopButton() {
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.setAttribute('aria-label', 'Voltar ao topo');
    
    document.body.appendChild(scrollTopBtn);
    
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Loading Management
function showLoading(show) {
    if (loadingOverlay) {
        if (show) {
            loadingOverlay.classList.remove('hidden');
        } else {
            loadingOverlay.classList.add('hidden');
        }
    }
}

// Notification System
function showNotification(message, type = 'info') {
    hideAllNotifications();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Fechar notificação">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    // Close functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        hideNotification(notification);
    });

    // Auto hide after 6 seconds
    setTimeout(() => {
        hideNotification(notification);
    }, 6000);
}

function hideNotification(notification) {
    if (notification && notification.parentNode) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 400);
    }
}

function hideAllNotifications() {
    document.querySelectorAll('.notification').forEach(notification => {
        hideNotification(notification);
    });
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

async function fetchWithRetry(url, options, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url, options);
            return response;
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
        }
    }
}

function preloadCriticalResources() {
    const criticalImages = [
        'https://images.pexels.com/photos/1722198/pexels-photo-1722198.jpeg'
    ];
    
    criticalImages.forEach(url => {
        const img = new Image();
        img.src = url;
    });
}

// Performance Monitoring
function initPerformanceMonitoring() {
    window.addEventListener('load', () => {
        const loadTime = performance.now();
        console.log(`Galeria Secreta loaded in ${loadTime.toFixed(2)}ms`);
    });
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('Galeria Secreta Error:', e.error);
    showNotification('Ocorreu um erro inesperado. Por favor, recarregue a página.', 'error');
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(error => {
        console.log('Service Worker registration failed:', error);
    });
}

// Initialize performance monitoring
initPerformanceMonitoring();
