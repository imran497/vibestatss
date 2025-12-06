#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyDatabase() {
  console.log('🔍 Checking database connection...\n');

  try {
    // Try to query the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Users table does NOT exist');
      console.log('Error:', error.message);
      console.log('\n📋 You need to run the migration manually.');
      console.log('👉 Go to: https://app.supabase.com');
      console.log('   → SQL Editor → New Query');
      console.log('   → Copy paste from: supabase/migrations/20241203000000_initial_schema.sql');
    } else {
      console.log('✅ Users table EXISTS!');
      console.log(`📊 Current user count: ${data?.length || 0}`);
      if (data && data.length > 0) {
        console.log('\n👥 Users:');
        data.forEach(user => {
          console.log(`   - ${user.name} (@${user.username})`);
        });
      }
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

verifyDatabase();
