const { db } = require('../firebase');

exports.generateNextUserId = async () => {
    const snapshot = await db.collection('users')
        .orderBy('created_at', 'desc')
        .limit(1)
        .get();

    let lastId = 1200;
    if (!snapshot.empty) {
        const lastDoc = snapshot.docs[0].data();
        const prevId = parseInt(lastDoc.id);
        lastId = (prevId % 100 === 99) ? prevId + 2 : prevId + 1;
    } else {
        lastId += 1;
    }

    return lastId;
};
