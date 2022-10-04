const { Schema, model } = require('mongoose');
const Detalle = require('./detalle');
const Canta = require('./canta');
const Ciudad = require('./ciudad');


const conciertoSchema = new Schema({
    nombre: String,
    banner: String,
    descripcion: String
});

// Retorna Todos los conciertos disponibles
conciertoSchema.statics.obtenerTodosDisponibles = async function () {
    const detalles = await Detalle.obtenerIdConciertoDisponibles();
    return await this.find({ _id: { $in: detalles } });
};

// Retorna Todos los conciertos disponibles donde canta un Artista
conciertoSchema.statics.obtenerConciertoDisponiblePorArtista = async function (artista) {
    const idConciertos = await Detalle.obtenerIdConciertoDisponibles();
    const idConciertoDondeCantaUnArtista = await Canta.obtenerConciertosDondeCantaUnArtista( idConciertos, artista);
    return await this.find({ _id: { $in: idConciertoDondeCantaUnArtista } });
}

conciertoSchema.statics.obtenerConciertoDosponiblePorCiudad = async function(nombreCiudad) {
    const idCiudad = await Ciudad.findOne({nombre: nombreCiudad});
    const idConciertosDeUnaCiudad = await Detalle.obtenerIdConciertoDisponiblesEnCiudad(idCiudad);
    return await this.find({ _id: { $in: idConciertosDeUnaCiudad } });
}

const Concierto = new model('Concierto', conciertoSchema, 'concierto');

module.exports = Concierto;