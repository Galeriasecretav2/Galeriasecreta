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

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor ativo em http://localhost:${port}`);
});
