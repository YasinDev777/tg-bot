const admin = require('firebase-admin');

const base64 = process.env.FIREBASE_CONFIG_BASE64;
const jsonString = Buffer.from(base64, 'base64').toString('utf8');
const serviceAccount = JSON.parse(jsonString);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
module.exports = { db };
