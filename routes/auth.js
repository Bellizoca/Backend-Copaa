// routes/auth.js
const express = require('express')
const router = express.Router()
const supabase = require('../supabase/client')

router.post('/register', async (req, res) => {
    // ... (código que não exige token)
})

router.post('/login', async (req, res) => {
    // ... (código que não exige token)
})

module.exports = router