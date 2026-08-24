const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5002,
  path: '/api/auth/members',
  method: 'GET'
};

const req = http.request(options, res => {
  console.log(`STATUS: ${res.statusCode}`);
  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.end();
