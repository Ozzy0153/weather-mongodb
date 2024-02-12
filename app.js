require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const axios = require('axios');


const User = require("./models/user");
const WeatherData = require('./models/WeatherData');
const AirQualityData = require('./models/AirQualityData');
const MoonPhaseData = require('./models/MoonPhaseData');
const config = require("./DBConnection/config");

const app = express();
const port = process.env.PORT || 3000;

const OPENWEATHER_API_KEY = process.env.API_KEY;
const AQICN_API_KEY = process.env.AQICN_API_KEY;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const GEOCODING_API_KEY = process.env.OPENCAGE_API_KEY;

mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: process.env.SESSION_SECRET, resave: true, saveUninitialized: true }));
app.set('view engine', 'ejs');

async function ensureAdminUser() {
    const adminUser = await User.findOne({ username: "Orazaly" });
    if (!adminUser) {
        const admin = new User({
            username: "Orazaly",
            password: "Orazaly",
            isAdmin: true
        });
        await admin.save();
    }
}

ensureAdminUser().then(() => console.log('Checked admin user.'));

app.get('/admin', async (req, res) => {
    const users = await User.find();
    const messages = { success: req.query.success || '', error: req.query.error || '' };
    res.render('admin', { users, messages });
});

app.post('/admin/add', async (req, res) => {
    const { username, password, isAdmin } = req.body;
    try {
        await User.create({ username, password, isAdmin: isAdmin === 'on' });
        res.redirect('/admin?success=User added successfully');
    } catch (error) {
        res.redirect('/admin?error=Failed to add user');
    }
});

app.post('/admin/delete/:userId', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.userId);
        res.redirect('/admin?success=User deleted successfully');
    } catch (error) {
        res.redirect('/admin?error=Failed to delete user');
    }
});

app.get('/', (req, res) => {
    if (req.session.username) {
        res.render('index', { user: { username: req.session.username } });
    } else {
        res.render('index', { user: null });
    }
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username, password });
        if (user) {
            req.session.user = { id: user.id, username: user.username, isAdmin: user.isAdmin };
            if (user.isAdmin) {
                return res.redirect('/admin');
            } else {
                return res.redirect('/weather-app');
            }
        } else {
            return res.redirect('/');
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.redirect('/');
    }
});

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        next();
    } else {
        res.status(403).send('Access Denied');
    }
}

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    return res.redirect('/');
}

app.get('/weather-app', isAuthenticated, (req, res) => {
    res.render('weather-app', { username: req.session.user.username });
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        await User.create({ username, password });
        req.session.username = username;
        res.redirect('/login');
    } catch (error) {
        console.error('Registration error:', error);
        res.send('Failed to register.');
    }
});

app.get('/weather-app', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/');
    }
    res.render('weather-app', { username: req.session.username });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});

app.get('/onecall/:lat/:lon', async (req, res) => {
    const { lat, lon } = req.params;
    const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${OPENWEATHER_API_KEY}&units=metric`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/air-quality', (req, res) => {
    res.render('airquality', { title: 'Check Air Quality' });
});

app.get('/geocode/:city', async (req, res) => {
    const city = req.params.city;
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(city)}&key=${GEOCODING_API_KEY}`;

    try {
        const response = await axios.get(url);
        if (response.data.results.length > 0) {
            const { lat, lng: lon } = response.data.results[0].geometry;
            res.json({ lat, lon });
        } else {
            res.status(404).send('Location not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Failed to fetch geocoding data');
    }
});

app.get('/moonphase', (req, res) => {
    res.render('moonphase');
});

app.get('/api/moonphase/:cityName', async (req, res) => {
    const cityName = req.params.cityName;
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${OPENWEATHER_API_KEY}`;

    try {
        const geoResponse = await axios.get(geocodingUrl);
        if (geoResponse.data.length === 0) throw new Error('City not found');
        const { lat, lon } = geoResponse.data[0];

        const moonPhaseOptions = {
            method: 'GET',
            url: `https://moon-phase.p.rapidapi.com/basic?lat=${lat}&lon=${lon}`,
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'moon-phase.p.rapidapi.com'
            }
        };

        const moonPhaseResponse = await axios.request(moonPhaseOptions);
        const moonPhaseData = moonPhaseResponse.data;

        const savedMoonPhaseData = new MoonPhaseData({
            cityName: cityName,
            country: geoResponse.data[0].country,
            moonPhase: JSON.stringify(moonPhaseData),
            lat,
            lon
        });
        await savedMoonPhaseData.save();

        res.json(savedMoonPhaseData);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch or save moon phase data.' });
    }
});

app.get('/api/weather/:city', async (req, res) => {
    const city = req.params.city;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        const weather = new WeatherData({
            city: response.data.name,
            temperature: response.data.main.temp,
            description: response.data.weather[0].description,
            humidity: response.data.main.humidity,
            windSpeed: response.data.wind.speed,
            countryCode: response.data.sys.country,
            userId: req.session.user.id,
        });
        console.log("====", weather)
        await weather.save();
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/air-quality/:city', async (req, res) => {
    const city = req.params.city;
    const url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${AQICN_API_KEY}`;

    try {
        const response = await axios.get(url);
        if (response.data.status === "ok") {
            // Save air quality data to MongoDB Atlas
            const airQuality = new AirQualityData({
                user: req.session.user.id, // Assuming you have a user session
                query: city,
                result: response.data,
            });
            await airQuality.save();
            res.json(response.data);
        } else {
            throw new Error('Failed to fetch air quality data from API');
        }
    } catch (error) {
        console.error('Error fetching air quality data from API:', error);
        res.status(500).json({ error: 'Failed to fetch air quality data from API.' });
    }
});


app.get('/api/moonphase/:cityName', async (req, res) => {
    const cityName = req.params.cityName;
    const geocodingUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cityName)}&key=${GEOCODING_API_KEY}`;

    try {
        const geoResponse = await axios.get(geocodingUrl);
        if (geoResponse.data.results.length === 0) throw new Error('City not found');
        const { lat, lng: lon } = geoResponse.data.results[0].geometry;

        const moonPhaseOptions = {
            method: 'GET',
            url: `https://moon-phase.p.rapidapi.com/basic?lat=${lat}&lon=${lon}`,
            headers: {
                'X-RapidAPI-Key': RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'moon-phase.p.rapidapi.com'
            }
        };

        const moonPhaseResponse = await axios.request(moonPhaseOptions);
        const moonPhaseData = new MoonPhaseData({
            cityName: cityName,
            country: geoResponse.data.results[0].components.country,
            moonPhase: moonPhaseResponse.data.phase,
            userId: req.session.user.id,
        });
        await moonPhaseData.save();
        res.json(moonPhaseResponse.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch moon phase data.' });
    }
});

app.get('/admin/edit/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.redirect('/admin?error=User not found');
        }
        res.render('edit-user', { user });
    } catch (error) {
        console.error('Edit user error:', error);
        res.redirect('/admin?error=Failed to find user');
    }
});

app.post('/admin/update/:userId', async (req, res) => {
    const { username, password, isAdmin } = req.body;
    try {
        const updatedFields = {
            username,
            isAdmin: isAdmin === 'on'
        };
        if (password) {
            updatedFields.password = password;
        }
        await User.findByIdAndUpdate(req.params.userId, updatedFields);
        res.redirect('/admin?success=User updated successfully');
    } catch (error) {
        console.error('Update user error:', error);
        res.redirect('/admin?error=Failed to update user');
    }
});

app.get('/history', isAuthenticated, async (req, res) => {
    const userId = req.session.user.id;

    try {
        const weatherData = await WeatherData.find({ userId: userId }).sort({ createdAt: -1 }); // Sort by most recent
        const airQualityData = await AirQualityData.find({ user: userId }).sort({ createdAt: -1 }); // Adjusted to use `user` field
        const moonPhaseData = await MoonPhaseData.find().sort({ fetchedAt: -1 }); // No direct user relationship, consider adding if needed

        res.render('history', {
            username: req.session.user.username,
            weatherData: weatherData,
            airQualityData: airQualityData,
            moonPhaseData: moonPhaseData
        });
    } catch (error) {
        console.error('Error fetching history data:', error);
        res.status(500).send('Error fetching history data');
    }
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});