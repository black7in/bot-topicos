const { Schema, model } = require('mongoose');
const Visita = require('./visita');
const Deporte = require('./deporte');
const Calzado = require('./calzado');
const Marca = require('./marca');
const Color = require('./color');

const consultaSchema = new Schema({
    visita: { type: Schema.Types.ObjectId, ref: 'Visita' },
    deporte: [{ type: Schema.Types.ObjectId, ref: 'Deporte' }],
    calzado: [{ type: Schema.Types.ObjectId, ref: 'Calzado'}],
    marca: [{ type: Schema.Types.ObjectId, ref: 'Marca' }],
    color: [{ type: Schema.Types.ObjectId, ref: 'Color' }],
    talla: [Number],
    genero: [String]
});

consultaSchema.statics.registrarDeporte = async function (facebookId, nombreDeporte) {
    var idVisita = await Visita.getUltimaVisita(facebookId);
    var idDeporte = await Deporte.findOne({ nombre: nombreDeporte });
    
    var consulta = await this.findOne({ visita: idVisita });
    if (consulta) {
        var yaExiste = await this.findOne({ _id: consulta._id, visita: idVisita, deporte: [idDeporte._id]});
        if(!yaExiste){
            await this.updateOne(
                { _id: consulta._id, visita: idVisita },
                { $push: { 'deporte': idDeporte } }
            );
        }
    } else {
        var consulta = new Consulta({
            visita: idVisita,
            deporte: [idDeporte],
            calzado: [],
            marca: [],
            color: [],
            talla: [],
            genero: []
        });
        consulta.save();
    }

}

consultaSchema.statics.registrarCalzado = async function (facebookId, nombreModelo) {
    var idVisita = await Visita.getUltimaVisita(facebookId);
    var idCalzado = await Calzado.findOne({ nombre: nombreModelo });
    
    var consulta = await this.findOne({ visita: idVisita });
    if (consulta) {
        var yaExiste = await this.findOne({ _id: consulta._id, visita: idVisita, calzado: [idCalzado._id]});
        if(!yaExiste){
            await this.updateOne(
                { _id: consulta._id, visita: idVisita },
                { $push: { 'calzado': idCalzado } }
            );
        }
    } else {
        var consulta = new Consulta({
            visita: idVisita,
            deporte: [],
            calzado: [idCalzado],
            marca: [],
            color: [],
            talla: [],
            genero: []
        });
        consulta.save();
    }
}

consultaSchema.statics.registrarMarca = async function (facebookId, nombreMarca) {
    var idVisita = await Visita.getUltimaVisita(facebookId);
    var idMarca = await Marca.findOne({ nombre: nombreMarca });
    
    var consulta = await this.findOne({ visita: idVisita });
    if (consulta) {
        var yaExiste = await this.findOne({ _id: consulta._id, visita: idVisita, marca: [idMarca._id]});
        if(!yaExiste){
            await this.updateOne(
                { _id: consulta._id, visita: idVisita },
                { $push: { 'marca': idMarca } }
            );
        }
    } else {
        var consulta = new Consulta({
            visita: idVisita,
            deporte: [],
            calzado: [],
            marca: [idMarca],
            color: [],
            talla: [],
            genero: []
        });
        consulta.save();
    }
}

consultaSchema.statics.registrarColor = async function (facebookId, nombreColor) {
    var idVisita = await Visita.getUltimaVisita(facebookId);
    var idColor = await Color.findOne({ nombre: nombreColor });
    
    var consulta = await this.findOne({ visita: idVisita });
    if (consulta) {
        var yaExiste = await this.findOne({ _id: consulta._id, visita: idVisita, color: [idColor._id]});
        if(!yaExiste){
            await this.updateOne(
                { _id: consulta._id, visita: idVisita },
                { $push: { 'color': idColor } }
            );
        }
    } else {
        var consulta = new Consulta({
            visita: idVisita,
            deporte: [],
            calzado: [],
            marca: [],
            color: [idColor],
            talla: [],
            genero: []
        });
        consulta.save();
    }
}

consultaSchema.statics.registrarTalla = async function (facebookId, numeroTalla) {
    var idVisita = await Visita.getUltimaVisita(facebookId);

    var consulta = await this.findOne({ visita: idVisita });
    if (consulta) {
        var yaExiste = await this.findOne({ _id: consulta._id, visita: idVisita, talla: [numeroTalla]});
        if(!yaExiste){
            await this.updateOne(
                { _id: consulta._id, visita: idVisita },
                { $push: { 'talla': numeroTalla } }
            );
        }
    } else {
        var consulta = new Consulta({
            visita: idVisita,
            deporte: [],
            calzado: [],
            marca: [],
            color: [],
            talla: [numeroTalla],
            genero: []
        });
        consulta.save();
    }
}

consultaSchema.statics.registrarGenero = async function (facebookId, nombreGenero) {
    var idVisita = await Visita.getUltimaVisita(facebookId);

    var consulta = await this.findOne({ visita: idVisita });
    if (consulta) {
        var yaExiste = await this.findOne({ _id: consulta._id, visita: idVisita, genero: [nombreGenero]});
        if(!yaExiste){
            await this.updateOne(
                { _id: consulta._id, visita: idVisita },
                { $push: { 'genero': nombreGenero } }
            );
        }
    } else {
        var consulta = new Consulta({
            visita: idVisita,
            deporte: [],
            calzado: [],
            marca: [],
            color: [],
            talla: [],
            genero: [nombreGenero]
        });
        consulta.save();
    }
}


const Consulta = new model('Consulta', consultaSchema, 'consulta');

module.exports = Consulta;