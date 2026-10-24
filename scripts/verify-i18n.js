import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function getLeaves(obj, prefix = '') {
  let leaves = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(leaves, getLeaves(v, fullKey));
    } else {
      leaves[fullKey] = v;
    }
  }
  return leaves;
}

function extractInterpolationVars(str) {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{\{([^}]+)\}\}/g) || [];
  return matches.map((m) => m.replace(/[{}]/g, '').trim()).sort();
}

function auditBundle(name, enPath, faPath) {
  console.log(`\n========================================`);
  console.log(`AUDITING ${name}`);
  console.log(`========================================`);

  if (!fs.existsSync(enPath)) {
    console.error(`Missing EN file: ${enPath}`);
    return false;
  }
  if (!fs.existsSync(faPath)) {
    console.error(`Missing FA file: ${faPath}`);
    return false;
  }

  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const faData = JSON.parse(fs.readFileSync(faPath, 'utf8'));

  const enLeaves = getLeaves(enData);
  const faLeaves = getLeaves(faData);

  const enKeys = Object.keys(enLeaves);
  const faKeys = Object.keys(faLeaves);

  let errors = 0;

  // Check missing keys in FA
  const missingInFa = enKeys.filter((k) => !(k in faLeaves));
  if (missingInFa.length > 0) {
    console.error(`❌ Keys in EN but missing in FA (${missingInFa.length}):`, missingInFa);
    errors += missingInFa.length;
  }

  // Check missing keys in EN
  const missingInEn = faKeys.filter((k) => !(k in enLeaves));
  if (missingInEn.length > 0) {
    console.error(`❌ Keys in FA but missing in EN (${missingInEn.length}):`, missingInEn);
    errors += missingInEn.length;
  }

  // Check empty or whitespace values
  for (const [k, v] of Object.entries(enLeaves)) {
    if (!v || typeof v !== 'string' || !v.trim()) {
      console.error(`❌ Empty or invalid EN value for key: ${k}`);
      errors++;
    }
  }
  for (const [k, v] of Object.entries(faLeaves)) {
    if (!v || typeof v !== 'string' || !v.trim()) {
      console.error(`❌ Empty or invalid FA value for key: ${k}`);
      errors++;
    }
  }

  // Check interpolation variables match
  for (const k of enKeys) {
    if (k in faLeaves) {
      const enVars = extractInterpolationVars(enLeaves[k]);
      const faVars = extractInterpolationVars(faLeaves[k]);
      if (JSON.stringify(enVars) !== JSON.stringify(faVars)) {
        console.error(
          `❌ Mismatched interpolation variables for "${k}":\n   EN: [${enVars.join(', ')}]\n   FA: [${faVars.join(', ')}]`
        );
        errors++;
      }
    }
  }

  if (errors === 0) {
    console.log(`✅ All ${enKeys.length} keys in ${name} are perfectly synchronized!`);
    return true;
  } else {
    console.error(`❌ Found ${errors} issues in ${name}`);
    return false;
  }
}

const backendOk = auditBundle(
  'Backend Locales (api/locales)',
  path.join(rootDir, 'api/locales/en.json'),
  path.join(rootDir, 'api/locales/fa.json')
);

const clientOk = auditBundle(
  'Frontend Locales (client/src/locales)',
  path.join(rootDir, 'client/src/locales/en.json'),
  path.join(rootDir, 'client/src/locales/fa.json')
);

if (backendOk && clientOk) {
  console.log('\n🎉 ALL TRANSLATION AUDITS PASSED WITH ZERO DEFECTS!\n');
  process.exit(0);
} else {
  console.error('\n❌ Translation audit failed!\n');
  process.exit(1);
}
