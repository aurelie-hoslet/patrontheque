const fs = require('fs');
const axios = require('axios');

// Lis ton fichier de backup JSON
const patronsData = JSON.parse(fs.readFileSync('C:\\Users\\aureh\\Desktop\\patron\\mes-patrons-backup.json', 'utf8'));

// Envoie à l'API d'import
axios.post('http://localhost:5000/api/import', { patrons: patronsData })
  .then(response => {
    console.log('✅ Import réussi !');
    console.log('Patrons importés:', response.data.success);
    if (response.data.errors.length > 0) {
      console.log('Erreurs:', response.data.errors);
    }
  })
  .catch(error => {
    console.error('❌ Erreur:', error.message);
  });