import('node-fetch').then(fetch => {
  fetch.default('https://airis-backend.onrender.com/api/auth/members').then(res => res.text()).then(console.log);
});
