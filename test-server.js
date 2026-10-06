const http = require('http');

async function test() {
  console.log('--- Iniciando prueba local de endpoints ---');

  // Test haircuts module
  const { getHaircutPrompt, getHaircutsList } = require('./haircuts');
  const list = getHaircutsList();
  console.log(`[OK] Catálogo cargado: ${list.length} cortes disponibles.`);
  const prompt1 = getHaircutPrompt('textured_crop', 'OVAL');
  console.log(`[OK] Prompt para textured_crop (OVAL): "${prompt1.slice(0, 60)}..."`);
  const prompt2 = getHaircutPrompt('pompadour_fade', 'ROUND');
  console.log(`[OK] Prompt para pompadour_fade (ROUND): "${prompt2.slice(0, 60)}..."`);

  // Start app on test port
  process.env.PORT = '4005';
  process.env.FAL_KEY = 'test_key_for_validation';
  
  // Clear require cache if needed
  delete require.cache[require.resolve('./server')];
  // Since server.js calls app.listen, we can test via http on port 4005
  require('./server');

  await new Promise(resolve => setTimeout(resolve, 800));

  function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const req = http.request({
        hostname: 'localhost',
        port: 4005,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (_) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  // 1. Test GET /health
  const healthRes = await request('GET', '/health');
  console.log(`[GET /health] Status: ${healthRes.status}`, healthRes.body);
  if (healthRes.status !== 200 || healthRes.body.status !== 'ok') {
    throw new Error('Fallo en GET /health');
  }

  // 2. Test GET /api/cortes
  const cortesRes = await request('GET', '/api/cortes');
  console.log(`[GET /api/cortes] Status: ${cortesRes.status}, Total: ${cortesRes.body.total}`);
  if (cortesRes.status !== 200 || !cortesRes.body.cortes) {
    throw new Error('Fallo en GET /api/cortes');
  }

  // 3. Test POST /api/generar-corte (validación: imageUrl vacía)
  const failRes1 = await request('POST', '/api/generar-corte', { corteId: 'textured_crop' });
  console.log(`[POST /api/generar-corte (sin imageUrl)] Status: ${failRes1.status}`, failRes1.body);
  if (failRes1.status !== 400) {
    throw new Error('Fallo en validación de imageUrl');
  }

  // 4. Test POST /api/generar-corte (validación: corteId vacío)
  const failRes2 = await request('POST', '/api/generar-corte', { imageUrl: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' });
  console.log(`[POST /api/generar-corte (sin corteId)] Status: ${failRes2.status}`, failRes2.body);
  if (failRes2.status !== 400) {
    throw new Error('Fallo en validación de corteId');
  }

  console.log('\n✅ ¡TODAS LAS PRUEBAS LOCALES PASARON CON ÉXITO!');
  process.exit(0);
}

test().catch(err => {
  console.error('❌ Error en pruebas:', err);
  process.exit(1);
});
