//Connexion BDD
var mongoose = require('mongoose');

var options = {
    connectTimeoutMS: 5000,
    useNewUrlParser: true,
    useUnifiedTopology : true
}

var bdd = 'Moodzle'
var mdpbdd = 'Moodz2021!'
//     // --------------------- BDD -----------------------------------------------------
    mongoose.connect(`mongodb+srv://moodzle:${mdpbdd}@cluster0.erwv6.mongodb.net/${bdd}?retryWrites=true&w=majority`,
    options,
    function(err) {
        if (err) {
            console.log(error, `failed to connect to the database because --> ${err}`);
        } else {
            console.info('* Database Moodzle connection : Success *');
        }
    }
);