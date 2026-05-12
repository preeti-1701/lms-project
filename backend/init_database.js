#!/usr/bin/env node

/**
 * Database Initialization Script
 * ============================================================================
 * Automated database setup for the LMS application
 * Creates database, tables, and optionally seeds sample data
 * 
 * Usage:
 *   node init_database.js            (schema only)
 *   node init_database.js --seed     (schema + sample data)
 * ============================================================================
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const args = process.argv.slice(2);
const shouldSeed = args.includes('--seed');

// ============================================================================
// Configuration
// ============================================================================

const adminPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: 'postgres', // Connect to default database first
});

const dbPool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',
  database: process.env.PG_DATABASE || 'lms_db',
});

const dbName = process.env.PG_DATABASE || 'lms_db';

// ============================================================================
// Main Initialization Function
// ============================================================================

const initializeDatabase = async () => {
  console.log('\n' + '='.repeat(70));
  console.log('LMS Database Initialization');
  console.log('='.repeat(70) + '\n');

  try {
    // Step 1: Check if database exists
    console.log('Step 1: Checking if database exists...');
    const dbExists = await databaseExists();

    if (dbExists) {
      console.log(`✓ Database "${dbName}" already exists\n`);
    } else {
      console.log(`Creating database "${dbName}"...\n`);
      await createDatabase();
      console.log(`✓ Database "${dbName}" created successfully\n`);
    }

    // Step 2: Create schema
    console.log('Step 2: Creating database schema...');
    await createSchema();
    console.log('✓ Database schema created successfully\n');

    // Step 3: Seed sample data if requested
    if (shouldSeed) {
      console.log('Step 3: Importing sample data...');
      await seedSampleData();
      console.log('✓ Sample data imported successfully\n');
    }

    // Step 4: Verify setup
    console.log('Step 4: Verifying database setup...');
    await verifySetup();
    console.log('✓ Database verification complete\n');

    console.log('='.repeat(70));
    console.log('✓ Database initialization completed successfully!');
    console.log('='.repeat(70) + '\n');

  } catch (error) {
    console.error('\n✗ Database initialization failed!');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure PostgreSQL is running');
    console.error('2. Check .env file configuration');
    console.error('3. Verify PostgreSQL credentials');
    process.exit(1);
  } finally {
    await adminPool.end();
    await dbPool.end();
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

const databaseExists = async () => {
  try {
    const result = await adminPool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking database:', error.message);
    throw error;
  }
};

const createDatabase = async () => {
  try {
    await adminPool.query(`CREATE DATABASE "${dbName}"`);
  } catch (error) {
    if (error.code === '42P04') {
      // Database already exists, ignore
      return;
    }
    throw error;
  }
};

const createSchema = async () => {
  try {
    const schemaPath = path.join(__dirname, 'db.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await dbPool.query(schema);
  } catch (error) {
    console.error('Error creating schema:', error.message);
    throw error;
  }
};

const seedSampleData = async () => {
  try {
    const sampleDataPath = path.join(__dirname, 'sample_data.sql');
    const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
    await dbPool.query(sampleData);
  } catch (error) {
    console.error('Error seeding data:', error.message);
    throw error;
  }
};

const verifySetup = async () => {
  try {
    const result = await dbPool.query(`
      SELECT 
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM courses) as courses,
        (SELECT COUNT(*) FROM videos) as videos,
        (SELECT COUNT(*) FROM enrollments) as enrollments
    `);

    const counts = result.rows[0];
    console.log(`  Users: ${counts.users}`);
    console.log(`  Courses: ${counts.courses}`);
    console.log(`  Videos: ${counts.videos}`);
    console.log(`  Enrollments: ${counts.enrollments}`);
  } catch (error) {
    console.error('Error verifying setup:', error.message);
    throw error;
  }
};

// ============================================================================
// Run Initialization
// ============================================================================

console.log('Configuration:');
console.log(`  Host: ${process.env.PG_HOST || 'localhost'}`);
console.log(`  Port: ${process.env.PG_PORT || 5432}`);
console.log(`  Database: ${dbName}`);
console.log(`  Seed Data: ${shouldSeed ? 'Yes' : 'No'}\n`);

initializeDatabase().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
