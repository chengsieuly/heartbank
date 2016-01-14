var User = require('./models/user');
var Transaction = require('./models/transaction');
var Message = require('./models/message');
var querystring = require('querystring');

module.exports = function(app, express) {
	var api = express.Router();
	
	// socket
	api.get('/', function(req, res) {
		
		var name = req.cookies.heartbanktoken;
		if (name === undefined) {
			res.redirect('login')
		}
		else {
			User.findOne({ token: req.cookies.heartbanktoken})
			.exec(function(err, users) {
				Transaction.find({ token: req.cookies.heartbanktoken })
				.select({ _id: 0, __v: 0, token: 0, transactionID: 0 })
				.sort({ created_at: 'descending' })
				.exec(function(err, transactions) {
					Message.find({})
					.select({ _id: 0, __v: 0 })
					.sort({ created_at: 'ascending' })
					.exec(function(err, messages) {
							res.render('index', { users: users, transactions: transactions, messages: messages });
					});
				});
			});
		};
	});
	
	api.get('/receiver', function(req, res) {
		var qs = querystring.parse(req.url.split("?")[1]);
		var user = new User({
			token: qs.token,
			member: qs.member,
			family: qs.family,
			surname: qs.surname,
			relation: qs.relation,
			name: qs.name,
			extension: qs.extension
		});
		console.log(qs);
		User.find({ token: qs.token })
		.exec(function(err, docs) {
			if (!docs.length) {
				user.save(function(err, user) {
					if(err) {return next(err)};
				});
			} else {
				User.update( {token: qs.token}, {family: qs.family, member: qs.member, surname: qs.surname, relation: qs.relation, name: qs.name, extension: qs.extension}, function(err, raw) {
					if(err) {return next(err)};
				});
			};
		});

		res.cookie('heartbanktoken', qs.token);
		res.cookie('heartbankname', qs.name);
		res.redirect('/');
	});
	
	api.get('/login', function(req, res) {
		res.render('login');
	})
	
	api.get('/logout', function(req, res) {
		res.clearCookie('heartbanktoken');
		res.clearCookie('heartbankname');
		res.redirect('/');
	});
	
	api.post('/api/transactions', function(req, res, next) {
		var transaction = new Transaction({
			token: req.body.token,
			transactionID: req.body.transactionID,
			command: req.body.command,
			rate: req.body.rate,
			time: req.body.time,
			ext: req.body.ext,
			amount: req.body.amount,
			comment: req.body.comment,
			anonymize: req.body.anonymize,
			created_at: req.body.created_at
		});
		transaction.save(function(err, transaction) {
			if(err) { return next(err) }
			res.status(201).json(transaction);
		});
	});
	
	api.post('/api/messages', function(req, res, next) {
		var message = new Message({
			user: req.body.user,
			msg: req.body.msg,
			created_at: req.body.created_at
		});
		message.save(function(err, message) {
			if(err) { return next(err) }
			res.status(201).json(message);
			});
		});	
		
	return api;
};