module.exports = function({db}) {

	let router = require("express-promise-router")();
	const Promise = require("bluebird");
	const bookshelf = require("bookshelf")(db);	//This initialization should likely only ever happen once in your application. As it creates a connection pool for the current database, you should use the bookshelf instance returned throughout your library. You'll need to store this instance created by the initialize somewhere in the application so you can reference it. A common pattern to follow is to initialize the client in a module so you can easily reference it later, could also go in bookshelf.js, prob along with knex requires:
	const bcrypt = require("bcryptjs");
	const passport = require('passport');
	require('../passport');
	const jwt = require('jsonwebtoken');
	const util = require('util');
	// //Import Routes
	// const authRoute = require('./auth');

	// //Route Middlewares
	// app.use('/user', authRoute);

	//should this be in server.js?
	const Band = bookshelf.Model.extend({
		tableName: 'bands'
	});

	const User = bookshelf.Model.extend({
		tableName: 'users'
	});

	router.get("/", (req, res) => {
		res.sendfile("./public/index.html");
	});

	//get all bands, no auth
	router.get('/band', (req, res) => {
		Promise.try(() => {
			return db("bands");
		}).then((bands) => {
			console.log("All the people:", bands);
			res.status(200).send(bands);
		});
	});

	
	router.get("/secret", passport.authenticate('jwt', { session: false }), function(req, res){
		res.json("Success! You can not see this without a token");
	});
	//add band, require auth
	router.post('/band', (req, res) => {
		Promise.try(() => {
			console.log(req.body);
			if(!req.body.name) {
				return res.status(401).send('required band name field is missing');
			}

			//forge new bookshelf instance of Band model, save does an update or insert with knex to postgres db
			Band.forge({
					name: req.body.name,
				 	city: req.body.city,
				 	country: req.body.country,
					yearFormed: req.body.yearFormed,
					genres: `{ ${req.body.genres} }`		//adding on brackets for knex to input array of genres into postgres
				})
			.save()
			.then(() => { res.status(200).send("Band has been added, thank you!")});
		});
	});

	//update band, require auth
	router.put('/band/:id', (req, res) => {
		Promise.try(() => {
			console.log(req.body);
			if(!req.body.name) {
				return res.status(401).send('required band name field is missing');
			}
		
			db
			.select('id')
			.from('bands')
			.where('id', req.params.id)
			.then((band) => {
				if (!band) {
				  console.log("band with id does not exist")
				  return res.send("does not exist")
				}
				console.log(band);
				new Band({id: req.params.id}).save({
					name: req.body.name,
					city: req.body.city,
					country: req.body.country,
				    yearFormed: req.body.yearFormed,
				    genres: `{ ${req.body.genres} }`		//adding on brackets for knex to input array of genres into postgres  
				}).then((band) => {
					res.status(200).send(`${Band} has been updated, thank you!`);
				});
			});
		});
	});

	//delete band, require auth
	router.delete('/band/:id', (req, res) => {
		Promise.try(() => {
			console.log(`req.params.id ${req.params.id}`);
			return db("bands").where('id', req.params.id).del();
		}).then((bands) => {
			console.log("All the people:", bands);
			res.status(200).send(`Band with id of ${req.params.id} deleted successfully`);
		});
	});

	//TODO: refactor to use .then()'s
	//TODO: what if username already exists
	router.post('/register', (req, res) => {
		Promise.try(() => {
			if(!req.body.username || !req.body.password) {
				return res.status(401).send('no fields');
			}
			bcrypt.genSalt(10, (err, salt) => {
				bcrypt.hash(req.body.password, salt, (err, hash) => {
					// Store hash in your password DB.
					try {
						User.forge({
							username: req.body.username,
							password: hash
						}).save()
						.then(() => {
							res.status(200).send(`User: ${req.body.username} created`);
						});
				
					} catch (err) {
						res.status(400).send({
							error: 'something went wrong with user registration!',
						});
					}
				});
			});
		});
	  });

	  router.post('/login', (req, res, next) => {
		if(!req.body.username || !req.body.password) {
			return res.status(401).send('Field missing');
		}
	
		User.forge({ username: req.body.username}).fetch().then(result => {

			if(!result) {
				return res.status(400).send('User not found');
			}
			console.log(result);
			passport.authenticate('login', (err, user, info) => {
				// If this function gets called, authentication was successful.
				// `req.user` contains the authenticated user.
				//res.redirect('/users/' + req.user.username);
				// console.log(`req: ${util.inspect(req)}`);
				// console.log(`res: ${util.inspect(res)}`);
				// console.log(`next: ${util.inspect(next)}`);
				// console.log(`result: ${util.inspect(result)}`);
				// console.log(`err: ${util.inspect(err)}`);
				// console.log(`user: ${util.inspect(user)}`);
				// console.log(`info: ${util.inspect(info)}`);
				const payload = { username: req.body.username };
				const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
				// console.log(`token: ${token}`);
				res.status(200).send({token: token});
			})(req, res, next);	//TODO what's up with this? https://stackoverflow.com/questions/20626183/more-passport-js-woes-hangs-on-form-submission
			// .catch(err => {
			// 	return res.status(401).send({ err: err });
			// });
		});
	});

	//this proves can login and bcrypt hash works
	router.post('/nojwtlogin',
		passport.authenticate('login', { successRedirect: '/',
										failureRedirect: '/testlogin',
										failureFlash: true })
	);

	// router.post('/login', (req, res, next) => {	//TODO: why do you need next, or why would you
	// 	passport.authenticate('login', { session: false }, (error, user, info) => {	//TODO: lookinto info param
	// 		if (error) {
	// 			console.log(error);
	// 		}
	// 		if (info != undefined) {
	// 			console.error(info.message);
	// 			if (info.message === 'bad username') {
	// 			  res.status(401).send(info.message);
	// 			} else {
	// 			  res.status(403).send(info.message);
	// 			}
	// 		} else {
	// 			req.logIn(users, () => {
	// 				User.where('username', user.username)
	// 				.then((user) => {
	// 				const token = jwt.sign({ id: user.username }, jwtSecret.secret);
	// 				res.status(200).send({
	// 				  auth: true,
	// 				  token,	
	// 				  message: 'user found & logged in',
	// 				});
	// 			  });
	// 			});
	// 		  }
	// 		})(req, res, next);
	// 	  });

	return router;
}




