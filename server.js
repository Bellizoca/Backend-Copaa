// server.js
const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Importação das rotas
const authRoutes = require('./routes/auth')
const produtoRoutes = require('./routes/produtos')
const carrinhoRoutes = require('./routes/carrinho')
const pedidoRoutes = require('./routes/pedidos')
const trocaRoutes = require('./routes/trocas')
const categoriaRoutes = require('./routes/categorias')

const app = express()
const PORT = process.env.PORT || 3000

// ============================================
// MIDDLEWARES
// ============================================

// CORS - Permitir requisições do frontend
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

// Parse JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Log de requisições (para debug)
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`)
    next()
})

// ============================================
// ROTAS - NENHUMA ROTA DE AUTENTICAÇÃO TEM MIDDLEWARE!
// ============================================

// Rotas de autenticação (PÚBLICAS - sem token)
app.use('/api/auth', authRoutes)

// Rotas de produtos (algumas exigem token via middleware interno)
app.use('/api/produtos', produtoRoutes)

// Rotas de carrinho (exigem token via middleware interno)
app.use('/api/carrinho', carrinhoRoutes)

// Rotas de pedidos (exigem token via middleware interno)
app.use('/api/pedidos', pedidoRoutes)

// Rotas de trocas (exigem token via middleware interno)
app.use('/api/trocas', trocaRoutes)

// Rotas de categorias (públicas para GET, exigem token para POST/PUT/DELETE)
app.use('/api/categorias', categoriaRoutes)

// ============================================
// ROTA PRINCIPAL (teste)
// ============================================

app.get('/', (req, res) => {
    res.json({
        mensagem: '🏆 Mercado da Copa API',
        versao: '1.0.0',
        endpoints: {
            autenticacao: {
                registro: 'POST /api/auth/register ✅ (público)',
                login: 'POST /api/auth/login ✅ (público)',
                perfil: 'GET /api/auth/perfil 🔒 (requer token)'
            },
            produtos: {
                listar: 'GET /api/produtos ✅ (público)',
                detalhe: 'GET /api/produtos/:id ✅ (público)',
                criar: 'POST /api/produtos 🔒 (requer token)',
                editar: 'PUT /api/produtos/:id 🔒 (requer token)',
                deletar: 'DELETE /api/produtos/:id 🔒 (requer token)',
                meus_anuncios: 'GET /api/produtos/meus/anuncios 🔒 (requer token)'
            },
            categorias: {
                listar: 'GET /api/categorias ✅ (público)',
                detalhe: 'GET /api/categorias/:id ✅ (público)',
                criar: 'POST /api/categorias 🔒 (requer token)',
                editar: 'PUT /api/categorias/:id 🔒 (requer token)',
                deletar: 'DELETE /api/categorias/:id 🔒 (requer token)'
            },
            carrinho: {
                ver: 'GET /api/carrinho 🔒 (requer token)',
                adicionar: 'POST /api/carrinho 🔒 (requer token)',
                atualizar: 'PUT /api/carrinho/:id 🔒 (requer token)',
                remover: 'DELETE /api/carrinho/:id 🔒 (requer token)'
            },
            pedidos: {
                finalizar: 'POST /api/pedidos/finalizar 🔒 (requer token)',
                meus_pedidos: 'GET /api/pedidos/meus 🔒 (requer token)'
            },
            trocas: {
                criar: 'POST /api/trocas 🔒 (requer token)',
                minhas_propostas: 'GET /api/trocas/minhas 🔒 (requer token)',
                responder: 'PUT /api/trocas/:id/responder 🔒 (requer token)'
            }
        }
    })
})

// Rota de health check (para monitoramento)
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    })
})

// ============================================
// TRATAMENTO DE ERROS (404 - Rota não encontrada)
// ============================================

app.use((req, res) => {
    res.status(404).json({
        error: 'Rota não encontrada',
        mensagem: `A rota ${req.method} ${req.url} não existe`,
        sugestao: 'Verifique os endpoints disponíveis em GET /'
    })
})

// ============================================
// TRATAMENTO DE ERROS GLOBAIS
// ============================================

app.use((err, req, res, next) => {
    console.error('❌ Erro:', err.stack)

    res.status(err.status || 500).json({
        error: err.message || 'Erro interno do servidor',
        mensagem: 'Algo deu errado. Tente novamente mais tarde.'
    })
})

// ============================================
// INICIAR O SERVIDOR
// ============================================

app.listen(PORT, () => {
    console.log('')
    console.log('='.repeat(50))
    console.log('🏆 MERCADO DA COPA - BACKEND')
    console.log('='.repeat(50))
    console.log(`🚀 Servidor rodando na porta: ${PORT}`)
    console.log(`📍 Local: http://localhost:${PORT}`)
    console.log(`📋 Health check: http://localhost:${PORT}/health`)
    console.log('='.repeat(50))
    console.log('✅ Backend pronto para receber requisições!')
    console.log('')
    console.log('📌 Rotas públicas (sem token):')
    console.log(`   POST /api/auth/register   - Cadastro de usuário`)
    console.log(`   POST /api/auth/login      - Login de usuário`)
    console.log(`   GET  /api/produtos        - Listar produtos`)
    console.log(`   GET  /api/produtos/:id    - Detalhe do produto`)
    console.log(`   GET  /api/categorias      - Listar categorias`)
    console.log(`   GET  /api/categorias/:id  - Detalhe da categoria`)
    console.log('')
    console.log('📌 Rotas protegidas (requerem token Bearer):')
    console.log(`   GET  /api/auth/perfil     - Perfil do usuário`)
    console.log(`   POST /api/produtos        - Criar produto`)
    console.log(`   PUT  /api/produtos/:id    - Editar produto`)
    console.log(`   DELETE /api/produtos/:id  - Deletar produto`)
    console.log(`   GET  /api/carrinho        - Ver carrinho`)
    console.log(`   POST /api/carrinho        - Adicionar ao carrinho`)
    console.log(`   POST /api/pedidos/finalizar - Finalizar pedido`)
    console.log(`   POST /api/trocas          - Propor troca`)
    console.log('')
})