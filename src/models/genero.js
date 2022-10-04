const { Schema, model } = require('mongoose');

const generoSchema = new Schema({
    nombre: String
});

const Genero = new model('Genero', generoSchema, 'genero');
module.exports = Genero;