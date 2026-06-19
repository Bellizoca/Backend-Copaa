// supabase/client.js
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// ⚠️ USE A SERVICE_ROLE_KEY (NÃO a anon key!)
const supabaseUrl = process.env.SUPABASE_URL || 'https://ixjcvufpsdckbhqlgswq.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'sb_publishable_q6RZbtnMjtUmrSoDaigEhA_mEKVcq1g'

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase