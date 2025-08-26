import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface EmailRequest {
  to: string
  subject: string
  html: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, code, nome } = await req.json()

    if (!email || !code || !nome) {
      return new Response(
        JSON.stringify({ error: 'Email, código e nome são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // HTML template para o email
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Redefinição - Galeria Secreta</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f8f9fa;
            }
            .container {
                background: white;
                border-radius: 12px;
                padding: 40px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #d4af37;
                padding-bottom: 20px;
            }
            .logo {
                font-size: 28px;
                font-weight: bold;
                color: #d4af37;
                margin-bottom: 10px;
            }
            .subtitle {
                color: #666;
                font-size: 14px;
            }
            .code-container {
                background: linear-gradient(135deg, #d4af37, #f4e4a6);
                border-radius: 12px;
                padding: 30px;
                text-align: center;
                margin: 30px 0;
            }
            .code {
                font-size: 36px;
                font-weight: bold;
                color: white;
                letter-spacing: 8px;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
                margin: 10px 0;
            }
            .code-label {
                color: white;
                font-size: 14px;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .message {
                font-size: 16px;
                margin: 20px 0;
                text-align: center;
            }
            .warning {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
                color: #856404;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                font-size: 12px;
                color: #666;
            }
            .contact-info {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Galeria Secreta</div>
                <div class="subtitle">Elegância e Sofisticação</div>
            </div>
            
            <div class="message">
                <p>Olá <strong>${nome}</strong>,</p>
                <p>Recebemos uma solicitação para redefinir a palavra-passe da sua conta.</p>
                <p>Use o código abaixo para continuar:</p>
            </div>
            
            <div class="code-container">
                <div class="code-label">Seu Código de Verificação</div>
                <div class="code">${code}</div>
            </div>
            
            <div class="warning">
                <strong>⚠️ Importante:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Este código é válido por apenas <strong>15 minutos</strong></li>
                    <li>Não compartilhe este código com ninguém</li>
                    <li>Se você não solicitou esta redefinição, ignore este email</li>
                </ul>
            </div>
            
            <div class="footer">
                <p><strong>Galeria Secreta</strong></p>
                <div class="contact-info">
                    <p>📞 +258 851551556</p>
                    <p>✉️ galeriasecretamz@gmail.com</p>
                </div>
                <p style="margin-top: 20px;">
                    Este é um email automático, não responda a esta mensagem.
                </p>
            </div>
        </div>
    </body>
    </html>
    `

    // Usar o serviço de email do Supabase (Resend)
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY não configurada')
      return new Response(
        JSON.stringify({ error: 'Serviço de email não configurado' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const emailData = {
      from: 'Galeria Secreta <noreply@galeriasecreta.com>',
      to: [email],
      subject: `Código de Redefinição: ${code} - Galeria Secreta`,
      html: htmlContent
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Erro ao enviar email:', error)
      return new Response(
        JSON.stringify({ error: 'Erro ao enviar email' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const result = await response.json()
    console.log('Email enviado com sucesso:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email enviado com sucesso',
        emailId: result.id 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na função send-reset-code:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})