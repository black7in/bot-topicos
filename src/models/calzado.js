const { Schema, model } = require('mongoose');
const Deporte = require('./deporte');
const Color = require('./color');
const Marca = require('./marca');

const calzadoSchema = new Schema({
    modelo: String,
    deporte: { type: Schema.Types.ObjectId, ref: 'Deporte' },
    marca: { type: Schema.Types.ObjectId, ref: 'Marca' },
    color: [{ type: Schema.Types.ObjectId, ref: 'Color' }],
    imagen: [String],
    genero: String, // Hombre, Mujer, Niños
})
// Obtener array de imagenes por modelo
calzadoSchema.statics.getImages = async function(modelo){
    var calzado = await this.findOne({modelo: modelo});
    if(calzado){
        return calzado.imagen;
    }
    return null;
}

// Obtener calzados con parametro deporte
calzadoSchema.statics.getIdsParaDeporte = async function(nombreDeporte) {
    var idDeporte = await Deporte.getId(nombreDeporte);
    var arrayIds = []
    if(idDeporte){
        var calzados = await this.find({deporte: idDeporte});
        for( var i = 0; i < calzados.length; i++){
            arrayIds.push(calzados[i]._id);
        }
    }
    return arrayIds;
}

// Obtener calzados con parametro deporte Color
calzadoSchema.statics.getIdsParaDeportePorColor = async function(nombreDeporte, color) {
    var idDeporte = await Deporte.getId(nombreDeporte);
    var idColor = await Color.getId(color);
    var arrayIds = []
    if(idDeporte){
        var calzados = await this.find({deporte: idDeporte, color: idColor});
        for( var i = 0; i < calzados.length; i++){
            arrayIds.push(calzados[i]._id);
        }
    }
    return arrayIds;
}

// Obtener calzados con parametro deporte Genero
calzadoSchema.statics.getIdsParaDeportePorGenero = async function(nombreDeporte, genero) {
    var idDeporte = await Deporte.getId(nombreDeporte);
    var arrayIds = []
    if(idDeporte){
        var calzados = await this.find({deporte: idDeporte, genero: genero});
        for( var i = 0; i < calzados.length; i++){
            arrayIds.push(calzados[i]._id);
        }
    }
    return arrayIds;
}

// Obtener calzados con parametro deporte Marca
calzadoSchema.statics.getIdsParaDeportePorMarca = async function(nombreDeporte, marca) {
    var idDeporte = await Deporte.getId(nombreDeporte);
    var idMarca = await Marca.getId(marca);
    var arrayIds = []
    if(idDeporte){
        var calzados = await this.find({deporte: idDeporte, marca: idMarca});
        for( var i = 0; i < calzados.length; i++){
            arrayIds.push(calzados[i]._id);
        }
    }
    return arrayIds;
}

// Obtener calzados con parametro deporte Marca Y Color
calzadoSchema.statics.getIdsParaDeportePorMarcaYColor = async function(nombreDeporte, marca, color) {
    var idDeporte = await Deporte.getId(nombreDeporte);
    var idMarca = await Marca.getId(marca);
    var idColor = await Color.getId(color);
    var arrayIds = []
    if(idDeporte){
        var calzados = await this.find({deporte: idDeporte, marca: idMarca, color: idColor});
        for( var i = 0; i < calzados.length; i++){
            arrayIds.push(calzados[i]._id);
        }
    }
    return arrayIds;
}

// Obtener calzados con parametro deporte Marca Y Genero
calzadoSchema.statics.getIdsParaDeportePorMarcaYGenero = async function(nombreDeporte, marca, genero) {
    var idDeporte = await Deporte.getId(nombreDeporte);
    var idMarca = await Marca.getId(marca);
    var arrayIds = []
    if(idDeporte){
        var calzados = await this.find({deporte: idDeporte, marca: idMarca, genero: genero});
        for( var i = 0; i < calzados.length; i++){
            arrayIds.push(calzados[i]._id);
        }
    }
    return arrayIds;
}

const Calzado = new model('Calzado', calzadoSchema, 'calzado');

module.exports = Calzado;