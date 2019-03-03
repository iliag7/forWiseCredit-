var fs = require('fs');
var crypto = require('crypto');
var bodyParser = require('body-parser');
//var jsonParser = bodyParser.json({ type: 'application/*+json'});
//var jsonParser = bodyParser.json();
var express = require('express');
var app = express.Router();//express();
var pool = require('../db/dbconnect');

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

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
		fs.writeFile('token.txt', '', function(){})
	}
	
	//fs.openSync('token.txt', JSON.stringify(appendFile));

	fs.appendFile('token.txt', JSON.stringify(appendFile), function (err) {
		if (err) throw err;
		console.log('Saved!');
	});
});



app.post('/update/:id', function (req, res) {
	pool.getConnection(function(err, connection) {
  if (err) throw err; // not connected!

  connection.query("UPDATE users SET name = '"+req.body.name+"',email = '"+req.body.email+"',password = '"+req.body.password+"',token = '"+req.body.token+"' WHERE id = '"+req.params.id+"'", function (error, results, fields) {
    connection.release();
    if (error) throw error;
	console.log(results);	
	connection.on('close', function (err) {
    console.error( 'MySQL close');
  });
  });
   res.redirect('http://localhost:3000/')
 });
});

app.post('/create', function (req, res) {	
  pool.getConnection(function(err, connection) {
  if (err) throw err; // not connected!
  connection.query("INSERT INTO users(name,email,password,token) VALUES ('"+req.body.name+"', '"+req.body.email+"','"+req.body.password+"', '"+req.body.token+"')", function (error, results, fields) {
    connection.release();
    if (error) throw error;
	console.log(results);
  });
  res.redirect('http://localhost:3000/')
 });
});

app.delete('/delete/:id', function (req, res) {
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
	//resArrAccount = '';
    //if (error) throw error;	
	//for(var value in results[0]){
	//	resArrAccount = resArrAccount + ' ' + value + ':' +  results[0][value];
	//}	
	console.log(results[0]);
	res.send(results[0]); 
 });
 
 connection.on('close', function (err) {
    console.error( 'MySQL close');
  });
 
});

});

module.exports = app;

