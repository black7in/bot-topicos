const Color = require('./models/color');


const poblar = async function(){

    await Color.Create([
        {nombre: 'Rojo'},
        {nombre: 'Amarillo'},
        {nombre: 'Verde'},
        {nombre: 'Morado'},
        {nombre: 'Azul'},
        {nombre: 'Negro'},
        {nombre: 'Blanco'},
        {nombre: 'Naranja'},
        {nombre: 'Celeste'},
        {nombre: 'Cafe'},
    ]);
}

module.exports = poblar;