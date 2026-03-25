/**
 * Script de données de test — Sewing Box
 * Usage : node backend/seed-test-data.js
 */

const path = require('path');
const Datastore = require('@seald-io/nedb');

const DATA_DIR = process.env.USER_DATA_PATH || path.join(__dirname, 'data');

const tissusDb  = new Datastore({ filename: path.join(DATA_DIR, 'tissus.db'),  autoload: true });
const projetsDb = new Datastore({ filename: path.join(DATA_DIR, 'projets.db'), autoload: true });

const genId = () => `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

// ── TISSUS ────────────────────────────────────────────────────────────────────

const TISSUS = [
  {
    nom: 'Viscose EcoVero imprimée fleurs liberty',
    type: 'Chaîne et trame',
    couleur: 'Fond écru, fleurs multicolores',
    quantite: 2.5,
    provenance: 'Jolie Bobo',
    notes: 'Très fluide, épingles fines recommandées. Coup de cœur absolu.',
  },
  {
    nom: 'Velours côtelé camel bio',
    type: 'Chaîne et trame',
    couleur: 'Camel',
    quantite: 1.5,
    provenance: 'Les Trouvailles d\'Amandine',
    notes: 'Côte fine, très doux. Bio certifié GOTS.',
  },
  {
    nom: 'Coton huilé beige',
    type: 'Chaîne et trame',
    couleur: 'Beige naturel',
    quantite: 1,
    provenance: 'Tissus Houlès',
    notes: 'Pour doublure jupe Goji.',
  },
  {
    nom: 'Popeline liberty Betsy',
    type: 'Chaîne et trame',
    couleur: 'Bleu petites fleurs',
    quantite: 0.5,
    provenance: 'Liberty London',
    notes: 'Reste de 0,5m après chemise ratée. Prévoir pour col ou ceinture.',
  },
  {
    nom: 'Gabardine stretch noire',
    type: 'Chaîne et trame',
    couleur: 'Noir',
    quantite: 2,
    provenance: 'Bennytex',
    notes: 'Toile validée sur ce tissu. Bonne tenue, confortable.',
  },
  {
    nom: 'Jersey de laine mérinos rouille',
    type: 'Maille',
    couleur: 'Rouille',
    quantite: 2.2,
    provenance: 'La Petite Épicerie',
    notes: 'Aiguille stretch 90 obligatoire. Doux et chaud.',
  },
  {
    nom: 'Lin lavé terracotta',
    type: 'Chaîne et trame',
    couleur: 'Terracotta',
    quantite: 3,
    provenance: 'Au fil des couleurs',
    notes: 'Pré-lavé 60°. Pour combi Aster, nécessite toile.',
  },
  {
    nom: 'Viscose unie brique',
    type: 'Chaîne et trame',
    couleur: 'Brique',
    quantite: 2,
    provenance: 'Tissus Price',
    notes: 'Doublure combi Aster.',
  },
  {
    nom: 'Coton imprimé étoiles dorées',
    type: 'Chaîne et trame',
    couleur: 'Marine / or',
    quantite: 1.8,
    provenance: 'Ma Petite Mercerie',
    notes: 'Pas encore de projet en tête. Trop beau pour résister.',
  },
  {
    nom: 'Sweat molletonné vieux rose',
    type: 'Maille',
    couleur: 'Vieux rose',
    quantite: 1.5,
    provenance: 'Bennytex',
    notes: 'Pour un hoodie ou sweat-shirt à capuche.',
  },
];

// ── PROJETS ───────────────────────────────────────────────────────────────────

function etapes(liste, faitesJusqua = 0) {
  return liste.map((titre, i) => ({ id: genId(), titre, faite: i < faitesJusqua }));
}

const ETAPES_BASE = [
  'Préparation du patron',
  'Tissu lavé et repassé',
  'Préparation de la mercerie',
  'Découpage du tissu',
  'Assemblage',
  'Finitions',
];

const PROJETS_TEMPLATE = [
  {
    nom: 'Robe Magnolia – Fleurs d\'été',
    statut: 'En cours',
    notes: 'Version B avec manches courtes. Tissu super fluide, prévoir des épingles fines. FBA +2cm déjà tracée.',
    dateDebut: '2024-04-15',
    etapes: etapes(ETAPES_BASE, 3),
    _tissuNom: 'Viscose EcoVero imprimée fleurs liberty',
  },
  {
    nom: 'Jupe Goji – Velours côtelé',
    statut: 'Idée',
    notes: 'Rallonger de 5cm. Poches passepoilées prévues.',
    etapes: etapes(ETAPES_BASE, 0),
    _tissuNom: 'Velours côtelé camel bio',
  },
  {
    nom: 'Chemise – Liberty catastrophe',
    statut: 'Idée',
    notes: 'Col raté 2x. Reprendre à tête reposée avec tuto vidéo.',
    dateDebut: '2024-02-01',
    etapes: etapes([...ETAPES_BASE, 'Revoir le col (tutoriel)'], 4),
    _tissuNom: 'Popeline liberty Betsy',
  },
  {
    nom: 'Pantalon Safran – Gabardine stretch',
    statut: 'Idée',
    notes: 'Toile déjà validée. Prévoir boutons fantaisie dorés (4). Ajustement mollets -1cm.',
    etapes: etapes(ETAPES_BASE, 1),
    _tissuNom: 'Gabardine stretch noire',
  },
  {
    nom: 'Cardigan Courcelles – Maille douillette',
    statut: 'En cours',
    notes: 'Utiliser aiguille stretch 90. Faire ourlet double pour le poids.',
    dateDebut: '2024-05-02',
    etapes: etapes([...ETAPES_BASE, 'Ourlet double face'], 4),
    _tissuNom: 'Jersey de laine mérinos rouille',
  },
  {
    nom: 'Combi Aster – Projet ambitieux',
    statut: 'Idée',
    notes: 'Nécessite toile. Fermeture invisible dos 60cm + boutons déco. Poches italiennes.',
    etapes: etapes([
      'Faire la toile',
      ...ETAPES_BASE,
      'Poser fermeture invisible',
      'Boutonnière et boutons déco',
    ], 1),
    _tissuNom: 'Lin lavé terracotta',
  },
];

// ── INSERTION ─────────────────────────────────────────────────────────────────

async function run() {
  console.log('📁 Base de données :', DATA_DIR);

  // Vérifier si des données de test existent déjà
  const existingTissus  = await tissusDb.findAsync({});
  const existingProjets = await projetsDb.findAsync({});

  if (existingTissus.length > 0 || existingProjets.length > 0) {
    console.log(`⚠️  Base non vide (${existingTissus.length} tissus, ${existingProjets.length} projets).`);
    console.log('   Ajout des données de test quand même...\n');
  }

  // Insérer les tissus
  const now = new Date();
  const tissusDocs = await Promise.all(
    TISSUS.map(t => tissusDb.insertAsync({ ...t, dateAjout: now }))
  );
  console.log(`✅ ${tissusDocs.length} tissus insérés`);

  // Construire un index nom → _id
  const tissuIndex = {};
  tissusDocs.forEach(t => { tissuIndex[t.nom] = t._id; });

  // Insérer les projets avec tissuId résolu
  const projetsDocs = await Promise.all(
    PROJETS_TEMPLATE.map(({ _tissuNom, ...p }) => {
      const tissuId = tissuIndex[_tissuNom] || undefined;
      return projetsDb.insertAsync({ ...p, tissuId, dateCreation: now });
    })
  );
  console.log(`✅ ${projetsDocs.length} projets insérés`);

  console.log('\n🎉 Données de test insérées avec succès !');
  console.log('   Relance l\'app pour voir les résultats.');
  process.exit(0);
}

run().catch(err => {
  console.error('❌ Erreur :', err.message);
  process.exit(1);
});
