const express = require('express');
const app = express();
const {Pool, Client} = require("pg");
const bodyParser = require('body-parser');
require("dotenv").config();

var credentials = {};

const DATABASE_URL = process.env.DATABASE_URL;
if (DATABASE_URL === "") { //Database URL is not provided; the program thus infers that other info is available

	const PASSWORD = process.env.PASSWORD; //This code is for local running purposes, as opposed to the heroku environment
	const DATABASE_PORT = process.env.DATABASE_PORT;
	const USER = process.env.USER;
	const DATABASE = process.env.DATABASE;
	const HOST = process.env.HOST;

	credentials = {
		user: USER,
		database: DATABASE,
		host: HOST,
		port: DATABASE_PORT,
		password: PASSWORD
	};
} else {

	credentials = {
		connectionString: DATABASE_URL,
		ssl: {
			rejectUnauthorized: false
		}
	}
}

const connection = new Client(credentials); //Password should ideally be hidden
connection.connect(function(err)
{
	if (err)
		throw err;
	
	console.log('Connected to database!');

});

app.use(express.static(__dirname)); //Uses the current filepath as a directory for the server
app.use(bodyParser.urlencoded({extended: true})); //For parsing post data
app.use(bodyParser.json());
app.use(bodyParser.text());

app.get('/', function(req, res)
{
	res.sendFile('main.html', {root: __dirname});
});

app.get('/about', function(req, res)
{
	res.sendFile('about.html', {root: __dirname});
});

app.post('/wordlink', function(req, res)
{
	let word = req.body;
	
	if (word.length === 0) //No length, ignore
	{
		res.send('0');
		return;
	}
	
	if (word.length > 11) //String is too long
	{
		res.send('11');
		return;
	}
	
	let rX = /[^a-z]/; //Matches every character except for letters a-z, which are proper input
	
	if (rX.test(word)) //If invalid character found
	{
		res.send('-1');
		return;
	}
	
	connection.query('SELECT Link FROM WordLinks WHERE Word = \'' + word + '\' LIMIT 1', function(err, result) ////////////////////////SQL INJECTION!!!!!!!!!!
	{
		if (err)
		{
			console.log(err);
			res.status(404);
			return;
		}
		
		res.status(200);
		
		if (result["rows"].length === 0) //Means no information retrieved
		{
			res.send('NONE');
			return;
		}
		
		let links = result["rows"][0]["link"]; //Text blob of all the links assinged to the word
		if (links[links.length - 1] === '\r') //Strange carriage return character that seems to appear at almost every blob of links returned
			links = links.substring(0, links.length - 1);
		
		let numLinks = links.length / 11;
		
		let linkNum = Math.floor(Math.random() * numLinks) * 11;
		let link = links.substring(linkNum, linkNum + 11);
		
		res.send(link);
	});
});

app.post('/randword', function(req, res)
{
	connection.query('SELECT COUNT(id) FROM WordLinks', function(err, result)
	{
		if (err)
		{
			console.log(err);
			res.status(404);
			return;
		}
		
		let numWords = parseInt(result["rows"][0]["count"]); //Returns the amount of words currently in the dictionary
		let wordId = Math.floor((Math.random() * numWords)) + 1; //Random integer to determine which word to choose
		
		connection.query('SELECT Word FROM WordLinks WHERE id = ' + wordId + ' LIMIT 1', function(err, result)
		{
			if (err)
			{
				console.log(err);
				res.status(404);
				return;
			}
			
			let wordString = result["rows"][0]["word"];
			
			res.status(200);
			res.send(wordString);
		});
	});
});

const URL_TO_LISTEN = process.env.URL_TO_LISTEN;
const PORT = process.env.PORT;

app.listen(PORT, URL_TO_LISTEN, function() //Port 3000 at localhost
{
	console.log('Server running!');
});