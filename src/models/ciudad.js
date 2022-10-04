const { Schema, model } = require('mongoose');

const ciudadSchema = new Schema({
    nombre: String
});

const Ciudad = new model('Ciudad', ciudadSchema, 'ciudad');

module.exports = Ciudad;