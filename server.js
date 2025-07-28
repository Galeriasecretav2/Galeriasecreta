// Importações
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mime = require('mime-types');
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
      telefone, 
      data_nascimento, 
      genero, 
      cidade, 
      provincia, 
      profissao, 
      experiencia_anterior, 
      motivacao, 
      disponibilidade, 
      termos_aceitos, 
      newsletter 
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