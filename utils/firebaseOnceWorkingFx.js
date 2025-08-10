const { db } = require('../firebase');

exports.getUserOnce = async (inputId) => {
    const query = await db.collection('users').where('id', '==', inputId).limit(1).get();
    return query;
}

exports.addUser = async (newUser) => {
    await db.collection('users').add(newUser);
}