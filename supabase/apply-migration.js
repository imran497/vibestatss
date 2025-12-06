#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    db: {
      schema: 'public',
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function runMigration() {
  console.log('🚀 Running database migration...\n');

  const migrationPath = path.join(__dirname, 'migrations', '20241203000000_initial_schema.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');

  try {
    // Execute the SQL migration using rpc
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
      // If rpc doesn't exist, we need to execute statements individually
      console.log('⚠️  RPC method not available, executing via REST API...\n');

      // Split the SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        if (statement) {
          console.log('Executing:', statement.substring(0, 60) + '...');
          const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
            method: 'POST',
            headers: {
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ query: statement })
          });

          if (!response.ok) {
            const text = await response.text();
            console.error('Error response:', text);
          }
        }
      }

      console.log('\n⚠️  Migration may need manual execution.');
      console.log('📍 Go to Supabase SQL Editor:');
      console.log(`   ${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', 'https://app.')}/project/_/sql/new`);
      console.log('\n📋 Copy and paste the SQL from:');
      console.log('   supabase/migrations/20241203000000_initial_schema.sql');
      console.log('\n   Then click "Run" ✅');
    } else {
      console.log('✅ Migration completed successfully!');
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n📍 Please run migration manually:');
    console.log(`   Go to: ${process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', 'https://app.')}/project/_/sql/new`);
    console.log('   Copy SQL from: supabase/migrations/20241203000000_initial_schema.sql');
  }
}

runMigration();
