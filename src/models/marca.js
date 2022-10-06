const { Schema, model } = require('mongoose');

const marcaSchema = new Schema({
    nombre: String,
});

marcaSchema.statics.getId = async function(nombre) {
    var id = await this.findOne({nombre: nombre});
    if(id){
        return id._id;
    }else{
        console.log('No existe la marca:', nombre);
        return null;
    }
}

const Marca = new model('Marca', marcaSchema, 'marca');

module.exports = Marca;