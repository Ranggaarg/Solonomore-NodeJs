const dbPool = require('../config/db');

const userRegist = (username, email, password) => {
    const SQLQuery = `INSERT INTO AUTH (username, password, email) VALUES ('${username}','${password}','${email}')`;

    return dbPool.execute(SQLQuery);
}

const userRegistTableUser = (username) => {
    const SQLQuery = `INSERT INTO USERS (username) VALUES ('${username}')`;
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