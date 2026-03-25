#!/usr/bin/env node
/**
 * Import de favoris Chrome vers la collection dealers de MongoDB.
 *
 * Usage :
 *   node import-bookmarks.js <chemin-vers-fichier.html> "<nom du dossier>"
 *
 * Exemple :
 *   node import-bookmarks.js "C:/Users/aureh/Downloads/bookmarks.html" "Shops couture"
 */

const fs = require('fs');
const mongoose = require('mongoose');
const Dealer = require('./models/Dealer');

const MONGODB_URI = 'mongodb://localhost:27017/patron-manager';

// ── Arguments ────────────────────────────────────────────────────────────────

const [,, bookmarksFile, folderName] = process.argv;

if (!bookmarksFile || !folderName) {
  console.error('Usage : node import-bookmarks.js <fichier.html> "<nom du dossier>"');
  process.exit(1);
}

if (!fs.existsSync(bookmarksFile)) {
  console.error(`Fichier introuvable : ${bookmarksFile}`);
  process.exit(1);
}

// ── Parser ───────────────────────────────────────────────────────────────────

function extractBookmarksFromFolder(html, folder) {
  // Cherche le H3 correspondant au dossier (insensible à la casse)
  const escaped = folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const folderRegex = new RegExp(`<H3[^>]*>\\s*${escaped}\\s*<\\/H3>`, 'i');
  const folderMatch = folderRegex.exec(html);

  if (!folderMatch) {
    console.error(`\nDossier "${folder}" introuvable dans le fichier.`);
    console.error('Dossiers disponibles :');
    const allFolders = [...html.matchAll(/<H3[^>]*>([^<]+)<\/H3>/gi)];
    allFolders.forEach(m => console.error(`  - ${m[1].trim()}`));
    process.exit(1);
  }

  // Extrait le bloc DL qui suit immédiatement le dossier
  const afterFolder = html.slice(folderMatch.index + folderMatch[0].length);
  const dlStart = afterFolder.search(/<DL/i);

  if (dlStart === -1) {
    console.error('Dossier vide ou mal formé.');
    return [];
  }

  // Trouve le </DL> fermant en comptant la profondeur d'imbrication
  let depth = 0;
  let i = dlStart;
  while (i < afterFolder.length) {
    if (/<DL/i.test(afterFolder.slice(i, i + 3))) {
      depth++;
      i += 3;
    } else if (/<\/DL/i.test(afterFolder.slice(i, i + 4))) {
      depth--;
      if (depth === 0) { i += 4; break; }
      i += 4;
    } else {
      i++;
    }
  }

  const dlContent = afterFolder.slice(dlStart, i);

  // Extrait tous les liens <A HREF="...">nom</A>
  const linkRegex = /<A\s[^>]*HREF="([^"]+)"[^>]*>([^<]+)<\/A>/gi;
  const bookmarks = [];
  let match;

  while ((match = linkRegex.exec(dlContent)) !== null) {
    const url = match[1].trim();
    const nom = match[2].trim();
    if (url.startsWith('http')) {
      bookmarks.push({ nom, url });
    }
  }

  return bookmarks;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const html = fs.readFileSync(bookmarksFile, 'utf-8');

  const bookmarks = extractBookmarksFromFolder(html, folderName);
  console.log(`\n${bookmarks.length} favori(s) trouvé(s) dans le dossier "${folderName}"\n`);

  if (bookmarks.length === 0) process.exit(0);

  await mongoose.connect(MONGODB_URI);
  console.log('Connecté à MongoDB\n');

  let inserted = 0;
  let skipped = 0;

  for (const { nom, url } of bookmarks) {
    const existing = await Dealer.findOne({ url });
    if (existing) {
      console.log(`  ⏭  Doublon ignoré   : ${nom}`);
      skipped++;
    } else {
      await Dealer.create({ nom, url, categories: [], dejaCliente: false, description: '' });
      console.log(`  ✅ Importé          : ${nom}`);
      inserted++;
    }
  }

  console.log(`\n─────────────────────────────────────`);
  console.log(`  Importés : ${inserted}`);
  console.log(`  Ignorés  : ${skipped} (doublons)`);
  console.log(`─────────────────────────────────────\n`);

  await mongoose.disconnect();
}

main().catch(err => {
  console.error('\nErreur :', err.message);
  process.exit(1);
});
