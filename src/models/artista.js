const { Schema, model } = require('mongoose');

const artistaSchema = new Schema({
    nombre: String,
    genero: { type: Schema.Types.ObjectId, ref: 'Genero' }
});

const Artista = new model('Artista', artistaSchema, 'artista');

module.exports = Artista;