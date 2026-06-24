import { SupabaseService } from './src/supabase/supabase.service';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '.env') });

async function test() {
  console.log('Testing Supabase Auth getUser()...');
  
  // Mock ConfigService
  const configService = {
    get: (key: string) => {
      const val = process.env[key];
      console.log(`ConfigService.get(${key}) =`, val ? '(present)' : 'undefined');
      return val;
    }
  } as ConfigService;

  const supabaseService = new SupabaseService(configService);
  const client = supabaseService.getClient();
  
  if (!client) {
    console.error('Supabase client is not initialized!');
    return;
  }

  try {
    console.log('Calling client.auth.getUser() with a dummy token...');
    // We try to call it to see if it throws an exception or crashes
    const response = await client.auth.getUser('some-dummy-token');
    console.log('getUser call completed successfully!');
    console.log('Response Error:', response.error?.message || 'No error');
    console.log('Response User:', response.data.user);
  } catch (err: any) {
    console.error('Supabase getUser crashed with exception:', err);
  }
}

test();
