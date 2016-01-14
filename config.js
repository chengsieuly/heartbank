module.exports = {
	// database: 'mongodb://localhost/test',
	database: 'mongodb://chengsieuly:black246@ds037234.mongolab.com:37234/heartbank',
	port: process.env.OPENSHIFT_NODEJS_PORT || 3000,
	ipaddress: process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'
}