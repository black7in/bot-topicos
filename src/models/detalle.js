const { Schema, model } = require('mongoose');
const Stock = require('./stock');
const Escenario = require('./escenario');

const detalleSchema = new Schema({
    concierto: { type: Schema.Types.ObjectId, ref: 'Concierto' },
    escenario: { type: Schema.Types.ObjectId, ref: 'Escenario' },
    fecha: Date
});

// Retorna los _id de conciertos Disponibles sin repetir
detalleSchema.statics.obtenerIdConciertoDisponibles = async function(){
    const idDetallesConStock = await Stock.getDetalleConCapacidadDisponible();
    return await this.distinct('concierto', {detalle: {$in: idDetallesConStock}, fecha: {$gte : Date.now()}})
};

detalleSchema.statics.obtenerIdConciertoDisponiblesEnCiudad = async function( idCiudad){
    const idDetallesConStock = await Stock.getDetalleConCapacidadDisponible();
    const idsEscenarios = await Escenario.find({ciudad: idCiudad}, '_id');

    return await this.distinct('concierto', {detalle: {$in: idDetallesConStock}, escenario: {$in: idsEscenarios}, fecha: {$gte : Date.now()}})
};


const Detalle = new model('Detalle', detalleSchema, 'detalle');
module.exports = Detalle;