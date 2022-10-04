const { Schema, model } = require('mongoose');
const Visita = require('./visita');
const Artista = require('./artista');
const Genero = require('./genero');
const Ciudad = require('./ciudad');

const interesSchema = new Schema({
    visita: { type: Schema.Types.ObjectId, ref: 'Visita' },
    artista: [{ type: Schema.Types.ObjectId, ref: 'Artista' }],
    genero: [{ type: Schema.Types.ObjectId, ref: 'Genero' }],
    sector: [{ type: Schema.Types.ObjectId, ref: 'Sector' }],
    ciudad: [{ type: Schema.Types.ObjectId, ref: 'Ciudad' }],
});

// getVisitaSchema(facebookId)

// registrar Genero
interesSchema.statics.registrarGenero = async function (facebookId, nombreGenero) {
    var idVisita = await Visita.getUltimaVisita(facebookId);
    var idGenero = await Genero.findOne({ nombre: nombreGenero });
    
    var interes = await Interes.findOne({ visita: idVisita });
    if (interes) {
        var yaExiste = await Interes.findOne({ visita: idVisita, _id: interes._id, genero: [idGenero._id]});
        if(!yaExiste){
            await Interes.updateOne(
                { _id: interes._id, visita: idVisita },
                { $push: { 'genero': idGenero } }
            );

        }
    } else {
        var interes = new Interes({
            visita: idVisita,
            artista: [],
            genero: [idGenero],
            sector: [],
            ciudad: []
        });
        await interes.save();
    }

}

// registrar Artista
interesSchema.statics.registrarArtista = async function (facebookId, nombreArtista) {
    var idVisita = await Visita.getUltimaVisita(facebookId);
    var idArtista = await Artista.findOne({ nombre: nombreArtista });
    var genero = await Genero.findOne({_id: idArtista.genero});

    var interes = await Interes.findOne({ visita: idVisita });
    if (interes) {
        var yaExiste = await Interes.findOne({ visita: idVisita, _id: interes._id, artista: [idArtista._id]});
        if(!yaExiste){
            await Interes.updateOne(
                { _id: interes._id, visita: idVisita },
                { $push: { 'artista': idArtista } }
            );

        }
    } else {
        var interes = new Interes({
            visita: idVisita,
            artista: [idArtista],
            genero: [],
            sector: [],
            ciudad: []
        });
        await interes.save();
    }
    await Interes.registrarGenero(facebookId, genero.nombre);
}

// regisrar sector

// registrar ciudad
interesSchema.statics.registrarCiudad = async function (facebookId, nombreCiudad) {
    var idVisita = await Visita.getUltimaVisita(facebookId);
    var idCiudad = await Ciudad.findOne({ nombre: nombreCiudad });

    var interes = await Interes.findOne({ visita: idVisita });
    if (interes) {
        var yaExiste = await Interes.findOne({ visita: idVisita, _id: interes._id, ciudad: [idCiudad._id]});
        if(!yaExiste){
            await Interes.updateOne(
                { _id: interes._id, visita: idVisita },
                { $push: { 'ciudad': idCiudad } }
            );

        }
    } else {
        var interes = new Interes({
            visita: idVisita,
            artista: [],
            genero: [],
            sector: [],
            ciudad: [idCiudad]
        });
        await interes.save();
    }
}

const Interes = new model('Interes', interesSchema, 'interes');

module.exports = Interes;