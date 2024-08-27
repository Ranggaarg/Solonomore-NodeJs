const UserModel = require('../models/user_model');
const { parse } = require('csv-parse');
const kMeans = require('../utils/k_means');
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

const updateGenderData = async (req, res) => {
    const {body} = req;
    const {username} = req.params;
    const existingUser = await UserModel.findByUsername(username);
    if(!existingUser) {
        return res.status(400).json({
            message : "Data Not Found"
        })
    }
    try {
        await UserModel.updateGenderData(username, body);
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

const updateAgeData = async (req, res) => {
    const {body} = req;
    const {username} = req.params;
    const existingUser = await UserModel.findByUsername(username);
    if(!existingUser) {
        return res.status(400).json({
            message : "Data Not Found"
        })
    }
    try {
        await UserModel.updateAgeData(username, body);
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

const rankReverseMap = {
    0: 'warrior',
    1: 'elite',
    2: 'master',
    3: 'grandmaster',
    4: 'epic',
    5: 'legend',
    6: 'mythic',
    7: 'glorious mythic'
};

const roleReverseMap = {
    0: 'goldlane',
    1: 'midlane',
    2: 'explane',
    3: 'jungler',
    4: 'roamer'
};

const genderReverseMap = {
    0: 'pria',
    1: 'wanita'
};

const playStyleReverseMap = {
    0: 'aggresive',
    1: 'defensive',
    2: 'balance'
};

const communicationStyleReverseMap = {
    0: 'voice',
    1: 'chat',
    2: 'silent'
};

const gameModeReverseMap = {
    0: 'rank',
    1: 'classic',
    2: 'custom',
    3: 'brawl'
};
// Function to read Excel file and store data in database
const uploadExcel = async (req, res) => {
    try {
        if (req.files.length === 0) {
            return res.status(400).send({ message: 'No file uploaded' });
        }

        const file = req.files[0];
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

        console.log(worksheet);
        for (const row of worksheet) {
            
            await UserModel.createUser(row);
        }

        res.status(200).send({ message: 'Data successfully uploaded and saved!' });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Function to convert data to float
const convertToFloatWithUsername = (user) => ({
    username: user.username,
    data: [
        parseFloat(rankMap[user.rank]),
        parseFloat(roleMap[user.role]),
        parseFloat(user.age),
        parseFloat(genderMap[user.gender]),
        parseFloat(playStyleMap[user.play_style]),
        parseFloat(communicationStyleMap[user.communication_style]),
        parseFloat(gameModeMap[user.game_mode])
    ]
});

const filterPlayersByRole = (players, rolesNeeded) => {    
    if (!Array.isArray(rolesNeeded)) {
        throw new Error('rolesNeeded must be an array');
    }
    const filteredPlayers = players.filter(player => rolesNeeded.includes(player.role));
    return filteredPlayers;
};

const filterUniqueRoles = (users) => {
    const roleSet = new Set();
    const uniqueUsers = [];

    for (const user of users) {
        if (!roleSet.has(user.role)) {
            roleSet.add(user.role);
            uniqueUsers.push(user);
        }
        if (uniqueUsers.length >= 5) break;
    }

    return uniqueUsers;
};


const findSimilarPlayers = async (req, res) => {
    try {
        const users = await UserModel.getAllUser(req.body.role);

        if (!Array.isArray(users)) {
            return res.status(500).send({ message: 'Error retrieving users from database' });
        }

        const rolesNeeded = req.body.roles_needed;

        if (!Array.isArray(rolesNeeded)) {
            return res.status(400).send({ message: 'roles_needed must be an array' });
        }

        const filteredUsers = filterPlayersByRole(users, rolesNeeded);

        if (filteredUsers.length === 0) {
            return res.status(404).send({ message: 'No suitable players found' });
        }

        const userDataWithUsername = filteredUsers.map(user => convertToFloatWithUsername(user));

        const data = userDataWithUsername.map(user => user.data);

        // console.log('Data:', data);

        const userToMatch = convertToFloatWithUsername({
            username: 'currentUser', 
            rank: req.body.rank,
            role: req.body.role,
            age: req.body.age,
            gender: req.body.gender,
            play_style: req.body.play_style,
            communication_style: req.body.communication_style,
            game_mode: req.body.game_mode
        }).data;

        // console.log('User to Match:', userToMatch);

        const k = 7;
        const { clusters } = kMeans(data, k);

        const clusterData = clusters.map((cluster, clusterIndex) => {
            const usersInCluster = cluster.map(point => {
                const index = data.findIndex(d => JSON.stringify(d) === JSON.stringify(point));
                const user = userDataWithUsername[index];
                return {
                    username: user.username,
                    rank: rankReverseMap[user.data[0]],
                    role: roleReverseMap[user.data[1]],
                    age: user.data[2],
                    gender: genderReverseMap[user.data[3]],
                    play_style: playStyleReverseMap[user.data[4]],
                    communication_style: communicationStyleReverseMap[user.data[5]],
                    game_mode: gameModeReverseMap[user.data[6]]
                };
            });

            return {
                cluster: clusterIndex + 1,
                users: usersInCluster
            };
        });

        let closestUsers = [];
        let minDistance = Infinity;

        clusters.forEach(cluster => {
            cluster.forEach(point => {
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
                    closestUsers = cluster;
                }
            });
        });

        const uniqueRoleUsers = filterUniqueRoles(closestUsers.map(point => {
            const index = data.findIndex(d => JSON.stringify(d) === JSON.stringify(point));
            const user = userDataWithUsername[index];
            return {
                username: user.username,
                rank: rankReverseMap[user.data[0]],
                role: roleReverseMap[user.data[1]],
                age: user.data[2],
                gender: genderReverseMap[user.data[3]],
                play_style: playStyleReverseMap[user.data[4]],
                communication_style: communicationStyleReverseMap[user.data[5]],
                game_mode: gameModeReverseMap[user.data[6]]
            };
        }), rolesNeeded);

        res.status(200).json({
            data : uniqueRoleUsers,
            dataClusters : clusterData,
        });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};


module.exports = {
    getDataUser,
    UpdateUserPreference,
    updateAgeData,
    updateGenderData,
    uploadExcel,
    findSimilarPlayers,
}