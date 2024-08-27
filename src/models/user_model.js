const dbPool = require('../config/db');

const getDataUser = async (username) => {
    const SQLQuery = `SELECT * FROM USERS WHERE USERNAME = ('${username}')`;
    return dbPool.execute(SQLQuery);
}

const updateGenderData = async (username, body) => {
    const SQLQuery = `UPDATE USERS SET gender = '${body.gender}' WHERE USERNAME = '${username}'`;
    return dbPool.execute(SQLQuery);
}

const updateAgeData = async (username, body) => {
    const SQLQuery = `UPDATE USERS SET age = '${body.age}' WHERE USERNAME = '${username}'`;
    return dbPool.execute(SQLQuery);
}

const findByUsername = async (username) => {
    const [rows] = await dbPool.query(`SELECT * FROM AUTH WHERE USERNAME = ('${username}')`);
    return rows[0];
}

const updateUserPreference = async (username, body) => {
    const SQLQuery = `UPDATE USERS SET rank = '${body.rank}', role = '${body.role}', play_style = '${body.play_style}', communication_style = '${body.communication_style}', game_mode = '${body.game_mode}' WHERE USERNAME = '${username}'`;
    return dbPool.execute(SQLQuery);
}

const createUser = async (user) => {
    const {username, rank, role, age, gender, play_style, communication_style, game_mode} = user;
    const{result} = await dbPool.execute(`INSERT INTO USERS (username, rank, role, age, gender, play_style, communication_style, game_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [username.toLowerCase(), rank.toLowerCase(), role.toLowerCase(), age, gender.toLowerCase(), play_style.toLowerCase(), communication_style.toLowerCase(), game_mode.toLowerCase()])
    return result;
}

const getAllUser = async () => {
    try {
        const [rows, fields] = await dbPool.execute('SELECT * FROM users');
        console.log(rows); // Log hasil query untuk memastikan data
        return rows;
    } catch (error) {
        console.error('Database error:', error); // Log kesalahan database
        throw error;
    }         
}

module.exports = {
    getDataUser,
    findByUsername,
    updateUserPreference,
    createUser,
    getAllUser,
    updateAgeData,
    updateGenderData
}