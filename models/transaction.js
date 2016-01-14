var mongoose = require('mongoose');

var TransactionSchema = mongoose.Schema({
	token: String,
	transactionID: String,
	command: String,
	rate: Number,
	time: Number,
	ext: Number,
	amount: Number,
	comment: String,
	anonymize: String,
	created_at: Date
}, {strict: false});

module.exports = mongoose.model('Transaction', TransactionSchema);