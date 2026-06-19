// supabase/client.js
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// ⚠️ USE A SERVICE_ROLE_KEY (não a anon key) no backend!
// A SERVICE_ROLE_KEY tem permissão para criar usuários
const supabaseUrl = process.env.SUPABASE_URL || 'https://ixjcvufpsdckbhqlgswq.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'sua-service-role-key-aqui'

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase