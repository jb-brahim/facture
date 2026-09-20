const mongoose = require('mongoose');

const OLD_URI = 'mongodb://localhost:27017/invoicing_system';
const NEW_URI = 'mongodb+srv://brahimojaballi_db_user:GjNb6thBa9c3b8rM@cluster0.vq9kw5e.mongodb.net/facture?retryWrites=true&w=majority&appName=Cluster0';

async function migrate() {
  console.log('--- STARTING MONGO MIGRATION ---');

  // 1. Connect to Old Database
  console.log('Connecting to OLD database:', OLD_URI);
  const oldConn = await mongoose.createConnection(OLD_URI).asPromise();
  console.log('Connected to OLD database successfully.');

  // 2. Connect to New Database (Atlas)
  console.log('Connecting to NEW Atlas database:', NEW_URI);
  const newConn = await mongoose.createConnection(NEW_URI).asPromise();
  console.log('Connected to NEW Atlas database successfully.');

  // 3. Get all collections from Old Database
  const oldDb = oldConn.db;
  const newDb = newConn.db;

  const collections = await oldDb.listCollections().toArray();
  console.log(`Found ${collections.length} collections to migrate:`, collections.map(c => c.name));

  for (const colInfo of collections) {
    const colName = colInfo.name;
    if (colName.startsWith('system.')) continue;

    console.log(`\nMigrating collection: "${colName}"...`);
    const oldCol = oldDb.collection(colName);
    const newCol = newDb.collection(colName);

    const docs = await oldCol.find({}).toArray();
    console.log(`Found ${docs.length} documents in "${colName}"`);

    if (docs.length > 0) {
      // Clear existing in new collection first to avoid duplicates
      await newCol.deleteMany({});
      // Insert docs
      const result = await newCol.insertMany(docs);
      console.log(`Successfully migrated ${result.insertedCount} documents to collection "${colName}" on Atlas.`);
    } else {
      console.log(`Collection "${colName}" is empty, skipped.`);
    }
  }

  console.log('\n--- MIGRATION COMPLETED SUCCESSFULLY ---');
  await oldConn.close();
  await newConn.close();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed with error:', err);
  process.exit(1);
});
