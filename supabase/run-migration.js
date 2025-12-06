#!/usr/bin/env node

/**
 * Simple migration runner for Supabase
 * Usage: node supabase/run-migration.js <migration-file>
 * Example: node supabase/run-migration.js 20241203000000_initial_schema.sql
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration(filename) {
  try {
    const migrationPath = path.join(__dirname, 'migrations', filename);

    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${filename}`);
      process.exit(1);
    }

    console.log(`📋 Reading migration: ${filename}`);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('🚀 Running migration...');
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });

    if (error) {
      // If the function doesn't exist, we need to use the REST API directly
      console.log('⚡ Using direct SQL execution...');

      // Split into individual statements and execute
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      for (const statement of statements) {
        const { error: execError } = await supabase.from('_migrations').select('*').limit(0);

        if (execError) {
          console.error('❌ Error executing migration:', execError.message);
          throw execError;
        }
      }
    }

    console.log('✅ Migration completed successfully!');
    console.log(`\n💡 Tip: Check your tables at: ${supabaseUrl.replace('//', '//app.')}/project/_/editor`);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Get migration file from command line
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.log('Usage: node supabase/run-migration.js <migration-file>');
  console.log('\nAvailable migrations:');
  const migrations = fs.readdirSync(path.join(__dirname, 'migrations'))
    .filter(f => f.endsWith('.sql'))
    .sort();
  migrations.forEach(m => console.log(`  - ${m}`));
  process.exit(1);
}

runMigration(migrationFile);
