// routes/auth.js
const express = require('express')
const router = express.Router()
const supabase = require('../supabase/client')

// ============================================
// REGISTRAR USUÁRIO - USANDO ADMIN CREATE
// ============================================
router.post('/register', async (req, res) => {
    console.log('📝 Recebida requisição de cadastro:', req.body)
    
    const { nome, email, senha, telefone } = req.body

    if (!email || !senha || !nome) {
        return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' })
    }

    try {
        // USAR admin.createUser com SERVICE_ROLE_KEY
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password: senha,
            email_confirm: true,
            user_metadata: { 
                nome: nome,
                telefone: telefone || ''
            }
        })

        if (authError) {
            console.error('❌ Erro no Supabase Auth:', authError)
            
            if (authError.message && authError.message.includes('already registered')) {
                return res.status(400).json({ error: 'Este e-mail já está cadastrado' })
            }
            return res.status(400).json({ error: authError.message || 'Erro ao criar usuário' })
        }

        if (!authData || !authData.user) {
            return res.status(400).json({ error: 'Erro ao criar usuário' })
        }

        console.log('✅ Usuário criado com sucesso:', authData.user.id)

        // Criar perfil
        const { error: perfilError } = await supabase
            .from('perfis')
            .insert({
                id: authData.user.id,
                nome: nome,
                email: email,
                telefone: telefone || null,
                tipo: 'cliente',
                data_criacao: new Date()
            })

        if (perfilError) {
            console.error('❌ Erro ao criar perfil:', perfilError)
        } else {
            console.log('✅ Perfil criado com sucesso!')
        }

        res.status(201).json({
            sucesso: true,
            mensagem: 'Conta criada com sucesso!',
            usuario: {
                id: authData.user.id,
                email: email,
                nome: nome
            }
        })

    } catch (error) {
        console.error('❌ Erro fatal:', error)
        res.status(500).json({ error: 'Erro interno ao criar conta' })
    }
})

// ============================================
// LOGIN USUÁRIO
// ============================================
router.post('/login', async (req, res) => {
    console.log('📝 Login:', req.body.email)
    
    const { email, senha } = req.body

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' })
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password: senha
        })

        if (error) {
            console.error('❌ Erro no login:', error)
            if (error.message && error.message.includes('Invalid login credentials')) {
                return res.status(401).json({ error: 'E-mail ou senha incorretos' })
            }
            throw error
        }

        console.log('✅ Login bem-sucedido:', data.user.id)

        // Buscar perfil
        let perfil = null
        const { data: perfilData, error: perfilError } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', data.user.id)
            .single()

        if (perfilError) {
            const nome = data.user.user_metadata?.nome || email.split('@')[0]
            await supabase
                .from('perfis')
                .insert({
                    id: data.user.id,
                    nome: nome,
                    email: data.user.email,
                    tipo: 'cliente'
                })
            perfil = { nome, email: data.user.email, tipo: 'cliente' }
        } else {
            perfil = perfilData
        }

        res.json({
            sucesso: true,
            token: data.session.access_token,
            usuario: {
                id: data.user.id,
                email: data.user.email,
                nome: perfil?.nome || email.split('@')[0],
                tipo: perfil?.tipo || 'cliente'
            }
        })

    } catch (error) {
        console.error('❌ Erro no login:', error)
        res.status(401).json({ error: 'E-mail ou senha incorretos' })
    }
})

module.exports = router0