// supabase/client.js
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// ⚠️ USE A SERVICE_ROLE KEY (NÃO a publishable key!)
const supabaseUrl = 'https://ixjcvufpsdckbhqlgswq.supabase.co'
const supabaseKey = 'sb_publishable_q6RZbtnMjtUmrSoDaigEhA_mEKVcq1g'  // ← SUBSTITUA PELA SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey) 

module.exports = supabase