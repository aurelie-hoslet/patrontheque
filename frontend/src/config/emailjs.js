// ─────────────────────────────────────────────────────────────────────────────
// Configuration EmailJS
// ─────────────────────────────────────────────────────────────────────────────
// 1. Créer un compte sur https://www.emailjs.com/
// 2. Ajouter un service email : Email Services > Add New Service
//    (Gmail recommandé — créer un compte Gmail dédié si besoin)
// 3. Créer un template : Email Templates > Create New Template
//    Variables à utiliser dans le template :
//      {{prenom}}   → Prénom ou pseudo de l'expéditeur
//      {{email}}    → Adresse email de l'expéditeur
//      {{objet}}    → Objet sélectionné
//      {{message}}  → Contenu du message
//    Réglages du template :
//      To Email  → SewingBox@proton.me
//      Reply To  → {{email}}
// 4. Récupérer les identifiants et les coller ci-dessous
// ─────────────────────────────────────────────────────────────────────────────

export const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID';   // Email Services  → Service ID
export const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';  // Email Templates → Template ID
export const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY';   // Account → General → Public Key
