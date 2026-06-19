// routes/auth.js
const express = require('express')
const router = express.Router()
const supabase = require('../supabase/client')

// ============================================
// REGISTRAR USUÁRIO - COM TRATAMENTO DE ERRO
// ============================================
router.post('/register', async (req, res) => {
    const { nome, email, senha, telefone } = req.body

    if (!email || !senha || !nome) {
        return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' })
    }

    try {
        // 1. Tentar criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
                data: { nome, telefone: telefone || '' }
            }
        })

        if (authError) {
            // Tratar erro de rate limiting (muitas requisições)
            if (authError.message && authError.message.includes('security purposes')) {
                return res.status(429).json({ 
                    error: 'Aguarde alguns segundos e tente novamente. O Supabase tem um limite de segurança para evitar spam.',
                    tipo: 'rate_limit'
                })
            }
            if (authError.message && authError.message.includes('already registered')) {
                return res.status(400).json({ error: 'Este e-mail já está cadastrado' })
            }
            throw authError
        }

        // 2. Verificar se o usuário foi criado
        if (!authData.user) {
            return res.status(400).json({ error: 'Erro ao criar usuário. Tente novamente.' })
        }

        // 3. Criar perfil na tabela perfis
        const { error: perfilError } = await supabase
            .from('perfis')
            .insert({
                id: authData.user.id,
                nome,
                email,
                telefone: telefone || null,
                tipo: 'cliente'
            })

        if (perfilError) {
            // Se falhou ao criar perfil, tentar novamente
            console.error('Erro ao criar perfil:', perfilError)
            // Não retorna erro, apenas log
        }

        res.status(201).json({
            sucesso: true,
            mensagem: 'Conta criada com sucesso! Faça login para continuar.',
            usuario: {
                id: authData.user.id,
                email,
                nome
            }
        })

    } catch (error) {
        console.error('Erro no registro:', error)
        res.status(500).json({ error: error.message || 'Erro ao criar conta. Tente novamente.' })
    }
})

// ============================================
// LOGIN USUÁRIO
// ============================================
router.post('/login', async (req, res) => {
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
            if (error.message && error.message.includes('Invalid login credentials')) {
                return res.status(401).json({ error: 'E-mail ou senha incorretos' })
            }
            throw error
        }

        // Buscar perfil
        let perfil = null
        const { data: perfilData, error: perfilError } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', data.user.id)
            .single()

        if (perfilError) {
            // Se não tiver perfil, criar um
            const nome = data.user.user_metadata?.nome || email.split('@')[0]
            const { error: createError } = await supabase
                .from('perfis')
                .insert({
                    id: data.user.id,
                    nome: nome,
                    email: data.user.email,
                    tipo: 'cliente'
                })
            if (!createError) {
                perfil = { nome, email: data.user.email, tipo: 'cliente' }
            }
        } else {
            perfil = perfilData
        }

        res.json({
            sucesso: true,
            token: data.session.access_token,
            usuario: {
                id: data.user.id,
                email: data.user.email,
                nome: perfil?.nome || data.user.user_metadata?.nome || email.split('@')[0],
                tipo: perfil?.tipo || 'cliente'
            }
        })

    } catch (error) {
        console.error('Erro no login:', error)
        res.status(401).json({ error: 'E-mail ou senha incorretos' })
    }
})

// ============================================
// BUSCAR PERFIL DO USUÁRIO LOGADO
// ============================================
router.get('/perfil', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' })
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token)
        if (error) throw error

        const { data: perfil } = await supabase
            .from('perfis')
            .select('*')
            .eq('id', user.id)
            .single()

        res.json({
            usuario: {
                id: user.id,
                email: user.email,
                nome: perfil?.nome || user.user_metadata?.nome
            },
            perfil
        })

    } catch (error) {
        res.status(401).json({ error: 'Token inválido' })
    }
})

module.exports = router