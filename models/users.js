//User Schema
var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    token: String,
    history: [{type:mongoose.Schema.Types.ObjectId, ref: 'moods'}],
    password: String
});

var userModel = mongoose.model('users', userSchema)

module.exports = userModel