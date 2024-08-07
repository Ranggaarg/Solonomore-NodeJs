require('dotenv').config()

const PORT = process.env.PORT || 4900;
const express = require('express');
const bcrypt = require('bcrypt');
const AuthRouter = require('./routes/auth_routes');
const UserRoutes = require('./routes/user_routes');

const app = express();

app.use(express.json());

app.use('/auth', AuthRouter);
app.use('/users', UserRoutes);


app.listen(PORT, () => {
    console.log('Server Berhasil di running di PORT', PORT)
})