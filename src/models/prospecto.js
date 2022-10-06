const { Schema, model } = require('mongoose');

const prospectoSchema = new Schema({
    facebookId: Number,
    first_name: String,
    last_name: String,
    email: String,
    phone: Number,
},
{
    timestamps: { createdAt: true, updatedAt: false }
});

const Prospecto = new model('Prospecto', prospectoSchema, 'prospecto');


module.exports = Prospecto