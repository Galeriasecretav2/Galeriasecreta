// Configuração global
const API_BASE_URL = '';

// Utilitários
const showLoading = (show = true) => {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.toggle('hidden', !show);
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
    setTimeout(() => notification.remove(), 300);
  }, 5000);
};

// Dados das acompanhantes
const acompanhantesData = {
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
    services: ['Acompanhamento em eventos', 'Jantares executivos', 'Viagens de negócios', 'Campanhas fotográficas'],
    specialties: ['Etiqueta Social', 'Línguas Estrangeiras', 'Protocolo Empresarial', 'Arte & Cultura'],
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
    bio: 'Isabella combina experiência e charme natural. Especialista em eventos sociais de alto nível e acompanhamento executivo.',
    services: ['Eventos sociais', 'Acompanhamento executivo', 'Viagens internacionais', 'Consultoria de imagem'],
    specialties: ['Networking', 'Comunicação', 'Moda & Estilo', 'Gastronomia'],
    availability: 'Seg-Dom 8h-24h'
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
    bio: 'Valentina é sinônimo de elegância premium. Especializada em eventos exclusivos e acompanhamento VIP.',
    services: ['Eventos VIP', 'Acompanhamento premium', 'Consultoria executiva', 'Relações públicas'],
    specialties: ['Luxo & Sofisticação', 'Diplomacia', 'Arte Contemporânea', 'Vinhos & Gastronomia'],
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
    bio: 'Adriana representa a nova geração de modelos exclusivas. Jovem, dinâmica e com presença marcante.',
    services: ['Modelagem exclusiva', 'Eventos fashion', 'Campanhas digitais', 'Acompanhamento jovem'],
    specialties: ['Moda Jovem', 'Redes Sociais', 'Tendências', 'Lifestyle'],
    availability: 'Ter-Sáb 10h-22h'
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
    bio: 'Camila é uma modelo VIP com experiência internacional. Perfeita para eventos corporativos e sociais de alto padrão.',
    services: ['Eventos corporativos', 'Acompanhamento VIP', 'Viagens executivas', 'Representação empresarial'],
    specialties: ['Protocolo Internacional', 'Negócios', 'Idiomas', 'Cultura Empresarial'],
    availability: '24/7 VIP'
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
    bio: 'Beatriz representa o mais alto nível de sofisticação. Modelo elite com experiência em eventos internacionais.',
    services: ['Eventos elite', 'Acompanhamento diplomático', 'Consultoria de alto nível', 'Representação internacional'],
    specialties: ['Diplomacia', 'Alta Sociedade', 'Protocolo Elite', 'Cultura Internacional'],
    availability: 'Exclusivo sob consulta'
  }
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeModals();
  initializeForms();
  initializeButtons();
  initializeScrollEffects();
});

// Navegação
function initializeNavigation() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Scroll effect na navbar
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Toggle menu mobile
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
  }

  // Smooth scroll para links de navegação
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }

      // Fechar menu mobile após clique
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      }
    });
  });
}

// Modais
function initializeModals() {
  // Login Modal
  const loginBtn = document.getElementById('login-btn');
  const loginModal = document.getElementById('login-modal');
  const loginClose = document.getElementById('login-close');

  if (loginBtn && loginModal) {
    loginBtn.addEventListener('click', () => openModal(loginModal));
  }
  if (loginClose) {
    loginClose.addEventListener('click', () => closeModal(loginModal));
  }

  // Signup Modal
  const signupBtn = document.getElementById('signup-btn');
  const signupModal = document.getElementById('signup-modal');
  const signupClose = document.getElementById('signup-close');

  if (signupBtn && signupModal) {
    signupBtn.addEventListener('click', () => openModal(signupModal));
  }
  if (signupClose) {
    signupClose.addEventListener('click', () => closeModal(signupModal));
  }

  // Support Modal
  const supportBtn = document.getElementById('support-btn');
  const supportModal = document.getElementById('support-modal');
  const supportClose = document.getElementById('support-close');

  if (supportBtn && supportModal) {
    supportBtn.addEventListener('click', () => openModal(supportModal));
  }
  if (supportClose) {
    supportClose.addEventListener('click', () => closeModal(supportModal));
  }

  // Profile Modal
  const profileModal = document.getElementById('profile-modal');
  const profileClose = document.getElementById('profile-close');
  
  if (profileClose) {
    profileClose.addEventListener('click', () => closeModal(profileModal));
  }

  // Success Modal
  const successModal = document.getElementById('success-modal');
  const successClose = document.getElementById('success-close');
  const successOk = document.getElementById('success-ok');

  if (successClose) {
    successClose.addEventListener('click', () => closeModal(successModal));
  }
  if (successOk) {
    successOk.addEventListener('click', () => closeModal(successModal));
  }

  // Privacy Modal
  const privacyModal = document.getElementById('privacy-modal');
  const privacyClose = document.getElementById('privacy-close');
  const privacyLink = document.querySelector('.privacy-link');

  if (privacyLink && privacyModal) {
    privacyLink.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(privacyModal);
    });
  }
  if (privacyClose) {
    privacyClose.addEventListener('click', () => closeModal(privacyModal));
  }

  // Forgot Password Modal
  const forgotPasswordModal = document.getElementById('forgot-password-modal');
  const forgotPasswordClose = document.getElementById('forgot-password-close');
  const forgotPasswordLink = document.querySelector('.forgot-password');

  if (forgotPasswordLink && forgotPasswordModal) {
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(loginModal);
      openModal(forgotPasswordModal);
    });
  }
  if (forgotPasswordClose) {
    forgotPasswordClose.addEventListener('click', () => closeModal(forgotPasswordModal));
  }

  // Verify Code Modal
  const verifyCodeModal = document.getElementById('verify-code-modal');
  const verifyCodeClose = document.getElementById('verify-code-close');

  if (verifyCodeClose) {
    verifyCodeClose.addEventListener('click', () => closeModal(verifyCodeModal));
  }

  // Reset Password Modal
  const resetPasswordModal = document.getElementById('reset-password-modal');
  const resetPasswordClose = document.getElementById('reset-password-close');

  if (resetPasswordClose) {
    resetPasswordClose.addEventListener('click', () => closeModal(resetPasswordModal));
  }

  // Back to login link
  const backToLogin = document.getElementById('back-to-login');
  if (backToLogin) {
    backToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(forgotPasswordModal);
      openModal(loginModal);
    });
  }

  // Back to forgot password link
  const backToForgot = document.getElementById('back-to-forgot');
  if (backToForgot) {
    backToForgot.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(verifyCodeModal);
      openModal(forgotPasswordModal);
    });
  }

  // Resend code link
  const resendCode = document.getElementById('resend-code');
  if (resendCode) {
    resendCode.addEventListener('click', (e) => {
      e.preventDefault();
      handleResendCode();
    });
  }

  // Switch between login and signup
  const switchToLogin = document.getElementById('switch-to-login');
  if (switchToLogin) {
    switchToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal(signupModal);
      openModal(loginModal);
    });
  }

  // Fechar modal clicando no overlay
  document.querySelectorAll('.modal').forEach(modal => {
    const overlay = modal.querySelector('.modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', () => closeModal(modal));
    }
  });
}

function openModal(modal) {
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    
    // Focus no primeiro input se existir
    const firstInput = modal.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }
}

function closeModal(modal) {
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
    
    // Limpar formulários
    const forms = modal.querySelectorAll('form');
    forms.forEach(form => {
      form.reset();
      clearFormErrors(form);
    });
  }
}

// Formulários
function initializeForms() {
  // Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Signup Form
  const signupForm = document.getElementById('signup-form');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // Application Form
  const applicationForm = document.getElementById('application-form');
  if (applicationForm) {
    applicationForm.addEventListener('submit', handleApplication);
    
    // Preview da foto
    const fotoInput = document.getElementById('foto');
    const photoPreview = document.getElementById('photo-preview');
    const fileUploadText = fotoInput?.parentElement.querySelector('.file-upload-text');
    
    if (fotoInput && photoPreview) {
      fotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            photoPreview.src = e.target.result;
            photoPreview.style.display = 'block';
            if (fileUploadText) {
              fileUploadText.style.display = 'none';
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  // Forgot Password Form
  const forgotPasswordForm = document.getElementById('forgot-password-form');
  if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', handleForgotPassword);
  }

  // Verify Code Form
  const verifyCodeForm = document.getElementById('verify-code-form');
  if (verifyCodeForm) {
    verifyCodeForm.addEventListener('submit', handleVerifyCode);
    
    // Auto-format code input
    const codeInput = document.getElementById('reset-code');
    if (codeInput) {
      codeInput.addEventListener('input', (e) => {
        // Remove non-numeric characters
        e.target.value = e.target.value.replace(/\D/g, '');
        
        // Limit to 6 digits
        if (e.target.value.length > 6) {
          e.target.value = e.target.value.slice(0, 6);
        }
      });
      
      codeInput.addEventListener('paste', (e) => {
        e.preventDefault();
        const paste = (e.clipboardData || window.clipboardData).getData('text');
        const numericPaste = paste.replace(/\D/g, '').slice(0, 6);
        e.target.value = numericPaste;
      });
    }
  }

  // Reset Password Form
  const resetPasswordForm = document.getElementById('reset-password-form');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', handleResetPassword);
  }

  // Verificar se há token de reset na URL (sistema antigo)
  checkResetToken();
}

// Handlers dos formulários
async function handleLogin(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Limpar erros anteriores
  clearFormErrors(form);
  
  // Validação
  const email = formData.get('email');
  const password = formData.get('password');
  
  if (!email || !password) {
    showFormError(form, 'email', 'Email é obrigatório');
    showFormError(form, 'password', 'Palavra-passe é obrigatória');
    return;
  }
  
  // Loading state
  setButtonLoading(submitBtn, true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        senha: password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNotification('Login realizado com sucesso!', 'success');
      
      // Salvar token se fornecido
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }
      
      // Fechar modal
      const modal = document.getElementById('login-modal');
      closeModal(modal);
      
      // Atualizar interface se necessário
      updateUserInterface(data.usuario);
      
    } else {
      showNotification(data.error || 'Erro no login', 'error');
    }
    
  } catch (error) {
    console.error('Erro no login:', error);
    showNotification('Erro de conexão. Tente novamente.', 'error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

async function handleSignup(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Limpar erros anteriores
  clearFormErrors(form);
  
  // Validação
  const nome = formData.get('nome')?.trim();
  const email = formData.get('email')?.trim();
  const password = formData.get('password');
  const confirmPassword = formData.get('confirmPassword');
  
  let hasErrors = false;
  
  if (!nome || nome.length < 2) {
    showFormError(form, 'nome', 'Nome deve ter pelo menos 2 caracteres');
    hasErrors = true;
  }
  
  if (!email || !isValidEmail(email)) {
    showFormError(form, 'email', 'Email inválido');
    hasErrors = true;
  }
  
  if (!password || password.length < 6) {
    showFormError(form, 'password', 'Palavra-passe deve ter pelo menos 6 caracteres');
    hasErrors = true;
  }
  
  if (password !== confirmPassword) {
    showFormError(form, 'confirmPassword', 'Palavras-passe não coincidem');
    hasErrors = true;
  }
  
  if (hasErrors) return;
  
  // Loading state
  setButtonLoading(submitBtn, true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/inscricao`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nome,
        email,
        password
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNotification('Inscrição realizada com sucesso!', 'success');
      
      // Fechar modal
      const modal = document.getElementById('signup-modal');
      closeModal(modal);
      
    } else {
      if (response.status === 409) {
        showFormError(form, 'email', 'Este email já está registrado');
      } else {
        showNotification(data.error || 'Erro na inscrição', 'error');
      }
    }
    
  } catch (error) {
    console.error('Erro na inscrição:', error);
    showNotification('Erro de conexão. Tente novamente.', 'error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

async function handleForgotPassword(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Limpar erros anteriores
  clearFormErrors(form);
  
  // Validação
  const email = formData.get('email')?.trim();
  
  if (!email || !isValidEmail(email)) {
    showFormError(form, 'email', 'Email inválido');
    return;
  }
  
  // Loading state
  setButtonLoading(submitBtn, true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNotification('Código enviado! Verifique seu email.', 'success');
      
      // Fechar modal de forgot password e abrir modal de verificação
      const modal = document.getElementById('forgot-password-modal');
      closeModal(modal);
      
      // Abrir modal de verificação de código
      const verifyModal = document.getElementById('verify-code-modal');
      const emailDisplay = document.getElementById('verify-code-email');
      if (emailDisplay) {
        emailDisplay.textContent = email;
      }
      
      // Iniciar countdown
      startCodeCountdown();
      
      // Salvar email para uso posterior
      window.resetEmail = email;
      
      openModal(verifyModal);
      
    } else {
      showNotification(data.error || 'Erro ao enviar código', 'error');
    }
    
  } catch (error) {
    console.error('Erro no forgot password:', error);
    showNotification('Erro de conexão. Tente novamente.', 'error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// Handler para verificar código
async function handleVerifyCode(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Limpar erros anteriores
  clearFormErrors(form);
  
  // Validação
  const codigo = formData.get('codigo')?.trim();
  const email = window.resetEmail;
  
  if (!codigo || codigo.length !== 6) {
    showFormError(form, 'codigo', 'Código deve ter 6 dígitos');
    return;
  }
  
  if (!email) {
    showNotification('Erro: Email não encontrado. Tente novamente.', 'error');
    return;
  }
  
  // Loading state
  setButtonLoading(submitBtn, true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify-reset-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, codigo })
    });
    
    const data = await response.json();
    
    if (response.ok && data.valid) {
      showNotification('Código verificado com sucesso!', 'success');
      
      // Fechar modal de verificação
      const verifyModal = document.getElementById('verify-code-modal');
      closeModal(verifyModal);
      
      // Abrir modal de redefinição de senha
      const resetModal = document.getElementById('reset-password-modal');
      const userEmailElement = document.getElementById('reset-user-email');
      
      if (userEmailElement) {
        userEmailElement.textContent = email;
      }
      
      // Salvar código para uso na redefinição
      window.resetCode = codigo;
      
      openModal(resetModal);
      
    } else {
      // Incrementar tentativas no servidor
      await fetch(`${API_BASE_URL}/api/increment-code-attempts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, codigo })
      });
      
      showFormError(form, 'codigo', data.error || 'Código inválido');
    }
    
  } catch (error) {
    console.error('Erro na verificação do código:', error);
    showNotification('Erro de conexão. Tente novamente.', 'error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// Handler para reenviar código
async function handleResendCode() {
  const email = window.resetEmail;
  
  if (!email) {
    showNotification('Erro: Email não encontrado.', 'error');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNotification('Novo código enviado!', 'success');
      
      // Reiniciar countdown
      startCodeCountdown();
      
      // Limpar campo de código
      const codeInput = document.getElementById('reset-code');
      if (codeInput) {
        codeInput.value = '';
      }
      
    } else {
      showNotification(data.error || 'Erro ao reenviar código', 'error');
    }
    
  } catch (error) {
    console.error('Erro ao reenviar código:', error);
    showNotification('Erro de conexão. Tente novamente.', 'error');
  }
}

// Função para iniciar countdown do código
function startCodeCountdown() {
  const countdownElement = document.getElementById('code-countdown');
  if (!countdownElement) return;
  
  let timeLeft = 15 * 60; // 15 minutos em segundos
  
  // Limpar countdown anterior se existir
  if (window.countdownInterval) {
    clearInterval(window.countdownInterval);
  }
  
  window.countdownInterval = setInterval(() => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    countdownElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    if (timeLeft <= 0) {
      clearInterval(window.countdownInterval);
      countdownElement.textContent = 'Expirado';
      countdownElement.style.color = '#dc3545';
    }
    
    timeLeft--;
  }, 1000);
}

async function handleResetPassword(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Limpar erros anteriores
  clearFormErrors(form);
  
  // Validação
  const novaSenha = formData.get('novaSenha');
  const confirmarSenha = formData.get('confirmarSenha');
  const email = window.resetEmail;
  const codigo = window.resetCode;
  
  let hasErrors = false;
  
  if (!novaSenha || novaSenha.length < 6) {
    showFormError(form, 'novaSenha', 'Nova senha deve ter pelo menos 6 caracteres');
    hasErrors = true;
  }
  
  if (novaSenha !== confirmarSenha) {
    showFormError(form, 'confirmarSenha', 'Senhas não coincidem');
    hasErrors = true;
  }
  
  if (!email || !codigo) {
    showNotification('Erro: Dados de verificação não encontrados. Tente novamente.', 'error');
    return;
  }
  
  if (hasErrors) return;
  
  // Loading state
  setButtonLoading(submitBtn, true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/reset-password-with-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        codigo,
        novaSenha
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      showNotification('Senha redefinida com sucesso!', 'success');
      
      // Fechar modal e limpar dados temporários
      const modal = document.getElementById('reset-password-modal');
      closeModal(modal);
      
      // Limpar dados temporários
      window.resetEmail = null;
      window.resetCode = null;
      
      // Limpar countdown
      if (window.countdownInterval) {
        clearInterval(window.countdownInterval);
      }
      
      // Abrir modal de login após um tempo
      setTimeout(() => {
        const loginModal = document.getElementById('login-modal');
        openModal(loginModal);
      }, 2000);
      
    } else {
      showNotification(data.error || 'Erro ao redefinir senha', 'error');
    }
    
  } catch (error) {
    console.error('Erro no reset password:', error);
    showNotification('Erro de conexão. Tente novamente.', 'error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// Verificar token de reset na URL
async function checkResetToken() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // Sistema antigo - mostrar aviso de atualização
    showNotification('Sistema atualizado! Use o novo sistema de código de 6 dígitos.', 'info');
    window.history.replaceState({}, document.title, window.location.pathname);
    return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/verify-reset-token/${token}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        // Token válido - mostrar modal de reset
        const resetModal = document.getElementById('reset-password-modal');
        const userEmailElement = document.getElementById('reset-user-email');
        
        if (userEmailElement) {
          userEmailElement.textContent = data.usuario.email;
        }
        
        openModal(resetModal);
      } else {
        // Token inválido
        showNotification('Link de redefinição inválido ou expirado.', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (error) {
      console.error('Erro ao verificar token:', error);
      showNotification('Erro ao verificar link de redefinição.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }
}

async function handleApplication(e) {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  
  // Limpar erros anteriores
  clearFormErrors(form);
  
  // Validação
  const nome = formData.get('nome')?.trim();
  const idade = formData.get('idade');
  const provincia = formData.get('provincia');
  const email = formData.get('email')?.trim();
  const whatsapp = formData.get('whatsapp')?.trim();
  const foto = formData.get('foto');
  const termos = formData.get('termos');
  
  let hasErrors = false;
  
  if (!nome || nome.length < 2) {
    showFormError(form, 'nome', 'Nome é obrigatório');
    hasErrors = true;
  }
  
  if (!idade || idade < 18 || idade > 65) {
    showFormError(form, 'idade', 'Idade deve estar entre 18 e 65 anos');
    hasErrors = true;
  }
  
  if (!provincia) {
    showFormError(form, 'provincia', 'Selecione uma província');
    hasErrors = true;
  }
  
  if (!email || !isValidEmail(email)) {
    showFormError(form, 'email', 'Email inválido');
    hasErrors = true;
  }
  
  if (!whatsapp) {
    showFormError(form, 'whatsapp', 'WhatsApp é obrigatório');
    hasErrors = true;
  }
  
  if (!foto || foto.size === 0) {
    showFormError(form, 'foto', 'Foto é obrigatória');
    hasErrors = true;
  }
  
  if (!termos) {
    showFormError(form, 'termos', 'Deve aceitar os termos e condições');
    hasErrors = true;
  }
  
  if (hasErrors) return;
  
  // Loading state
  setButtonLoading(submitBtn, true);
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/candidatura`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Mostrar modal de sucesso
      const successModal = document.getElementById('success-modal');
      openModal(successModal);
      
      // Esconder seção de candidatura
      const applicationSection = document.getElementById('application');
      if (applicationSection) {
        applicationSection.classList.add('hidden');
      }
      
    } else {
      showNotification(data.error || 'Erro ao enviar candidatura', 'error');
    }
    
  } catch (error) {
    console.error('Erro na candidatura:', error);
    showNotification('Erro de conexão. Tente novamente.', 'error');
  } finally {
    setButtonLoading(submitBtn, false);
  }
}

// Botões principais
function initializeButtons() {
  // Botão "Quero Fazer Parte"
  const joinBtn = document.getElementById('join-btn');
  if (joinBtn) {
    joinBtn.addEventListener('click', () => {
      const applicationSection = document.getElementById('application');
      if (applicationSection) {
        applicationSection.classList.remove('hidden');
        applicationSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Botão "Ver Nossas Acompanhantes"
  const toggleGalleryBtn = document.getElementById('toggle-gallery-btn');
  if (toggleGalleryBtn) {
    toggleGalleryBtn.addEventListener('click', () => {
      const acompanhantesSection = document.getElementById('acompanhantes');
      if (acompanhantesSection) {
        const isHidden = acompanhantesSection.classList.contains('hidden');
        
        if (isHidden) {
          acompanhantesSection.classList.remove('hidden');
          toggleGalleryBtn.innerHTML = `
            Ocultar Acompanhantes
            <div class="btn-shine"></div>
          `;
          acompanhantesSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          acompanhantesSection.classList.add('hidden');
          toggleGalleryBtn.innerHTML = `
            Ver Nossas Acompanhantes
            <div class="btn-shine"></div>
          `;
        }
      }
    });
  }

  // Botões "Ver Perfil" das acompanhantes
  const viewProfileBtns = document.querySelectorAll('.btn-view-profile');
  viewProfileBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const profileName = btn.getAttribute('data-profile');
      if (profileName && acompanhantesData[profileName]) {
        showProfile(acompanhantesData[profileName]);
      }
    });
  });

  // Botão "Entre em Contacto" na seção de acompanhantes
  const contactAcompanhantesBtn = document.getElementById('contact-acompanhantes');
  if (contactAcompanhantesBtn) {
    contactAcompanhantesBtn.addEventListener('click', () => {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }

  // Botão "Voltar ao Topo"
  const scrollToTopBtn = document.getElementById('scroll-to-top');
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      // Scroll suave para o topo da página
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Alternativa: scroll para a seção hero
      // const heroSection = document.getElementById('home');
      // if (heroSection) {
      //   heroSection.scrollIntoView({ behavior: 'smooth' });
      // }
    });
  }

  // Botões de contacto no perfil
  document.addEventListener('click', (e) => {
    if (e.target.id === 'profile-call') {
      window.open('tel:+258851551556', '_self');
    }
  });
}

// Mostrar perfil da acompanhante
function showProfile(profileData) {
  const modal = document.getElementById('profile-modal');
  if (!modal) return;

  // Preencher dados básicos
  document.getElementById('profile-name').textContent = profileData.name;
  document.getElementById('profile-category').textContent = profileData.category;
  document.getElementById('profile-age').textContent = profileData.age;
  document.getElementById('profile-location').textContent = profileData.location;
  document.getElementById('profile-main-img').src = profileData.mainImage;
  document.getElementById('profile-bio').textContent = profileData.bio;
  document.getElementById('profile-availability').textContent = profileData.availability;

  // Preencher galeria
  const gallery = document.getElementById('profile-gallery');
  gallery.innerHTML = '';
  profileData.gallery.forEach(imageUrl => {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Foto da galeria';
    img.className = 'gallery-image';
    gallery.appendChild(img);
  });

  // Preencher serviços
  const services = document.getElementById('profile-services');
  services.innerHTML = '';
  profileData.services.forEach(service => {
    const serviceItem = document.createElement('div');
    serviceItem.className = 'service-item';
    serviceItem.innerHTML = `<span class="service-icon">✨</span> ${service}`;
    services.appendChild(serviceItem);
  });

  // Preencher especialidades
  const specialties = document.getElementById('profile-specialties');
  specialties.innerHTML = '';
  profileData.specialties.forEach(specialty => {
    const tag = document.createElement('span');
    tag.className = 'specialty-tag';
    tag.textContent = specialty;
    specialties.appendChild(tag);
  });

  // Atualizar link do WhatsApp
  const whatsappBtn = document.getElementById('profile-whatsapp');
  if (whatsappBtn) {
    whatsappBtn.href = `https://wa.me/258851551556?text=Olá!%20Tenho%20interesse%20em%20conhecer%20${profileData.name}%20da%20Galeria%20Secreta`;
  }

  // Mostrar modal
  openModal(modal);
}

// Efeitos de scroll
function initializeScrollEffects() {
  // Animação de elementos ao entrar na viewport
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

  // Observar elementos animáveis
  const animatableElements = document.querySelectorAll(
    '.service-card, .benefit-card, .acompanhante-card, .value-item, .contact-item'
  );
  
  animatableElements.forEach(el => {
    observer.observe(el);
  });

  // Parallax suave no hero
  window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroBackground = document.querySelector('.hero-background');
    
    if (heroBackground) {
      heroBackground.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
  });
}

// Utilitários para formulários
function clearFormErrors(form) {
  const errorMessages = form.querySelectorAll('.error-message');
  errorMessages.forEach(error => {
    error.textContent = '';
    error.style.display = 'none';
  });
  
  const errorInputs = form.querySelectorAll('.error');
  errorInputs.forEach(input => {
    input.classList.remove('error');
  });
}

function showFormError(form, fieldName, message) {
  const field = form.querySelector(`[name="${fieldName}"]`);
  const errorElement = form.querySelector(`#${fieldName.replace(/([A-Z])/g, '-$1').toLowerCase()}-error`) || 
                      form.querySelector(`#${fieldName}-error`);
  
  if (field) {
    field.classList.add('error');
  }
  
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = 'block';
  }
}

function setButtonLoading(button, loading) {
  if (!button) return;
  
  const btnText = button.querySelector('.btn-text');
  const btnLoader = button.querySelector('.btn-loader');
  
  if (loading) {
    button.disabled = true;
    if (btnText) btnText.style.opacity = '0';
    if (btnLoader) btnLoader.style.display = 'block';
  } else {
    button.disabled = false;
    if (btnText) btnText.style.opacity = '1';
    if (btnLoader) btnLoader.style.display = 'none';
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function updateUserInterface(usuario) {
  // Atualizar interface baseado no usuário logado
  console.log('Usuário logado:', usuario);
  
  // Aqui você pode adicionar lógica para mostrar/esconder elementos
  // baseado no tipo de usuário (admin, modelo, cliente)
}

// Tratamento de erros globais
window.addEventListener('error', (e) => {
  console.error('Erro global:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Promise rejeitada:', e.reason);
});