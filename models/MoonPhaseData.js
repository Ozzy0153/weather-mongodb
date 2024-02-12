const mongoose = require('mongoose');

const moonPhaseDataSchema = new mongoose.Schema({
    cityName: String,
    country: String,
    moonPhase: String,
    lat: Number,
    lon: Number,
    fetchedAt: { type: Date, default: Date.now }
});

const MoonPhaseData = mongoose.model('MoonPhaseData', moonPhaseDataSchema);

module.exports = MoonPhaseData;
