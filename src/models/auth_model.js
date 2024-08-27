const dbPool = require('../config/db');

const userRegist = (username, email, password) => {
    const SQLQuery = `INSERT INTO AUTH (username, password, email) VALUES ('${username.toLowerCase()}','${password}','${email.toLowerCase()}')`;

    return dbPool.execute(SQLQuery);
}

const userRegistTableUser = (username) => {
    const SQLQuery = `INSERT INTO USERS (username) VALUES ('${username.toLowerCase()}')`;
    return dbPool.execute(SQLQuery);
}

const findByUsername = async (username) => {
    const [rows] = await dbPool.query(`SELECT * FROM AUTH WHERE USERNAME = ('${username}')`);
    return rows[0];
}



module.exports = {
    userRegist,
    findByUsername,
    userRegistTableUser,
}