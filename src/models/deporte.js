const { Schema, model } = require('mongoose');


const deporteSchema = new Schema({
    nombre: String,
});

deporteSchema.statics.getId = async function(nombre) {
    var id = await Deporte.findOne({nombre: nombre});
    if(id){
        return id._id;
    }else{
        console.log('No existe el deporte:', nombre);
        return null;
    }
}

const Deporte = new model('Deporte', deporteSchema, 'deporte');

module.exports = Deporte;