// Include Express module
const express = require('express')	

// Create an instance of Express
const app = express()

var util = require('util');
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var session = require('express-session');
var flash = require('connect-flash');

app.use(session({
	secret: 'aSecretKey',
	saveUninitialized: false,
	resave: true
}));

// Serve static files from public folder
app.use(express.static('public'))

const Sequelize = require('sequelize') // $ npm install sequelize
const sequelize = new Sequelize('sqlite:./data/database.sqlite', {
	logging: console.log
})

const Op = Sequelize.Op;

const Users =
	sequelize.define('users', {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		username: Sequelize.STRING,
		password: Sequelize.STRING,
		email: Sequelize.STRING,
	})

const Organizations =
	sequelize.define('organizations', {
		id: {
			type: Sequelize.INTEGER,
			autoIncrement: true,
			primaryKey: true
		},
		name: Sequelize.STRING,
		description: Sequelize.TEXT,
		address: Sequelize.STRING,
		creator: Sequelize.STRING,
		postcode: Sequelize.STRING,
		phone: Sequelize.STRING,
		email: Sequelize.STRING

	})

sequelize.sync()

//Passport setup
const passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.get('/success', (req, res) => res.send("Welcome "+req.query.username+"!!"));
app.get('/error', (req, res) => res.send("error logging in"));

passport.serializeUser(function(user, cb) {
	cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
	Users.findById(id).then(function(user) {
		console.log('deserializing user:',user);
		cb(null, user);
	}).catch(function(err) {
		if (err) {
			throw err;
		}
	});
});

//LocalStrategy for passport
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
	function(username, password, done) {
		Users.findOne({
			where: {
				'username': username
			}
		}).then(function (user) {
			if (user == null) {
				return done(null, false, { message: 'Incorrect credentials.' })
			}


			if (user.password === password) {
				return done(null, user)
			}

			return done(null, false, { message: 'Incorrect credentials.' })
		})
	}
));

app.post('/createuser',function(req, res){
		Users.findOne({
			where: {
				'username': req.body.username
			}
		}).then(function (user) {
			if (user == null && req.body.password == req.body.password2) {
				//Change hardcoded email in the future
				Users.create({username:req.body.username, password:req.body.password, email:"test@refugeeapp.com"});
				res.redirect('/');
			}
			else {
	res.redirect('/error');
			}
		})
}
);

app.post('/login', passport.authenticate('local', { failureRedirect: '/error', failureFlash: true }),
	function(req, res) {
		res.redirect('/');
	});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/isloggedin', function(req, res){
	if(req.isAuthenticated()){
		// Return a status 201 (created) response
		res.status(201).json({
			status: 'OK'
		})
	} else {
		console.log("User not authenticated");
		res.status(401).json({
			status: 'Access Denied'
		})
	}
});

app.get('/api/organization', bodyParser.json(), (req, res) => {
	// Return a JSON response to the GET request
	var orgResult;
		Organizations.findAll().then(orgResult => {
			//console.log(orgResult);
			res.json(orgResult);
			// projects will be an array of all Project instances
		})
})

app.post('/api/organization', bodyParser.json(), (req, res) => {
	if(req.isAuthenticated()){
		Organizations.sync().then(() => {
			// Table created
			return Organizations.create({
				name: req.body.name,
				description: req.body.description,
				address: req.body.address,
				creator: req.user.username,
				postcode: req.body.postcode,
				phone: req.body.phone,
				email: req.body.email
			});
		});
		res.status(201).json({
			status: 'OK'
		})
	} else {
		console.log("User not authenticated");
		res.status(401).json({
			status: 'Access Denied'
		})
	}

})

app.post('/api/deleteorganization', bodyParser.json(), (req, res) => {
	if(req.isAuthenticated()){
		console.log(req);
		Organizations.destroy({
			where: {
				[Op.and]: [{creator:req.user.username}, {name:req.body.name}]
			}
			});
		res.status(201).json({
			status: 'OK'
		})
	} else {
		console.log("User not authenticated");
		res.status(401).json({
			status: 'Access Denied'
		})
	}
})

app.get('/api/latestorganization', bodyParser.json(), (req, res) => {
	var orgResult;
		Organizations.findOne({order:[['createdAt', 'DESC']]}).then(orgResult => {
			res.json(orgResult);
		})
})

app.get('/api/user', function(req, res) {
	var undefined;
	if (req.user !== undefined){
		res.json({ username : req.user.username });
	} else {
		res.json({ username : "null"});
	}
});

// Start the server on port 3000
// Access API through: http://localhost:3000 or http://127.0.0.1:3000
app.listen(3000, () => {
	console.log('Server is running')
})
