module.exports = function apiLogger(req, res, next) {
  const start = Date.now();

  // Log request
  console.log(`\n📥 REQUEST → ${req.method} ${req.originalUrl}`);
  if (Object.keys(req.query).length) console.log('   Query:', req.query);
  if (Object.keys(req.body).length) console.log('   Body:', req.body);

  // Capture response
  const oldJson = res.json;
  res.json = function (data) {
    const time = Date.now() - start;

    console.log(`📤 RESPONSE ← ${req.method} ${req.originalUrl}`);
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Time: ${time}ms`);
    console.log('   Response:', data);

    return oldJson.call(this, data);
  };

  next();
};
