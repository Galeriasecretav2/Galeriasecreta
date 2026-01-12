// Importações
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mime = require('mime-types');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Configura upload local (temporário)
const upload = multer({ dest: 'uploads/' });

// Inicializa Express e Supabase
const app = express();
const port = process.env.PORT || 3000;

// Verifica variáveis de ambiente
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ SUPABASE_URL e SUPABASE_KEY devem estar no .env');
  process.exit(1);
}

// Valida URL do Supabase
try {
  new URL(process.env.SUPABASE_URL);
} catch (error) {
  console.error('❌ SUPABASE_URL inválida:', process.env.SUPABASE_URL);
  process.exit(1);
}

// Cria o cliente Supabase
let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  console.log('✅ Conexão com Supabase OK');
} catch (error) {
  console.error('❌ Erro ao criar cliente Supabase:', error.message);
  process.exit(1);
}

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware para verificar JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token de acesso requerido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'galeria-secreta-jwt-secret');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Função para registrar log de login
const logLogin = async (email, usuarioId, sucesso, motivo, req) => {
  try {
    await supabase.from('login_logs').insert([{
      usuario_id: usuarioId,
      email,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent'),
      sucesso,
      motivo_falha: motivo
    }]);
  } catch (error) {
    console.error('Erro ao registrar log:', error);
  }
};

// Rota de registro
app.post('/api/registro', async (req, res) => {
  try {
    console.log('📨 POST /api/registro');
    const { nome, email, senha, tipo_usuario = 'cliente' } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios ausentes',
        detalhes: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        error: 'Email já cadastrado',
        detalhes: 'Este email já está registrado no sistema'
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Inserir usuário
    const { data, error } = await supabase.from('usuarios').insert([{
      nome,
      email,
      senha_hash: senhaHash,
      tipo_usuario,
      ativo: true
    }]).select().single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return res.status(500).json({
        error: 'Erro ao criar usuário',
        detalhes: error.message
      });
    }

    // Log do registro
    await logLogin(email, data.id, true, 'Registro realizado com sucesso', req);

    console.log('✅ Usuário registrado com sucesso');
    return res.status(201).json({
      message: 'Usuário registrado com sucesso!',
      usuario: {
        id: data.id,
        nome: data.nome,
        email: data.email,
        tipo_usuario: data.tipo_usuario
      }
    });
  } catch (err) {
    console.error('❌ Erro geral no registro:', err);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      detalhes: err.message 
    });
  }
});

// Rota de login
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    console.log('📨 POST /api/login');
    const { email, senha } = req.body;

    if (!email || !senha) {
      await logLogin(email || 'N/A', null, false, 'Campos obrigatórios ausentes', req);
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios' 
      });
    }

    // Buscar usuário
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !usuario) {
      await logLogin(email, null, false, 'Usuário não encontrado', req);
      return res.status(401).json({ 
        error: 'Email ou senha incorretos' 
      });
    }

    // Verificar se usuário está ativo
    if (!usuario.ativo) {
      await logLogin(email, usuario.id, false, 'Usuário inativo', req);
      return res.status(401).json({ 
        error: 'Conta desativada. Entre em contacto com o suporte.' 
      });
    }

    // Verificar se está bloqueado
    if (usuario.bloqueado_ate && new Date(usuario.bloqueado_ate) > new Date()) {
      await logLogin(email, usuario.id, false, 'Usuário bloqueado', req);
      return res.status(401).json({ 
        error: 'Conta temporariamente bloqueada. Tente novamente mais tarde.' 
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    
    if (!senhaValida) {
      // Incrementar tentativas de login
      const novasTentativas = (usuario.tentativas_login || 0) + 1;
      let bloqueadoAte = null;
      
      // Bloquear após 5 tentativas por 30 minutos
      if (novasTentativas >= 5) {
        bloqueadoAte = new Date(Date.now() + 30 * 60 * 1000);
      }
      
      await supabase
        .from('usuarios')
        .update({ 
          tentativas_login: novasTentativas,
          bloqueado_ate: bloqueadoAte
        })
        .eq('id', usuario.id);

      await logLogin(email, usuario.id, false, 'Senha incorreta', req);
      return res.status(401).json({ 
        error: 'Email ou senha incorretos' 
      });
    }

    // Login bem-sucedido - resetar tentativas e atualizar último login
    await supabase
      .from('usuarios')
      .update({ 
        tentativas_login: 0,
        bloqueado_ate: null,
        ultimo_login: new Date().toISOString()
      })
      .eq('id', usuario.id);

    // Gerar JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        tipo_usuario: usuario.tipo_usuario 
      },
      process.env.JWT_SECRET || 'galeria-secreta-jwt-secret',
      { expiresIn: '24h' }
    );

    // Log do login bem-sucedido
    await logLogin(email, usuario.id, true, 'Login realizado com sucesso', req);

    console.log('✅ Login realizado com sucesso');
    return res.status(200).json({
      message: 'Login realizado com sucesso!',
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        ultimo_login: usuario.ultimo_login
      }
    });
  } catch (err) {
    console.error('❌ Erro geral no login:', err);
    await logLogin(req.body.email || 'N/A', null, false, 'Erro interno do servidor', req);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      detalhes: err.message 
    });
  }
});

// Rota para verificar token
app.get('/api/verify-token', verifyToken, async (req, res) => {
  try {
    const { data: usuario } = await supabase
      .from('usuarios')
      .select('id, nome, email, tipo_usuario, ultimo_login')
      .eq('id', req.user.id)
      .single();

    if (!usuario) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    return res.status(200).json({
      valid: true,
      usuario
    });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

// Rota para logout (opcional - apenas para logs)
app.post('/api/logout', verifyToken, async (req, res) => {
  try {
    await logLogin(req.user.email, req.user.id, true, 'Logout realizado', req);
    return res.status(200).json({ message: 'Logout realizado com sucesso' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro no logout' });
  }
});

// Rota para listar logs de login (apenas admins)
app.get('/api/login-logs', verifyToken, async (req, res) => {
  try {
    // Verificar se é admin
    if (req.user.tipo_usuario !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const { data, error } = await supabase
      .from('login_logs')
      .select(`
        *,
        usuarios(nome, email, tipo_usuario)
      `)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      return res.status(500).json({ error: 'Erro ao buscar logs' });
    }

    return res.status(200).json({ data });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de candidatura
app.post('/api/candidatura', upload.single('foto'), async (req, res) => {
  try {
    console.log('📨 POST /api/candidatura');
    const { nome, idade, pais, provincia, email, whatsapp } = req.body;
    const foto = req.file;

    console.log('📄 Dados recebidos:', req.body);
    console.log('🖼️ Foto:', foto);

    if (!nome || !idade || !email || !whatsapp) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    // Upload da imagem
    let foto_url = null;
    let foto_path = null;
    let foto_nome = null;

    if (foto) {
      try {
        const ext = path.extname(foto.originalname);
        foto_nome = foto.originalname;
        foto_path = `fotos/${Date.now()}_${foto_nome}`;
        const fileBuffer = fs.readFileSync(foto.path);

        console.log("📤 Enviando imagem...");
        console.log("🧾 Nome:", foto_nome);
        console.log("📁 Caminho:", foto_path);
        console.log("🧠 MIME:", mime.lookup(ext));

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidaturas-fotos')
          .upload(foto_path, fileBuffer, {
            contentType: mime.lookup(ext) || 'image/jpeg',
            upsert: false,
          });

        // Remove arquivo local
        fs.unlinkSync(foto.path);

        if (uploadError) {
          console.error('❌ Erro ao enviar imagem:', uploadError.message);
          return res.status(500).json({
            error: 'Erro ao enviar imagem',
            detalhes: uploadError.message,
          });
        }

        console.log('✅ Upload OK:', uploadData);

        const { data: publicUrlData } = supabase.storage
          .from('candidaturas-fotos')
          .getPublicUrl(foto_path);

        foto_url = publicUrlData?.publicUrl;
      } catch (uploadException) {
        console.error('❌ Exceção ao enviar imagem:', uploadException);
        return res.status(500).json({
          error: 'Erro ao enviar imagem',
          detalhes: uploadException.message,
        });
      }
    }

    // Inserção no banco
    const { data, error } = await supabase.from('candidaturas').insert([
      {
        nome,
        idade: parseInt(idade),
        pais,
        provincia,
        email,
        whatsapp,
        foto_url,
        foto_nome,
        foto_path,
        termos_aceit: true,
        status: 'pendente',
        observacoes: '',
      },
    ]);

    if (error) {
      console.error('❌ Erro ao salvar candidatura:', error.message);
      return res.status(500).json({
        error: 'Erro ao salvar candidatura',
        detalhes: error.message,
      });
    }

    console.log('✅ Candidatura salva com sucesso');
    return res.status(200).json({
      message: 'Candidatura enviada com sucesso!',
      data,
    });
  } catch (err) {
    console.error('❌ Erro geral:', err.message, err);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota de inscrição
app.post('/api/inscricao', async (req, res) => {
  try {
    console.log('📨 POST /api/inscricao');
    const { 
      nome, 
      email, 
    } = req.body;

    console.log('📄 Dados de inscrição recebidos:', req.body);

    // Validação de campos obrigatórios
    if (!nome || !email || !telefone || !data_nascimento || !genero || !cidade || !provincia || !disponibilidade) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios ausentes',
        detalhes: 'Nome, email, telefone, data de nascimento, gênero, cidade, província e disponibilidade são obrigatórios'
      });
    }

    // Validação de idade mínima
    const birthDate = new Date(data_nascimento);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return res.status(400).json({
        error: 'Idade insuficiente',
        detalhes: 'É necessário ter pelo menos 18 anos para se inscrever'
      });
    }

    // Inserção no banco
    const { data, error } = await supabase.from('inscricoes').insert([
      {
        nome,
        email,
        telefone,
        data_nascimento,
        genero,
        cidade,
        provincia,
        profissao: profissao || '',
        experiencia_anterior: experiencia_anterior || false,
        motivacao: motivacao || '',
        disponibilidade,
        termos_aceitos: termos_aceitos || true,
        newsletter: newsletter || false,
        status: 'pendente',
        observacoes: '',
      },
    ]);

    if (error) {
      console.error('❌ Erro ao salvar inscrição:', error.message);
      
      // Tratamento específico para email duplicado
      if (error.code === '23505' && error.message.includes('email')) {
        return res.status(409).json({
          error: 'Email já cadastrado',
          detalhes: 'Este email já está registrado em nosso sistema'
        });
      }
      
      return res.status(500).json({
        error: 'Erro ao salvar inscrição',
        detalhes: error.message,
      });
    }

    console.log('✅ Inscrição salva com sucesso');
    return res.status(200).json({
      message: 'Inscrição realizada com sucesso!',
      data,
    });
  } catch (err) {
    console.error('❌ Erro geral na inscrição:', err.message, err);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      detalhes: err.message 
    });
  }
});

// Rota para listar inscrições (apenas para usuários autenticados)
app.get('/api/inscricoes', async (req, res) => {
  try {
    console.log('📨 GET /api/inscricoes');
    
    const { data, error } = await supabase
      .from('inscricoes')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar inscrições:', error.message);
      return res.status(500).json({
        error: 'Erro ao buscar inscrições',
        detalhes: error.message,
      });
    }

    console.log(`✅ ${data.length} inscrições encontradas`);
    return res.status(200).json({
      message: 'Inscrições recuperadas com sucesso',
      data,
      total: data.length
    });
  } catch (err) {
    console.error('❌ Erro geral ao buscar inscrições:', err.message, err);
    return res.status(500).json({ 
      error: 'Erro interno do servidor',
      detalhes: err.message 
    });
  }
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor ativo em http://localhost:${port}`);
});
