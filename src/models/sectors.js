const { Schema, model } = require('mongoose');

const sectorSchema = new Schema({
    event: String,
    general: {
        price: Number,
        free: Number,
        name: String
    },
    preference: {
        price: Number,
        free: Number,
        name: String
    },
    vip: {
        price: Number,
        free: Number,
        name: String
    },
});

const Sectors = new model('sectors', sectorSchema);

module.exports = { Sectors }