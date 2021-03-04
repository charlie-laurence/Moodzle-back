//Fun-fact Schema
var mongoose = require('mongoose');

var funfactSchema = mongoose.Schema({
    text: String,
    mood_score: Number,
});

var funfactModel = mongoose.model('funfact', funfactSchema)

module.exports = funfactModel