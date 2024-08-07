const bcrypt = require('bcrypt');
const AuthModel = require('../models/auth_model');
const {pool} = require('../config/db');

const userRegist = async (req, res) => {
    const{username, password, email} = req.body 
    if(!username || !email || !password ) {
        return res.status(400).json({
            message : 'All fields required'
        })
    }
    const existingUser = await AuthModel.findByUsername(username);
    if(existingUser) {
        return res.status(400).json({
            message : 'User Already Exists'
        })
    }
    try {
        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);
        await AuthModel.userRegist(username, email, hashPassword);
        await AuthModel.userRegistTableUser(username);
        res.status(201).json({
            message : 'User Registered Successfully',
            data : {
                username :  username,
                password : hashPassword,
                email : email
            }
        })
    } catch (error) {
        res.status(500).json({
            message : 'Server Error',
            serverMessage : error.message
        })
    }
}

const userLogin = async(req, res) => {
    const {username, password} = req.body;
    if(!username) {
        return res.status(400).json({
            message : 'All fields required'
        })
    }
    try {
        const existingUsername = await AuthModel.findByUsername(username);
        if(!existingUsername) {
            return res.status(400).json({
                message : 'Invalid username or password'
            })
        }

        const existingPassword = await pool.promise().query(`SELECT PASSWORD FROM AUTH WHERE USERNAME = ('${username}')`)
        const ismatch = await bcrypt.compare(password, existingUsername.password);
        if(!ismatch) {
            return res.status(400).json({
                message : 'Invalid username or password'
            })
        }

        res.status(201).json({
            message : 'Login Successfully'
        })
    } catch (error) {
        res.status(500).json({
            message : 'Server Error',
            serverMessage : error.message,
        })
    }
}

module.exports = {
    userRegist,
    userLogin,
}