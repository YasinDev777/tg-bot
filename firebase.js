const admin = require('firebase-admin');
const serviceAccount = require('./clients-storage-30902-firebase-adminsdk-fbsvc-dd60e1c218.json'); // скачай из Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

module.exports = db;
