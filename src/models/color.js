const { Schema, model } = require('mongoose');

const colorSchema = new Schema({
    nombre: String
});

colorSchema.statics.getId = async function(nombre) {
    var id = await this.findOne({nombre: nombre});
    if(id){
        return id._id;
    }else{
        console.log('No existe el color:', nombre);
        return null;
    }
}

const Color = new model('Color', colorSchema, 'color');

module.exports = Color;