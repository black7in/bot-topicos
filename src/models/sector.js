const { Schema, model } = require('mongoose');

const sectorSchema = new Schema({
    nombre: String,
});

const Sector = new model('Sector', sectorSchema, 'sector');
module.exports = Sector;