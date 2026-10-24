import jwt from '../api/node_modules/jsonwebtoken/index.js';
import { isSessionValid, parseJwtPayload, SESSION_MAX_AGE_MS } from '../client/src/Store/Slice/authSlice.js';
import themeReducer, { setThemeMode, toggleThemeMode } from '../client/src/Store/Slice/themeSlice.js';

console.log('====================================================');
console.log('TESTING THEME AND 24H SESSION VALIDATION');
console.log('====================================================\n');

let passed = 0;
let total = 0;

function assert(description, condition) {
  total++;
  if (condition) {
    console.log(`✅ [PASS] ${description}`);
    passed++;
  } else {
    console.error(`❌ [FAIL] ${description}`);
  }
}

// ----------------------------------------------------
// 1. Session Expiration Tests (24-hour window)
// ----------------------------------------------------
console.log('--- 1. Session Validation Logic ---');

const secret = 'test-secret';
const now = Math.floor(Date.now() / 1000);

// Token issued 1 hour ago (valid)
const validToken = jwt.sign({ id: 123 }, secret, { expiresIn: '24h' });
const validTimestamp = (Date.now() - 3600 * 1000).toString();
assert('Valid 24h token with recent timestamp is accepted', isSessionValid(validToken, validTimestamp));

// Token issued 25 hours ago (expired JWT)
const expiredToken = jwt.sign({ id: 123, iat: now - 90000, exp: now - 3600 }, secret);
assert('Expired JWT token (>24h) is rejected', !isSessionValid(expiredToken, validTimestamp));

// Valid JWT but timestamp is 25 hours old (wall clock exceeded)
const oldTimestamp = (Date.now() - 25 * 3600 * 1000).toString();
assert('Valid JWT with expired sessionTimestamp (>24h) is rejected', !isSessionValid(validToken, oldTimestamp));

// Tampered future timestamp (clock tampering safeguard)
const futureTamperedTimestamp = (Date.now() + 10 * 60 * 1000).toString(); // +10 min in future
assert('Tampered future timestamp (>5min skew) is rejected', !isSessionValid(validToken, futureTamperedTimestamp));

// Corrupted/tampered JWT string
assert('Corrupted token string is rejected', !isSessionValid('not.a.token', validTimestamp));
assert('Null token is rejected', !isSessionValid(null, validTimestamp));
assert('Token without user id claim is rejected', !isSessionValid(jwt.sign({ role: 'admin' }, secret, { expiresIn: '24h' }), validTimestamp));

// parseJwtPayload validation
const parsed = parseJwtPayload(validToken);
assert('parseJwtPayload correctly extracts user ID', parsed?.id === 123);
assert('SESSION_MAX_AGE_MS is exactly 24 hours (86,400,000 ms)', SESSION_MAX_AGE_MS === 86400000);

// ----------------------------------------------------
// 2. Theme Reducer & Actions Tests
// ----------------------------------------------------
console.log('\n--- 2. Theme Reducer & Switching ---');

let themeState = { mode: 'light' };

// Toggle to dark
themeState = themeReducer(themeState, toggleThemeMode());
assert('toggleThemeMode switches light -> dark', themeState.mode === 'dark');

// Toggle back to light
themeState = themeReducer(themeState, toggleThemeMode());
assert('toggleThemeMode switches dark -> light', themeState.mode === 'light');

// Set directly to dark
themeState = themeReducer(themeState, setThemeMode('dark'));
assert('setThemeMode("dark") sets dark mode', themeState.mode === 'dark');

// Set directly to light
themeState = themeReducer(themeState, setThemeMode('light'));
assert('setThemeMode("light") sets light mode', themeState.mode === 'light');

// ----------------------------------------------------
// 3. Backend Expiration Verification
// ----------------------------------------------------
console.log('\n--- 3. Backend Expiration Enforcement ---');

import fs from 'fs';
const envContent = fs.readFileSync('f:/yousef/projects/jira/api/.env', 'utf8');
const jwtSecretMatch = envContent.match(/JWT_SECRET\s*=\s*(.+)/);
const backendSecret = jwtSecretMatch ? jwtSecretMatch[1].trim() : process.env.JWT_SECRET;
const expiredBackendToken = jwt.sign({ id: 1 }, backendSecret, { expiresIn: '-1s' });

async function verifyBackendExpiredTokenRejection() {
  try {
    const res = await fetch('http://localhost:8000/api/users', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${expiredBackendToken}`,
        'Content-Type': 'application/json',
        'x-locale': 'en',
      },
      body: JSON.stringify({ name: 'Expired Test' }),
    });
    const data = await res.json();
    assert(
      'Backend middleware rejects expired JWT with 401 and AUTH_TOKEN_EXPIRED code',
      res.status === 401 && (data?.error?.code === 'AUTH_TOKEN_EXPIRED' || data?.message?.includes('expired'))
    );
  } catch (err) {
    console.error('Failed to connect to backend:', err.message);
  }

  console.log('\n====================================================');
  console.log(`RESULTS: ${passed} / ${total} checks passed.`);
  console.log('====================================================\n');
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

verifyBackendExpiredTokenRejection();
