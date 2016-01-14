var mongoose = require('mongoose');

var MessageSchema = mongoose.Schema({
	user: String,
	msg: String,
	created_at: Date
});

module.exports = mongoose.model('Message', MessageSchema);