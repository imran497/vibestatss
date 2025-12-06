#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials in .env.local');
  process.exit(1);
}

const migrationFile = process.argv[2];
if (!migrationFile) {
  console.log('Usage: node supabase/run-migration-simple.js <migration-file>');
  process.exit(1);
}

const migrationPath = path.join(__dirname, 'migrations', migrationFile);
if (!fs.existsSync(migrationPath)) {
  console.error(`❌ Migration file not found: ${migrationFile}`);
  process.exit(1);
}

console.log(`📋 Reading migration: ${migrationFile}`);
const sql = fs.readFileSync(migrationPath, 'utf8');

console.log('\n🚀 Running migration via Supabase REST API...\n');
console.log('⚠️  Note: Complex migrations should be run via Supabase SQL Editor');
console.log('📍 Go to:', supabaseUrl.replace('https://', 'https://app.') + '/project/_/sql/new');
console.log('\n📝 Copy and paste this SQL:\n');
console.log('─'.repeat(80));
console.log(sql);
console.log('─'.repeat(80));
console.log('\n✅ Then click "Run" in the SQL Editor\n');
