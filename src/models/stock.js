const { Schema, model } = require('mongoose');

const stockSchema = new Schema({
    detalle: { type: Schema.Types.ObjectId, ref: 'Detalle' },
    sector: { type: Schema.Types.ObjectId, ref: 'Sector' },
    capacidad: Number,
    precio: Number,
});

// RETORNA CAPACIDAD DISPONIBLE DE CADA DETALLE
stockSchema.statics.getCapacidadDisponible = async function(){
    const stocks = await Stock.aggregate(
        [
            /*{
                $match: { detalle: new mongoose.Types.ObjectId('63375a852b32472c261a55fd')}
            },*/
            {
                $group: {
                    _id: '$detalle',
                    capacidadMax: { $sum: '$capacidad'  }
                }
            }
        ]
    );
    return stocks;
}

//RETORNA DETALLES QUE TIENEN CAPACIDAD > 0
stockSchema.statics.getDetalleConCapacidadDisponible = async function() {
    const capacidadDeCadaDetalle = await Stock.getCapacidadDisponible();
    const detallesDisponibles = [];
    for (var i = 0; i < capacidadDeCadaDetalle.length; i++) {
        if(capacidadDeCadaDetalle[i].capacidadMax > 0){
            detallesDisponibles.push(capacidadDeCadaDetalle[i]._id);
        }
    }

    return detallesDisponibles;
}


const Stock = new model('Stock', stockSchema, 'stock');

module.exports = Stock;