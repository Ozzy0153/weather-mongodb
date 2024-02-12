const {User} = require("../models/user");

const register = async (req, res) => {
    const {username, password} = req.body;

    await User.create({username, password});

    req.session.username = username;
    res.redirect('/weather-app');
}

module.exports = { register }