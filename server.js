const express = require('express');
const app = express();
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

// Configurar ambiente (substitua pelas suas variáveis reais ou use .env)
const SUPABASE_URL = 'https://yqxfolkuewxbeaqiyxgi.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOi...'; // sua anon/public key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middlewares
app.use(cors());
app.use(express.json());

// Rota de registro
app.post('/api/registrar', async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (authError) {
      return res.status(400).json({ error: 'Erro ao registrar usuário.', detalhes: authError.message });
    }

    const userId = authData.user.id;

    const { error } = await supabase.from('perfis').insert([
      {
        id: userId,
        nome,
        email,
        criado_em: new Date().toISOString(),
      },
    ]);

    if (error) throw error;

    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao registrar usuário.' });
  }
});

// Rota de login
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error || !data?.user) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (perfilError) {
      return res.status(500).json({ error: 'Login feito, mas erro ao buscar perfil.' });
    }

    res.status(200).json({
      message: 'Login bem-sucedido',
      perfil,
      token: data.session?.access_token,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao fazer login.' });
  }
});

// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
