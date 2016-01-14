angular.module('HeartBankApp', ['ngCookies'])

// Controllers
.controller('HeartBankController', ['$scope', '$http', '$rootScope', '$cookies', '$filter', function($scope, $http, $rootScope, $cookies, $filter) {
	// get cookies
   	var heartbanktoken = $cookies.get('heartbanktoken');
	$scope.heartbankname = $cookies.get('heartbankname');
	
	// calculate
	$scope.calculate = function() {
		var rate = $('#rate').val();
		var time = $('#time').val();
		var amount = rate * time;
		$('#amount').val(amount.toFixed(2));
		$scope.formData.amount = amount;		
	};

	// socket.io
	var socket = io();
	
	socket.emit('username', { username: $scope.heartbankname });
	socket.on('new user', function(name) {
		$('#messages').append($('<li>').css({ color: 'green', background: '#17C4E8' }).text( name + ' just connected at ' + $filter('date')(Date.now(), 'h:mm a')));
		var scrol_pos = $('#chatbox').scrollTop();
		$('#chatbox').scrollTop(scrol_pos + 500);
	});
	socket.on('user disconnected', function(name) {
		$('#messages').append($('<li>').css({ color: 'red', background: '#C0C0C0' }).text( name + ' just disconnected at ' + $filter('date')(Date.now(), 'h:mm a')));
		var scrol_pos = $('#chatbox').scrollTop();
		$('#chatbox').scrollTop(scrol_pos + 500);
	});
	socket.on('user log', function(users) {
		$('#users').empty();
		for (i = 0; i < users.length; i++) {
			$('#users').append($('<li>').text(users[i]));
		};
	});
	socket.on('chat message', function(message) {
		$('#messages').append($('<li>').text( message.user + ' (' + $filter('date')(Date.now(), 'h:mm a') + '): ' + message.msg ));
		var scrol_pos = $('#chatbox').scrollTop();
		$('#chatbox').scrollTop(scrol_pos + 500);
	});
	$('#chat').submit(function() {
		var msg = $('#m').val();
		socket.emit('chat message', { message: msg });
		// send to db
		var message = {
			msg: msg,
			user: $scope.heartbankname,
			created_at: Date.now()
		};
		$http({
			method: 'POST',
			url: 'api/messages',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			data: $.param(message)
		});
		$('#m').val('');
		return false;
	});
		
	// creates list after submit  
	$scope.newItems = [];
	
	// send data
	$scope.broadcasting = false;
	
	$scope.stateChanged = function() {
		if ($scope.checked) {
			$scope.formData.anonymize = '<3'
		} else {
			$scope.formData.anonymize = '';
		}
	};
	
    $scope.formData = {
		command: 'give/transfer',
		anonymize: ''
    };
	
	$scope.processForm = function() {
		$scope.broadcasting = true;
			
		switch($scope.formData.command) {
			case 'give/transfer':
				var message = '@' + $scope.formData.ext + ' +$' + $scope.formData.amount + ' ' + $scope.formData.comment + ' ' + $scope.formData.anonymize;
				break;
			case 'take/transfer':
				var message = '@' + $scope.formData.ext + ' -$' + $scope.formData.amount + ' ' + $scope.formData.comment + ' ' + $scope.formData.anonymize;
				break;
			case 'deposit':
				var message = '#' + $scope.formData.ext + ' +$' + $scope.formData.amount + ' ' + $scope.formData.comment + ' ' + $scope.formData.anonymize;
				break;
			case 'withdraw':
				var message = '#' + $scope.formData.ext + ' -$' + $scope.formData.amount + ' ' + $scope.formData.comment + ' ' + $scope.formData.anonymize;
				break;
			case 'reward':
				var message = '*' + $scope.formData.ext + ' +$' + $scope.formData.amount + ' ' + $scope.formData.comment + ' ' + $scope.formData.anonymize;
				break;
			case 'donate':
				var message = '*' + $scope.formData.ext + ' -$' + $scope.formData.amount + ' ' + $scope.formData.comment + ' ' + $scope.formData.anonymize;
				break;			
		}
		
		var heartbankdata = {
			token: heartbanktoken,
			message: message
		}
		
		$http({
			method: 'POST',
			url: 'http://kiitos.heartbank.com/broadcast',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			data: $.param(heartbankdata)
		})
        .success(function(data) {
			$scope.broadcasting = false;
			var transaction = {
				token: heartbanktoken,
				transactionID: data.transaction,
				command: $scope.formData.command,
				rate: $('#rate').val(),
				time: $('#time').val(),
				ext: $scope.formData.ext,
				amount: $scope.formData.amount,
				comment: $scope.formData.comment,
				anonymize: $scope.formData.anonymize,
				created_at: Date.now()
			};
            
            $http({
			method: 'POST',
			url: 'api/transactions',
			headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
			data: $.param(transaction)
			});
			
			$scope.newItems.unshift(transaction);
			$scope.formData = {
				command: 'give/transfer'
			};
        });
	};
}]);