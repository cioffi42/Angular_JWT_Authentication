module.exports = function({db}) {

	let router = require("express-promise-router")();
	const Promise = require("bluebird");
	const bookshelf = require("bookshelf")(db);	//This initialization should likely only ever happen once in your application. As it creates a connection pool for the current database, you should use the bookshelf instance returned throughout your library. You'll need to store this instance created by the initialize somewhere in the application so you can reference it. A common pattern to follow is to initialize the client in a module so you can easily reference it later, could also go in bookshelf.js, prob along with knex requires:
	const bcrypt = require("bcryptjs");
	const passport = require('passport');
	require('../passport');
	const jwt = require('jsonwebtoken');

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

	//add band, require auth
	router.post('/band', passport.authenticate('jwt', { session: false }), (req, res) => {
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
	router.put('/band/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
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
	router.delete('/band/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
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

				/** This is what ends up in our JWT */
				const payload = {
					username: user[0].username,
					expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
				};

				const token = jwt.sign(payload, process.env.SECRET_OR_KEY);
				res.status(200).send({token: token});
				//res.status(200).json({message: "Auth Passed", token});	//this is another option, not sure if best
			})(req, res, next);	//TODO what's up with this? https://stackoverflow.com/questions/20626183/more-passport-js-woes-hangs-on-form-submission
			// .catch(err => {
			// 	return res.status(401).send({ err: err });
			// });
		});
	});

	//test route to login without JWT
	//proves bcrypt hashing of pw and user table works
	router.post('/nojwtlogin',
		passport.authenticate('login', { successRedirect: '/',
										failureRedirect: '/testlogin',
										failureFlash: true })
	);

	//test route for JWT protection
	//pass bearer token into request 
	router.get("/secret", passport.authenticate('jwt', { session: false }), (req, res) =>{
		res.json("Success! You can not see this without a token");
	});

	//TODO: anything good from this, implement in the one that works above
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