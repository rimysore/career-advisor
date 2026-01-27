require('dotenv').config();
const mongoose = require('mongoose');

async function test() {
  try {
    console.log('Testing MongoDB connection...\n');
    console.log('URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected successfully!\n');

    // List all databases
    const admin = mongoose.connection.getClient().db('admin');
    const databases = await admin.admin().listDatabases();
    console.log('Available databases:');
    databases.databases.forEach(db => console.log(`  - ${db.name}`));

    // Check current database
    console.log(`\nCurrent database: ${mongoose.connection.name}`);

    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in career_advisor:');
    collections.forEach(col => console.log(`  - ${col.name}`));

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

test();
