import { loadEnv } from 'vite';

const mode = process.argv[2] || 'development';
const env = loadEnv(mode, process.cwd());

const keys = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
];

for (const k of keys) {
  const v = env[k];
  if (!v) {
    console.log(`${k}=<missing>`);
  } else if (k.includes('KEY')) {
    console.log(`${k}=<set:${v.slice(0, 12)}...>`);
  } else {
    console.log(`${k}=${v}`);
  }
}
