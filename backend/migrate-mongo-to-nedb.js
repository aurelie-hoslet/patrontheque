/**
 * Script de migration MongoDB → NeDB
 *
 * Utilisation :
 *   node migrate-mongo-to-nedb.js
 *
 * Prérequis : MongoDB doit être démarré et accessible sur localhost:27017
 * Ce script copie toutes les données vers les fichiers NeDB dans backend/data/
 */

const { MongoClient } = require('mongodb');
const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

const MONGO_URI = 'mongodb://localhost:27017/patron-manager';
const DATA_DIR = path.join(__dirname, 'data');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const collections = [
  { mongo: 'patrons',     file: 'patrons.db' },
  { mongo: 'tissus',      file: 'tissus.db' },
  { mongo: 'projets',     file: 'projets.db' },
  { mongo: 'dealers',     file: 'dealers.db' },
  { mongo: 'inspirations',file: 'inspirations.db' },
  { mongo: 'wishitems',   file: 'wishlist.db' },
];

async function migrate() {
  console.log('🔄 Connexion à MongoDB...');
  let client;

  try {
    client = new MongoClient(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log('✅ Connecté à MongoDB');
  } catch (err) {
    console.error('❌ Impossible de se connecter à MongoDB :', err.message);
    console.error('   Assurez-vous que MongoDB est démarré (mongod)');
    process.exit(1);
  }

  const db = client.db();
  let totalMigrated = 0;

  for (const { mongo, file } of collections) {
    const dbPath = path.join(DATA_DIR, file);

    // Vérifier si le fichier NeDB existe déjà et contient des données
    if (fs.existsSync(dbPath) && fs.statSync(dbPath).size > 0) {
      const nedb = new Datastore({ filename: dbPath, autoload: true });
      const existing = await nedb.findAsync({});
      if (existing.length > 0) {
        console.log(`⏭️  ${mongo} : ${existing.length} document(s) déjà dans NeDB, ignoré`);
        continue;
      }
    }

    try {
      const mongoDocs = await db.collection(mongo).find({}).toArray();

      if (mongoDocs.length === 0) {
        console.log(`📭 ${mongo} : collection vide`);
        continue;
      }

      const nedb = new Datastore({ filename: dbPath, autoload: true });

      // Convertir les ObjectId MongoDB en strings
      const converted = mongoDocs.map(doc => {
        const { _id, ...rest } = doc;
        const newDoc = { ...rest };

        // Convertir les champs ObjectId de référence en strings
        if (newDoc.patronId) newDoc.patronId = newDoc.patronId.toString();
        if (newDoc.tissuId) newDoc.tissuId = newDoc.tissuId.toString();

        return newDoc;
      });

      await nedb.insertAsync(converted);
      console.log(`✅ ${mongo} : ${converted.length} document(s) migré(s)`);
      totalMigrated += converted.length;

    } catch (err) {
      console.error(`❌ Erreur migration ${mongo} :`, err.message);
    }
  }

  await client.close();
  console.log(`\n🎉 Migration terminée ! ${totalMigrated} document(s) au total.`);
  console.log(`📁 Données dans : ${DATA_DIR}`);
}

migrate().catch(err => {
  console.error('Erreur fatale :', err);
  process.exit(1);
});
