// AI Chat System for Galeria Secreta
class AIChat {
  constructor() {
    this.isOpen = false;
    this.messages = [];
    this.isTyping = false;
    
    // Knowledge base sobre a Galeria Secreta
    this.knowledgeBase = {
      candidatura: {
        keywords: ['candidatar', 'candidatura', 'aplicar', 'inscrever', 'como entrar', 'processo'],
        response: `Para se candidatar à Galeria Secreta, siga estes passos:

1. **Preencha o formulário** na seção "Candidatura" do site
2. **Envie uma foto profissional** nítida e de boa qualidade
3. **Aguarde nossa análise** - entraremos em contacto em até 48h

O processo inclui:
• Pré-entrevista (chat)
• Entrevista presencial
• Teste prático
• Sessão fotográfica
• Criação do perfil
• Aceitação na associação

Quer começar agora? Clique em "Quero Fazer Parte" na página principal!`
      },
      
      requisitos: {
        keywords: ['requisitos', 'critérios', 'condições', 'exigências', 'preciso ter'],
        response: `**Requisitos para fazer parte da Galeria Secreta:**

✅ **Obrigatórios:**
• 18 anos ou mais
• Residir em Moçambique
• Educada, discreta e disciplinada
• Extrovertida e aberta a novas experiências
• Higiene impecável
• Decisão consciente e voluntária

💡 **Diferenciais:**
• Experiência em modelagem (não obrigatório)
• Conhecimento de idiomas
• Disponibilidade flexível

Lembre-se: somos contra a exploração sexual. Aqui, o poder está nas suas mãos!`
      },
      
      ganhos: {
        keywords: ['ganhar', 'ganhos', 'salário', 'remuneração', 'quanto', 'dinheiro', 'pagamento'],
        response: `**Estrutura de Ganhos na Galeria Secreta:**

💰 **Você define seu valor** - O pagamento é 100% seu!

📊 **Faixas orientativas:**
• **Iniciante**: 1.500 - 4.000 MT
• **Experiente**: 4.000 - 7.000 MT  
• **Profissional**: acima de 8.000 MT

🎯 **Vantagens:**
• Pagamentos pontuais
• Sem taxas ou comissões
• Ajudamos no posicionamento ideal
• Mentoria para maximizar ganhos

Importante: Não cobramos taxas! Todo o valor é seu.`
      },
      
      beneficios: {
        keywords: ['benefícios', 'vantagens', 'oferece', 'inclui', 'o que ganho'],
        response: `**Benefícios Exclusivos da Galeria Secreta:**

🏆 **Desenvolvimento:**
• Mentoria personalizada
• Workshops de etiqueta e postura
• Curso de inglês com certificado
• Networking profissional

👗 **Recursos:**
• Acesso ao closet exclusivo
• Sessões fotográficas profissionais
• Suporte de imagem e marketing

🛡️ **Segurança:**
• Ambiente respeitoso e profissional
• Suporte 24/7
• Comunidade de apoio
• Discrição total

💼 **Carreira:**
• Gestão de carreira especializada
• Oportunidades exclusivas
• Crescimento profissional contínuo`
      },
      
      seguranca: {
        keywords: ['segurança', 'proteção', 'seguro', 'riscos', 'cuidados'],
        response: `**Segurança na Galeria Secreta:**

🛡️ **Nossa Prioridade:**
• Ambiente 100% respeitoso e profissional
• Verificação rigorosa de todos os clientes
• Suporte 24/7 disponível
• Protocolos de segurança estabelecidos

🔒 **Medidas de Proteção:**
• Discrição total garantida
• Dados pessoais protegidos
• Comunicação segura
• Backup de emergência sempre disponível

⚖️ **Princípios:**
• Somos contra qualquer forma de exploração
• Decisões sempre voluntárias
• Respeito mútuo obrigatório
• Liberdade de escolha total

Sua segurança e bem-estar são nossa prioridade máxima!`
      },
      
      contato: {
        keywords: ['contacto', 'contato', 'telefone', 'email', 'falar', 'conversar'],
        response: `**Entre em Contacto Connosco:**

📞 **Telefone/WhatsApp:**
+258 851551556

✉️ **Email:**
galeriasecretamz@gmail.com

🕐 **Horário de Atendimento:**
Segunda a Sexta: 9h às 18h
Fins de semana: Emergências apenas

💬 **Resposta Rápida:**
WhatsApp é o canal mais rápido para contacto direto!

Estamos aqui para esclarecer todas as suas dúvidas. Não hesite em entrar em contacto!`
      },
      
      sobre: {
        keywords: ['sobre', 'quem são', 'empresa', 'história', 'galeria secreta'],
        response: `**Sobre a Galeria Secreta:**

👑 **Quem Somos:**
Há mais de 3 anos no mercado, somos referência em acompanhantes de luxo em Moçambique. Não somos uma agência tradicional - somos uma família de mulheres independentes.

🎯 **Nossa Missão:**
Criar um ambiente seguro, respeitoso e profissional onde mulheres podem exercer sua autonomia sexual e financeira com dignidade.

💎 **Nossos Valores:**
• Profissionalismo e ética
• Respeito e dignidade
• Liberdade de escolha
• Crescimento pessoal e profissional

🚫 **O que NÃO somos:**
• Não somos cafetinas ou bordel
• Não exploramos ninguém
• Não cobramos taxas
• Não aceitamos menores de idade

Somos uma irmandade comprometida com a excelência!`
      }
    };
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.hideNotification();
  }
  
  bindEvents() {
    // Toggle chat
    const chatToggle = document.getElementById('chat-toggle');
    const chatClose = document.getElementById('chat-close');
    
    if (chatToggle) {
      chatToggle.addEventListener('click', () => this.toggleChat());
    }
    
    if (chatClose) {
      chatClose.addEventListener('click', () => this.closeChat());
    }
    
    // Send message
    const chatSend = document.getElementById('chat-send');
    const chatInput = document.getElementById('chat-input');
    
    if (chatSend) {
      chatSend.addEventListener('click', () => this.sendMessage());
    }
    
    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // Auto-resize textarea
      chatInput.addEventListener('input', (e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
      });
    }
    
    // Quick actions
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('quick-action')) {
        const question = e.target.getAttribute('data-question');
        if (question) {
          this.handleQuickAction(question);
        }
      }
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      const chatWidget = document.getElementById('ai-chat-widget');
      const chatWindow = document.getElementById('chat-window');
      
      if (this.isOpen && chatWidget && !chatWidget.contains(e.target)) {
        this.closeChat();
      }
    });
  }
  
  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }
  
  openChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatToggle = document.getElementById('chat-toggle');
    
    if (chatWindow && chatToggle) {
      chatWindow.classList.remove('hidden');
      chatToggle.classList.add('active');
      this.isOpen = true;
      this.hideNotification();
      
      // Focus no input
      setTimeout(() => {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
          chatInput.focus();
        }
      }, 300);
    }
  }
  
  closeChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatToggle = document.getElementById('chat-toggle');
    
    if (chatWindow && chatToggle) {
      chatWindow.classList.add('hidden');
      chatToggle.classList.remove('active');
      this.isOpen = false;
    }
  }
  
  hideNotification() {
    const notification = document.getElementById('chat-notification');
    if (notification) {
      notification.style.display = 'none';
    }
  }
  
  showNotification() {
    const notification = document.getElementById('chat-notification');
    if (notification) {
      notification.style.display = 'flex';
    }
  }
  
  async sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput?.value.trim();
    
    if (!message) return;
    
    // Limpar input
    chatInput.value = '';
    
    // Adicionar mensagem do usuário
    this.addMessage(message, 'user');
    
    // Mostrar typing indicator
    this.showTyping();
    
    // Simular delay de resposta
    setTimeout(() => {
      this.hideTyping();
      const response = this.generateResponse(message);
      this.addMessage(response, 'bot');
    }, 1000 + Math.random() * 1000);
  }
  
  handleQuickAction(question) {
    // Adicionar pergunta como mensagem do usuário
    this.addMessage(question, 'user');
    
    // Mostrar typing indicator
    this.showTyping();
    
    // Responder após delay
    setTimeout(() => {
      this.hideTyping();
      const response = this.generateResponse(question);
      this.addMessage(response, 'bot');
    }, 800);
  }
  
  addMessage(content, type) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    const avatar = type === 'bot' ? '🤖' : '👤';
    
    messageDiv.innerHTML = `
      <div class="message-avatar">${avatar}</div>
      <div class="message-content">
        <p>${this.formatMessage(content)}</p>
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Adicionar à lista de mensagens
    this.messages.push({ content, type, timestamp: new Date() });
  }
  
  formatMessage(message) {
    // Converter quebras de linha em <br>
    message = message.replace(/\n/g, '<br>');
    
    // Converter texto em negrito
    message = message.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Converter listas com •
    message = message.replace(/^• (.+)$/gm, '<span style="display: block; margin: 4px 0;">• $1</span>');
    
    // Converter números de telefone em links
    message = message.replace(/(\+258\s?\d{9})/g, '<a href="tel:$1">$1</a>');
    
    // Converter emails em links
    message = message.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1">$1</a>');
    
    return message;
  }
  
  generateResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Procurar por palavras-chave na base de conhecimento
    for (const [topic, data] of Object.entries(this.knowledgeBase)) {
      if (data.keywords.some(keyword => message.includes(keyword))) {
        return data.response;
      }
    }
    
    // Respostas para saudações
    if (message.includes('olá') || message.includes('oi') || message.includes('bom dia') || 
        message.includes('boa tarde') || message.includes('boa noite')) {
      return `Olá! Bem-vindo à Galeria Secreta! 👋

Sou seu assistente virtual e estou aqui para ajudar com qualquer dúvida sobre nossa plataforma.

**Posso ajudar com:**
• Processo de candidatura
• Requisitos e critérios
• Informações sobre ganhos
• Benefícios exclusivos
• Questões de segurança

Como posso ajudá-lo hoje?`;
    }
    
    // Respostas para agradecimentos
    if (message.includes('obrigad') || message.includes('valeu') || message.includes('thanks')) {
      return `De nada! Fico feliz em ajudar! 😊

Se tiver mais alguma dúvida sobre a Galeria Secreta, estarei aqui. 

**Lembre-se:**
• Estamos disponíveis 24/7 para suporte
• WhatsApp: +258 851551556
• Email: galeriasecretamz@gmail.com

Boa sorte na sua jornada conosco! ✨`;
    }
    
    // Respostas para despedidas
    if (message.includes('tchau') || message.includes('até logo') || message.includes('bye')) {
      return `Até logo! Foi um prazer ajudá-lo! 👋

Não se esqueça:
• Nossa equipe está sempre disponível
• Contacte-nos pelo WhatsApp para respostas mais rápidas
• Esperamos vê-lo em breve na nossa família!

Tenha um excelente dia! ✨`;
    }
    
    // Perguntas sobre idade
    if (message.includes('idade') && (message.includes('mínima') || message.includes('limite'))) {
      return `**Requisitos de Idade:**

✅ **Idade mínima:** 18 anos (obrigatório)
✅ **Idade máxima:** Não há limite específico

**Importante:**
• Verificamos documentos para confirmar idade
• Não aceitamos menores de idade sob nenhuma circunstância
• A maturidade e responsabilidade são fundamentais

Tem mais de 18 anos? Então pode se candidatar! 🎉`;
    }
    
    // Perguntas sobre localização
    if (message.includes('onde') || message.includes('localização') || message.includes('província')) {
      return `**Localização e Cobertura:**

🇲🇿 **Atuamos em todo Moçambique:**
• Maputo e Maputo Cidade
• Nampula
• Sofala (Beira)
• Todas as outras províncias

📍 **Sede principal:** Nampula

**Importante:**
• Deve residir em Moçambique
• Atendemos clientes em todas as províncias
• Viagens podem ser organizadas

Qual é a sua província?`;
    }
    
    // Perguntas sobre experiência
    if (message.includes('experiência') || message.includes('iniciante') || message.includes('primeira vez')) {
      return `**Experiência Anterior:**

✨ **Não é obrigatória!** Aceitamos iniciantes com prazer.

🎓 **O que oferecemos para iniciantes:**
• Mentoria completa e personalizada
• Treinamentos específicos
• Acompanhamento próximo nos primeiros trabalhos
• Curso de etiqueta e postura
• Suporte emocional e profissional

💪 **Para quem tem experiência:**
• Aproveitamos seu conhecimento
• Ajudamos a aprimorar técnicas
• Networking com profissionais experientes
• Oportunidades de mentoria para outras

Todos começam em algum lugar. O importante é a vontade de crescer! 🚀`;
    }
    
    // Perguntas sobre tempo/disponibilidade
    if (message.includes('tempo') || message.includes('disponibilidade') || message.includes('horário')) {
      return `**Disponibilidade e Flexibilidade:**

⏰ **Horários flexíveis:**
• Você define sua agenda
• Trabalhe quando quiser
• Sem obrigatoriedade de horários fixos

📅 **Opções de disponibilidade:**
• Tempo integral
• Meio período
• Fins de semana apenas
• Ocasional/flexível

🎯 **Vantagens:**
• Concilie com outros trabalhos
• Mantenha sua vida pessoal
• Ganhe no seu ritmo

A flexibilidade é uma das nossas principais vantagens! 💫`;
    }
    
    // Resposta padrão para perguntas não reconhecidas
    return `Obrigado pela sua pergunta! 🤔

Embora eu tenha conhecimento sobre muitos aspectos da Galeria Secreta, para esta questão específica recomendo que entre em contacto direto com nossa equipe:

📞 **WhatsApp:** +258 851551556
✉️ **Email:** galeriasecretamz@gmail.com

**Posso ajudar com:**
• Processo de candidatura
• Requisitos e critérios  
• Informações sobre ganhos
• Benefícios e vantagens
• Questões de segurança

Tem alguma dessas dúvidas? Ficarei feliz em ajudar! 😊`;
  }
  
  showTyping() {
    const typingElement = document.getElementById('chat-typing');
    if (typingElement) {
      typingElement.style.display = 'flex';
      this.isTyping = true;
      
      // Scroll para baixo
      const messagesContainer = document.getElementById('chat-messages');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }
  
  hideTyping() {
    const typingElement = document.getElementById('chat-typing');
    if (typingElement) {
      typingElement.style.display = 'none';
      this.isTyping = false;
    }
  }
}

// Inicializar chat quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
  window.aiChat = new AIChat();
  
  // Mostrar notificação após 5 segundos se chat não foi aberto
  setTimeout(() => {
    if (!window.aiChat.isOpen) {
      window.aiChat.showNotification();
    }
  }, 5000);
});