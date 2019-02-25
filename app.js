var mysql = require('mysql');
var fs = require('fs');
var crypto = require('crypto');
var express = require('express');
var path = require('path');
var app = express();
//app.set('view engine', 'ejs');
var route = require('./routes/route');

app.listen(3000);

app.use('/', route);
app.use('/token', route);
app.use('/update/:id', route);
app.use('/create', route);
app.use('/delete/:id', route);
app.use('/account', route);


app.set('views', __dirname + '/views');
//app.set('view engine', 'jade'); //extension of views
app.set('view engine', 'ejs');


