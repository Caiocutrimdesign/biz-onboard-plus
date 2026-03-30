import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manuel .env parsing
function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) return {};
  
  const content = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  content.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
      env[key.trim()] = value.join('=').trim();
    }
  });
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdmin() {
  const email = 'admrastremix@gmail.com';
  const password = 'Rastre018@';
  const name = 'Admin Rastremix';

  console.log(`Creating admin account: ${email}...`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nome: name,
        tipo: 'admin'
      }
    }
  });

  if (error) {
    console.error('Error creating user:', error.message);
    return;
  }

  if (data.user) {
    console.log('User created successfully:', data.user.id);
    
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user.id,
        nome: name,
        tipo: 'admin',
      });

    if (profileError) {
      console.error('Error creating profile:', profileError.message);
    } else {
      console.log('Profile created successfully');
    }
  } else {
    console.log('User creation returned no data (check-email might be required)');
  }
}

createAdmin();
