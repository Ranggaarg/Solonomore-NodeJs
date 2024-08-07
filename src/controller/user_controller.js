const UserModel = require('../models/user_model');
const kmeans = require('node-kmeans');
const { plot } = require('nodeplotlib');
const { parse } = require('csv-parse');
const XLSX = require('xlsx');

const getDataUser = async (req, res) => {
    const username = req.params.username;
    try {
        const user = await UserModel.getDataUser(username)
        if(!user) {
            res.status(400).json({
                message : "Data Not Found"
            })
        }
        res.status(200).json({
            message : "Get Data Success",
            data : user[0]
        })
    } catch (error) {
        res.status(500).json({
            message : "Server Error",
            serverMessage : error.message
        })
    }
}

const UpdateDataUser = async (req, res) => {
    const {body} = req;
    const {username} = req.params;
    const existingUser = await UserModel.findByUsername(username);
    if(!existingUser) {
        return res.status(400).json({
            message : "Data Not Found"
        })
    }
    try {
        await UserModel.updateDataUser(username, body);
        res.status(200).json({
            message : 'Update Data Success',
            data: {
                username,
                ...body
            }
        })
    } catch (error) {
        res.status(500).json({
            message : 'Server Error',
            serverMessage : error.message,
        })
    }
}

const UpdateUserPreference = async (req, res) => {
    const {body} = req;
    const {username} = req.params;
    const existingUser = await UserModel.findByUsername(username);
    if(!existingUser){
        res.status(400).json({
            message : "Data Not Found"
        })
    }
    try {
        await UserModel.updateUserPreference(username, body);
        res.status(200).json({
            message : 'Update Data Success',
            data : {
                username,
                ...body
            }
        })
    } catch (error) {
        res.status(500).json({
            message : "Server Error",
            serverMessage : error.message,
        })
    }
}

const rankMap = {
    'warrior': 0,
    'elite': 1,
    'master': 2,
    'grandmaster': 3,
    'epic': 4,
    'legend': 5,
    'mythic': 6,
    'glorious mythic': 7
};

const roleMap = {
    'goldlane': 0,
    'midlane': 1,
    'explane': 2,
    'jungler': 3,
    'roamer': 4
};

const genderMap = {
    'pria': 0,
    'wanita': 1
};

const playStyleMap = {
    'aggresive': 0,
    'defensive': 1,
    'balance': 2
};

const communicationStyleMap = {
    'voice': 0,
    'chat': 1,
    'silent': 2
};

const gameModeMap = {
    'rank': 0,
    'classic': 1,
    'custom': 2,
    'brawl': 3
};

// Function to read Excel file and store data in database
const uploadExcel = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send({ message: 'No file uploaded' });
        }

        const file = req.file;
        const fileType = file.mimetype;
        let worksheet;

        if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
        } else if (fileType === 'text/csv' || fileType === 'text/plain') {
            const csvData = file.buffer.toString('utf-8');
            worksheet = await new Promise((resolve, reject) => {
                parse(csvData, { columns: true }, (err, records) => {
                    if (err) reject(err);
                    resolve(records);
                });
            });
        } else {
            return res.status(400).send({ message: 'Unsupported file format' });
        }

        for (const row of worksheet) {
            await createUser(row);
        }

        res.status(200).send({ message: 'Data successfully uploaded and saved!' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Function to convert data to float
const convertToFloat = (user) => [
    parseFloat(rankMap[user.rank]),
    parseFloat(roleMap[user.role]),
    parseFloat(user.age),
    parseFloat(genderMap[user.gender]),
    parseFloat(playStyleMap[user.play_style]),
    parseFloat(communicationStyleMap[user.communication_style]),
    parseFloat(gameModeMap[user.game_mode])
];

// Function to find similar players using k-means clustering
const findSimilarPlayers = async (req, res) => {
    try {
        const users = await UserModel.getAllUser();

        if (!Array.isArray(users)) {
            return res.status(500).send({ message: 'Error retrieving users from database' });
        }

        const data = users.map(user => convertToFloat(user));

        console.log('Data:', data);

        const userToMatch = convertToFloat({
            rank: req.body.rank,
            role: req.body.role,
            age: req.body.age,
            gender: req.body.gender,
            play_style: req.body.play_style,
            communication_style: req.body.communication_style,
            game_mode: req.body.game_mode
        });

        // Find optimal number of clusters using Elbow Method
        const ssd = [];
        for (let k = 1; k <= 10; k++) {
            kmeans.clusterize(data, { k: k }, (err, result) => {
                if (err) res.status(500).send({ message: err.message });
                const sumSquaredDistances = result.reduce((acc, cluster) => {
                    return acc + cluster.error;
                }, 0);
                ssd.push(sumSquaredDistances);
            });
        }

        // Plot Elbow curve
        plot([{ x: Array.from({ length: 10 }, (_, i) => i + 1), y: ssd, type: 'scatter' }], {
            title: 'Elbow Method for Optimal k',
            xaxis: { title: 'Number of clusters k' },
            yaxis: { title: 'Sum of Squared Distances' }
        });

        // Assuming the optimal k found by Elbow Method is 7 for this example
        kmeans.clusterize(data, { k: 7 }, (err, result) => {
            if (err) res.status(500).send({ message: err.message });

            let closestUsers = [];
            let minDistance = Infinity;

            result.forEach(cluster => {
                cluster.cluster.forEach(point => {
                    const distance = Math.sqrt(
                        Math.pow(userToMatch[0] - point[0], 2) +
                        Math.pow(userToMatch[1] - point[1], 2) +
                        Math.pow(userToMatch[2] - point[2], 2) +
                        Math.pow(userToMatch[3] - point[3], 2) +
                        Math.pow(userToMatch[4] - point[4], 2) +
                        Math.pow(userToMatch[5] - point[5], 2) +
                        Math.pow(userToMatch[6] - point[6], 2)
                    );

                    if (distance < minDistance) {
                        minDistance = distance;
                        closestUsers = cluster.cluster;
                    }
                });
            });

            res.status(200).send(closestUsers.slice(0, 5));
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


module.exports = {
    getDataUser,
    UpdateDataUser,
    UpdateUserPreference,
    uploadExcel,
    findSimilarPlayers,
}