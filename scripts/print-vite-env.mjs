import { loadEnv } from 'vite';

// Print what Vite would inject for a given mode.
const mode = process.argv[2] || 'development';
const env = loadEnv(mode, process.cwd(), 'VITE_');

console.log(`mode=${mode}`);
console.log('VITE_SUPABASE_URL=', env.VITE_SUPABASE_URL ?? '<missing>');
console.log(
  'VITE_SUPABASE_PUBLISHABLE_KEY=',
  env.VITE_SUPABASE_PUBLISHABLE_KEY ? `<set:${env.VITE_SUPABASE_PUBLISHABLE_KEY.slice(0, 12)}...>` : '<missing>'
);
