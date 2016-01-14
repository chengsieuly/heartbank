var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	token: String,
	member: String,
	family: String,
	surname: String,
	relation: String,
	name: String,
	extension: String
});

module.exports = mongoose.model('User', userSchema);