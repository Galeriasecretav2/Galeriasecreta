// 🔑 Login com Supabase Auth e recuperação do perfil
app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;

  // Validação básica
  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    // Login com Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    // Verifica se houve erro de autenticação
    if (error || !data?.user) {
      return res.status(401).json({ error: 'Email ou senha incorretos.' });
    }

    const userId = data.user.id;

    // Busca o perfil correspondente na tabela 'perfis'
    const { data: perfil, error: perfilError } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', userId)
      .single();

    if (perfilError) {
      return res.status(500).json({ error: 'Login feito, mas falha ao recuperar perfil.' });
    }

    // Retorna sucesso com o perfil e token de sessão
    return res.status(200).json({
      message: 'Login bem-sucedido',
      perfil,
      token: data.session?.access_token,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno ao fazer login.' });
  }
});
