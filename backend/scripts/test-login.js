const http = require('http');

const data = JSON.stringify({ email: 'candidate@demo.com', password: 'demo1234' });

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const parsed = JSON.parse(body);
    console.log('Full response:', JSON.stringify(parsed, null, 2));
    console.log('\n--- Key check ---');
    console.log('data.user.email_verified:', parsed.data?.user?.email_verified);
    console.log('typeof email_verified:', typeof parsed.data?.user?.email_verified);
  });
});

req.on('error', e => console.error('Error:', e.message));
req.write(data);
req.end();
