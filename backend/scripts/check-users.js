const { Pool } = require('pg');
const pool = new Pool({ user:'cvhive', host:'localhost', database:'cvhive', password:'cvhive123', port:5433 });

pool.query(`SELECT email, role, email_verified, verification_token IS NOT NULL as has_token FROM users WHERE email LIKE '%mohs%' OR email LIKE '%outlook%' OR email LIKE '%hotmail%' OR email_verified = false`)
  .then(r => { console.log('Matching users:', JSON.stringify(r.rows, null, 2)); pool.end(); })
  .catch(e => { console.error(e.message); pool.end(); });
