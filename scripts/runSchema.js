const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is not set in environment variables.');
  process.exit(1);
}

const loadSqlStatements = (filePath) => {
  const sql = fs.readFileSync(filePath, 'utf8');
  return sql
    .split(/;\s*(?=\n|$)/)
    .map((stmt) => stmt.trim())
    .filter((stmt) => stmt.length);
};

const run = async () => {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL.');

    const statements = loadSqlStatements(schemaPath);
    console.log(`Executing ${statements.length} SQL statements from schema...`);

    for (const statement of statements) {
      await client.query(statement);
    }

    console.log('Database schema executed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Failed to execute schema:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
};

run();

