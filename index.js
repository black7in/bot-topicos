const app = require('./src/app');

function main(){
    app.listen((5000), () => console.log('El servidor esta escchando!'));
}
main();