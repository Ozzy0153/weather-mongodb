const {User} = require("../models/user");

const login = async (req, res) => {
    const {username, password} = req.body;

    const user = await User.findOne({username, password});

    if (user) {
        req.session.username = username;
        res.redirect('/weather-app');
    } else {
        res.send('Invalid login credentials');
    }
}

module.exports = { login }