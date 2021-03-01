//Mood Schema
var mongoose = require('mongoose');

var moodSchema = mongoose.Schema({
    date: Date,
    mood_score: Number,
    activity: [{type:mongoose.Schema.Types.ObjectId, ref: 'activities'}]
});

var moodModel = mongoose.model('moods', moodSchema)

module.exports = {moodModel}