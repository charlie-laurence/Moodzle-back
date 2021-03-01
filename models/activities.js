//Activity Schema
var mongoose = require('mongoose');

var activitySchema = mongoose.Schema({
    name: String,
    category: String
});

var activityModel = mongoose.model('activities', activitySchema)

module.exports = activityModel