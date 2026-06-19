// supabase/client.js
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// ⚠️ SUBSTITUIR PELOS DADOS DO SEU PROJETO SUPABASE
const supabaseUrl = process.env.SUPABASE_URL || 'https://ixjcvufpsdckbhqlgswq.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'sb_publishable_q6RZbtnMjtUmrSoDaigEhA_mEKVcq1g'

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase