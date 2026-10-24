const BASE_URL = 'http://localhost:8000';

async function testEndpoint(name, url, options, validator) {
  try {
    const res = await fetch(`${BASE_URL}${url}`, options);
    const data = await res.json().catch(() => null);
    const contentLang = res.headers.get('content-language');
    const passed = validator(res.status, data, contentLang);
    if (passed) {
      console.log(`✅ [PASS] ${name}`);
      return true;
    } else {
      console.error(`❌ [FAIL] ${name}\n   Status: ${res.status}\n   Headers: content-language=${contentLang}\n   Body:`, JSON.stringify(data, null, 2));
      return false;
    }
  } catch (err) {
    console.error(`❌ [ERROR] ${name}:`, err.message);
    return false;
  }
}

async function runAllTests() {
  console.log('====================================================');
  console.log('RUNNING BACKEND I18N AUTOMATED VERIFICATION');
  console.log('====================================================\n');

  let passedCount = 0;
  let totalCount = 0;

  async function check(name, url, options, validator) {
    totalCount++;
    const ok = await testEndpoint(name, url, options, validator);
    if (ok) passedCount++;
  }

  // 1. Health English
  await check(
    'Health Check - English via x-locale',
    '/health',
    { headers: { 'x-locale': 'en' } },
    (status, body, lang) => status === 200 && body?.message === 'System is healthy' && lang === 'en'
  );

  // 2. Health Persian
  await check(
    'Health Check - Persian via x-locale',
    '/health',
    { headers: { 'x-locale': 'fa' } },
    (status, body, lang) => status === 200 && body?.message === 'سامانه فعال و پایدار است' && lang === 'fa'
  );

  // 3. Health via Accept-Language header
  await check(
    'Health Check - Persian via Accept-Language',
    '/health',
    { headers: { 'Accept-Language': 'fa-IR,fa;q=0.9,en;q=0.8' } },
    (status, body, lang) => status === 200 && body?.message === 'سامانه فعال و پایدار است' && lang === 'fa'
  );

  // 4. Health via query param ?lang=fa
  await check(
    'Health Check - Persian via query param ?lang=fa',
    '/health?lang=fa',
    {},
    (status, body, lang) => status === 200 && body?.message === 'سامانه فعال و پایدار است' && lang === 'fa'
  );

  // 5. Default fallback to English
  await check(
    'Health Check - Fallback to English when unspecified or unsupported',
    '/health',
    { headers: { 'x-locale': 'fr' } },
    (status, body, lang) => status === 200 && body?.message === 'System is healthy' && lang === 'en'
  );

  // 6. Validation Error English
  await check(
    'Validation Error - English',
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-locale': 'en' },
      body: JSON.stringify({}),
    },
    (status, body) =>
      (status === 422 || status === 400) &&
      body?.error?.code === 'VALIDATION_FAILED' &&
      Array.isArray(body?.errors) &&
      body.errors.some((e) => e.message.includes('required'))
  );

  // 7. Validation Error Persian
  await check(
    'Validation Error - Persian',
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-locale': 'fa' },
      body: JSON.stringify({}),
    },
    (status, body) =>
      (status === 422 || status === 400) &&
      body?.error?.code === 'VALIDATION_FAILED' &&
      Array.isArray(body?.errors) &&
      body.errors.some((e) => e.message.includes('الزامی است'))
  );

  // 8. Auth Invalid Credentials - English
  await check(
    'Auth Invalid Credentials - English',
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-locale': 'en' },
      body: JSON.stringify({ phoneNumber: '09129999999', password: 'wrongpassword' }),
    },
    (status, body) =>
      status === 401 &&
      body?.error?.code === 'AUTH_INVALID_CREDENTIALS' &&
      body?.error?.message === 'Invalid phone number or password'
  );

  // 9. Auth Invalid Credentials - Persian
  await check(
    'Auth Invalid Credentials - Persian',
    '/api/auth/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-locale': 'fa' },
      body: JSON.stringify({ phoneNumber: '09129999999', password: 'wrongpassword' }),
    },
    (status, body) =>
      status === 401 &&
      body?.error?.code === 'AUTH_INVALID_CREDENTIALS' &&
      body?.error?.message === 'شماره موبایل یا رمز عبور نامعتبر است'
  );

  // 10. Concurrency Safety Test (30 simultaneous interleaved requests)
  console.log('\nTesting 30 concurrent interleaved requests...');
  const concurrentPromises = [];
  let concurrentPassed = true;

  for (let i = 0; i < 30; i++) {
    const expectedLocale = i % 2 === 0 ? 'en' : 'fa';
    const expectedMsg = expectedLocale === 'en' ? 'System is healthy' : 'سامانه فعال و پایدار است';

    concurrentPromises.push(
      fetch(`${BASE_URL}/health`, {
        headers: { 'x-locale': expectedLocale },
      })
        .then(async (r) => {
          const b = await r.json();
          const l = r.headers.get('content-language');
          if (b.message !== expectedMsg || l !== expectedLocale) {
            console.error(`Concurrency leak detected on request #${i}! Expected: ${expectedLocale}, got: ${l} (${b.message})`);
            concurrentPassed = false;
          }
        })
        .catch(() => {
          concurrentPassed = false;
        })
    );
  }

  await Promise.all(concurrentPromises);
  totalCount++;
  if (concurrentPassed) {
    passedCount++;
    console.log('✅ [PASS] Concurrency Safety: 30 interleaved requests handled with zero state leakage');
  } else {
    console.error('❌ [FAIL] Concurrency Safety failed');
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passedCount} / ${totalCount} checks passed.`);
  console.log('====================================================\n');

  if (passedCount === totalCount) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests();
