const { Schema, model } = require('mongoose');

const escenarioSchema = new Schema({
    nombre: String,
    ciudad: { type: Schema.Types.ObjectId, ref: 'Ciudad' },

});

const Escenario = new model('Escenario', escenarioSchema, 'escenario');

module.exports = Escenario;