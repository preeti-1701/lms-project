#!/usr/bin/env node

/**
 * Password Hash Generator Utility
 * ============================================================================
 * Use this script to generate bcrypt hashes for passwords to use in the
 * sample_data.sql file or for testing purposes.
 * 
 * Usage:
 *   node generate_password_hash.js "your_password"
 *   
 * Example:
 *   node generate_password_hash.js "LmsTest@123"
 *   
 * Output:
 *   $2b$10$... (bcrypt hash)
 * ============================================================================
 */

const bcrypt = require('bcrypt');

const generateHash = async (password) => {
  if (!password) {
    console.error('Error: Please provide a password as an argument');
    console.error('Usage: node generate_password_hash.js "password"');
    process.exit(1);
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('\n✓ Password Hash Generated:');
    console.log(`  Original: ${password}`);
    console.log(`  Hashed: ${hashedPassword}\n`);
    console.log('Copy this hash and use it in sample_data.sql\n');
  } catch (error) {
    console.error('Error generating hash:', error.message);
    process.exit(1);
  }
};

// Get password from command line argument
const password = process.argv[2];
generateHash(password);
