const { Schema, model } = require('mongoose');

const eventSchema = new Schema({
    event: String,
    name: String,
    description: String,
    date: Date,
    city: String,
    thumbnail: String
});

const Events = new model('events', eventSchema);

module.exports = { Events }