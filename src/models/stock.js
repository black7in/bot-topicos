const { Schema, model } = require('mongoose');
const Calzado = require('./calzado');

const stockSchema = new Schema({
    calzado: { type: Schema.Types.ObjectId, ref: 'Calzado' },
    talla:[{
        numero: Number,
        cantidad: Number
    }],
    precio: Number,
});

stockSchema.statics.getListaDeCalzadosParaDeporte = async function(nombreDeporte) {
    const idsCalzados = await Calzado.getIdsParaDeporte(nombreDeporte);
    const calzados = await this.find({calzado: {$in: idsCalzados}});
    return calzados;
}

stockSchema.statics.getListaDeCalzadosParaDeportePorColor = async function(nombreDeporte, color) {
    const idsCalzados = await Calzado.getIdsParaDeportePorColor(nombreDeporte, color);
    const calzados = await this.find({calzado: {$in: idsCalzados}});
    return calzados;
}

stockSchema.statics.getListaDeCalzadosParaDeportePorGenero = async function(nombreDeporte, genero) {
    const idsCalzados = await Calzado.getIdsParaDeportePorGenero(nombreDeporte, genero);
    const calzados = await this.find({calzado: {$in: idsCalzados}});
    return calzados;
}

stockSchema.statics.getListaDeCalzadosParaDeportePorMarca = async function(nombreDeporte, marca) {
    const idsCalzados = await Calzado.getIdsParaDeportePorMarca(nombreDeporte, marca);
    const calzados = await this.find({calzado: {$in: idsCalzados}});
    return calzados;
}

stockSchema.statics.getListaDeCalzadosParaDeportePorMarcaYColor = async function(nombreDeporte, marca, color) {
    const idsCalzados = await Calzado.getIdsParaDeportePorMarcaYColor(nombreDeporte, marca, color);
    const calzados = await this.find({calzado: {$in: idsCalzados}});
    return calzados;
}
stockSchema.statics.getListaDeCalzadosParaDeportePorMarcaYGenero = async function(nombreDeporte, marca, genero) {
    const idsCalzados = await Calzado.getIdsParaDeportePorMarcaYGenero(nombreDeporte, marca, genero);
    const calzados = await this.find({calzado: {$in: idsCalzados}});
    return calzados;
}

stockSchema.statics.hasCantidadDisponible = function(arrayTalla) {
    for(var i = 0; i < arrayTalla.length; i++){
        if( arrayTalla[i].cantidad > 0 ){
            return true;
        }
    }
    return false;
}

stockSchema.statics.hasTallaDisponible = async function(idCalzado, talla) {
    var stock = await this.findOne({calzado: idCalzado});
    var arrayTalla = stock.talla;
    for(var i = 0; i < arrayTalla.length; i++){
        if( arrayTalla[i].numero == talla && arrayTalla[i].cantidad > 0 ){
            return true;
        }
    }
    return false;
}



const Stock = new model('Stock', stockSchema, 'stock');

module.exports = Stock;