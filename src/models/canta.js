const { Schema, model } = require('mongoose');
const Artista = require('./artista');

const cantaSchema = new Schema({
    concierto: { type: Schema.Types.ObjectId, ref: 'Concierto' },
    artista: { type: Schema.Types.ObjectId, ref: 'Artista' }
});

cantaSchema.statics.obtenerConciertosDondeCantaUnArtista = async function(idConciertos, artista) {
    const result = [];
    const infoArtista = await Artista.findOne({nombre: artista});
    var cantaEnConcierto  = await Canta.find({çoncierto: {$in: idConciertos}, artista: infoArtista._id});
    for( var i = 0; i < cantaEnConcierto.length; i++){
        result.push(cantaEnConcierto[i].concierto);
    }
    return result;
}

const Canta = new model('Canta', cantaSchema, 'canta');

module.exports = Canta;