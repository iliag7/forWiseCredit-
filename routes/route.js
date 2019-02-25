var fs = require('fs');
var crypto = require('crypto');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var express = require('express');
var app = express.Router();//express();
var pool = require('../db/dbconnect');


var dbObj = {};

app.get('/', function (req, res) {
	
  pool.getConnection(function(err, connection) {
  if (err) throw err;
  
  connection.query('SELECT * FROM users', function (error, results, fields) {
    connection.release();

    if (error) throw error;
	resArr = '';
	for(var rowId in results){
		for(var colId in results[rowId]){
			resArr = resArr + ' ' + colId + ':' +  results[rowId][colId];
		}
	}
	// res.send(resArr);
	 dbObj = results;
	var data = JSON.stringify({"data" : results});
	 
	 
	 
	 res.render('index', {data} );
  });
 });

});

app.get('/token', function (req, res) {
	var mykey = crypto.createCipher('aes-128-cbc', dbObj[0].email + dbObj[0].password);
	var mystr = mykey.update('abc', 'utf8', 'hex')
	mystr += mykey.final('hex');	
	res.send(mystr);
	
	var appendFile = {};
	appendFile['token'] = mystr;
	
	if (fs.existsSync('token.txt')) {
		fs.unlink('token.txt', (error) => {});
	}

	fs.appendFile('token.txt', JSON.stringify(appendFile), function (err) {
		if (err) throw err;
		console.log('Saved!');
	});
});


app.post('/update/:id',jsonParser, function (req, res) {
	
	pool.getConnection(function(err, connection) {
  if (err) throw err; // not connected!

  connection.query("UPDATE users SET name = '"+req.body.name+"' WHERE id = '"+req.params.id+"'", function (error, results, fields) {
    connection.release();
    if (error) throw error;
	console.log(results);	
	connection.on('close', function (err) {
    console.error( 'MySQL close');
  });
  });
 });
});

app.get('/create', function (req, res) {	
  pool.getConnection(function(err, connection) {
  if (err) throw err; // not connected!
  connection.query("INSERT INTO users(name,email,password) VALUES ('name2', 'new@gmail.com','1234')", function (error, results, fields) {
    connection.release();
    if (error) throw error;
	console.log(results);
  });
  res.redirect('http://localhost:3000/')
 });
});

app.get('/delete/:id', function (req, res) {
  pool.getConnection(function(err, connection) {
  if (err) throw err; 
  connection.query("DELETE FROM users WHERE id = '"+req.params.id+"'", function (error, results, fields) {
    connection.release();
    if (error) throw error;
	console.log(req.params.id);
  });
  	res.redirect('http://localhost:3000/')
  
 });
});

app.get('/account', function (req, res) {
	
  pool.getConnection(function(err, connection) {
  var token = JSON.parse(fs.readFileSync('token.txt', 'utf8'));
  
  connection.query("SELECT * FROM users WHERE token = '"+token.token+"'", function (error, results, fields) {
    connection.release();
	resArrAccount = '';
    if (error) throw error;	
	for(var value in results[0]){
		resArrAccount = resArrAccount + ' ' + value + ':' +  results[0][value];
	}	
	res.send(resArrAccount); 
 });
 
 connection.on('close', function (err) {
    console.error( 'MySQL close');
  });
 
});

});

module.exports = app;

