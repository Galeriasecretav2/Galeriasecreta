// Importações
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mime = require('mime-types');
const bcrypt = require('bcrypt');
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

// Rota de candidatura
app.post('/api/candidatura', upload.single('foto'), async (req, res) => {
  try {
    console.log('📨 POST /api/candidatura');
    const { nome, idade, pais, provincia, email, whatsapp } = req.body;
    const foto = req.file;

    if (!nome || !idade || !email || !whatsapp) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    let foto_url = null;
    let foto_path = null;
    let foto_nome = null;

    if (foto) {
      try {
        const ext = path.extname(foto.originalname);
        foto_nome = foto.originalname;
        foto_path = `fotos/${Date.now()}_${foto_nome}`;
        const fileBuffer = fs.readFileSync(foto.path);

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('candidaturas-fotos')
          .upload(foto_path, fileBuffer, {
            contentType: mime.lookup(ext) || 'image/jpeg',
            upsert: false,
          });

        fs.unlinkSync(foto.path);

        if (uploadError) {
          return res.status(500).json({
            error: 'Erro ao enviar imagem',
            detalhes: uploadError.message,
          });
        }

        const { data: publicUrlData } = supabase.storage
          .from('candidaturas-fotos')
          .getPublicUrl(foto_path);

        foto_url = publicUrlData?.publicUrl;
      } catch (uploadException) {
        return res.status(500).json({
          error: 'Erro ao enviar imagem',
          detalhes: uploadException.message,
        });
      }
    }

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
      return res.status(500).json({
        error: 'Erro ao salvar candidatura',
        detalhes: error.message,
      });
    }

    return res.status(200).json({
      message: 'Candidatura enviada com sucesso!',
      data,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// 🔐 Cadastro de perfil
app.post('/api/registrar', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const { data: existingUser, error: selectError } = await supabase
      .from('perfis')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const { data, error } = await supabase.from('perfis').insert([
      {
        nome,
        email,
        senha: hashedPassword,
        criado_em: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

// 🔑 Login de perfil
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const { data: user, error } = await supabase
      .from('perfis')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const valid = await bcrypt.compare(senha, user.senha);

    if (!valid) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    res.status(200).json({ message: 'Login bem-sucedido', perfil: user });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
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
