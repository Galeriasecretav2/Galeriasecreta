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

// Verifica se as variáveis de ambiente do Supabase estão definidas
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ Erro: SUPABASE_URL e SUPABASE_KEY devem estar definidos no arquivo .env');
  console.error('Por favor, clique no botão "Connect to Supabase" no canto superior direito para configurar o Supabase');
  console.error('Ou configure manualmente as variáveis de ambiente no arquivo .env');
  process.exit(1);
}

// Valida se a URL do Supabase é válida
try {
  new URL(process.env.SUPABASE_URL);
} catch (error) {
  console.error('❌ Erro: SUPABASE_URL inválida no arquivo .env');
  console.error('A URL deve estar no formato: https://seu-projeto.supabase.co');
  console.error('URL atual:', process.env.SUPABASE_URL);
  console.error('Por favor, clique no botão "Connect to Supabase" no canto superior direito para configurar o Supabase');
  process.exit(1);
}

// Cria o cliente Supabase apenas após validação
let supabase;
try {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );
  console.log('✅ Conexão com Supabase estabelecida com sucesso');
} catch (error) {
  console.error('❌ Erro ao conectar com Supabase:', error.message);
  console.error('Verifique se SUPABASE_URL e SUPABASE_KEY estão corretos no arquivo .env');
  process.exit(1);
}

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de candidatura
app.post('/api/candidatura', upload.single('foto'), async (req, res) => {
  try {
    console.log('📨 Recebido POST /api/candidatura');
    const { nome, idade, pais, provincia, email, whatsapp } = req.body;
    const foto = req.file;

    console.log('📄 Dados:', req.body);
    console.log('🖼️ Foto:', foto);

    if (!nome || !idade || !email || !whatsapp) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }

    // Upload da imagem para Supabase Storage
    let foto_url = null;
    let foto_path = null;
    let foto_nome = null;

    if (foto) {
      const ext = path.extname(foto.originalname);
      foto_nome = foto.originalname;
      foto_path = `fotos/${Date.now()}_${foto_nome}`;
      const fileBuffer = fs.readFileSync(foto.path);

      const { error: uploadError } = await supabase.storage
        .from('candidaturas-fotos')
        .upload(foto_path, fileBuffer, {
          contentType: mime.lookup(ext) || 'image/jpeg',
        });

      // Remove o arquivo temporário local após upload
      fs.unlinkSync(foto.path);

      if (uploadError) {
        console.error('❌ Erro ao enviar imagem:', uploadError.message);
        return res.status(500).json({ error: 'Erro ao enviar imagem' });
      }

      // URL pública da imagem
      const { data: publicUrlData } = supabase.storage
        .from('candidaturas-fotos')
        .getPublicUrl(foto_path);

      foto_url = publicUrlData?.publicUrl;
    }

    // Insere dados no banco
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
      console.error('❌ Erro ao salvar no Supabase:', error.message);
      return res.status(500).json({ error: 'Erro ao salvar candidatura', detalhes: error.message });
    }

    console.log('✅ Candidatura salva com sucesso');
    res.status(200).json({ message: 'Candidatura enviada com sucesso!', data });
  } catch (err) {
    console.error('❌ Erro inesperado:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});
