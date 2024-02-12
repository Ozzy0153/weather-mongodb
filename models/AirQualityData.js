const mongoose = require('mongoose');
const { Schema } = mongoose;

const airQualityDataSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    query: String,
    result: {
        status: String,
        data: {
            aqi: Number,
            city: {
                name: String
            },
            dominentpol: String,
            iaqi: {
                pm25: { v: Number },
                pm10: { v: Number },
                co: { v: Number },
                so2: { v: Number },
                no2: { v: Number }
            }
        }
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AirQualityData', airQualityDataSchema);
