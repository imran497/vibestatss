-- Check if users table exists in public schema
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_name = 'users'
AND table_schema = 'public';

-- List all tables in public schema
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
