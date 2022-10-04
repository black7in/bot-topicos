const { Schema, model } = require('mongoose');
const Prospecto = require('./prospecto');

const visitaSchema = new Schema({
    prospecto: { type: Schema.Types.ObjectId, ref: 'Prospecto' },
    first_name: String,
    last_name: String,
    email: String,
    phone: Number,
},
{
    timestamps: { createdAt: true, updatedAt: false }
});

visitaSchema.statics.getUltimaVisita = async function(facebookId) {
    var idProspecto = await Prospecto.findOne({facebookId: facebookId});
    var idVisita = await Visita.findOne({}, {}, { sort: { 'createdAt' : -1 }, prospecto: idProspecto._id });
    return idVisita._id;
};

const Visita = new model('Visita', visitaSchema, 'visita');

module.exports = Visita