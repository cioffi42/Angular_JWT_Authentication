const dotenv = require('dotenv');   //this should be the first thing you ever do
dotenv.config();

const express = require('express');
const expressPromiseRouter = require("express-promise-router");
const path = require("path");
const bodyParser = require("body-parser");
const unhandledError = require("unhandled-error");
const passport = require("passport");


const knex = require('knex');
let db = knex(require("./knexfile"));


const PORT = process.env.PORT || 5678;

let errorReporter = unhandledError((err) => {
	/* This should eventually be hooked into some sort of error reporting
	   mechanism. */
	console.error("UNHANDLED ERROR:", err.stack);
});

/* The 'state' object is an object that we pass to everything that needs some
   sort of stateful dependency; all of the stateful dependencies are initialized
   here in server.js, and then passed into the modules that need them using a
   wrapper function. The wrapper function can unpack the stateful dependencies
   that it needs, eg. using object destructuring. */
let state = {
	db: db,
	errorReporter: errorReporter
}

const app = express();

//logtime and log request handlers
app.use(function (request, response, next) {
	console.log('Time: %d', Date.now(), request.method, request.url);
	console.log(request.headers);
    next();
});

/* All routers and middlewares are wrapped into an express-promise-router to
   make sure that error handling is consistent throughout the application. */
let router = expressPromiseRouter();

router.use(express.static(path.join(__dirname, "public")));
router.use(bodyParser.urlencoded({extended: true}));

router.use((req, res, next) => {
	/* This allows forms to display the previously specified values when the
	   input validation fails, and the form is shown to the user again (but with
       error mesages). */
	res.locals.body = req.body;

	/* Default value for the `errors` local, so that the templates don't throw
	   an error when displaying a form *without* errors. */
	res.locals.errors = {};

	next();
});

router.use(express.static(path.join(__dirname, "public")));
router.use(bodyParser.urlencoded({extended: true}));


require('./passport')(state);
app.use(passport.initialize());


router.use(require("./routes/index.js")(state));

app.use(router);

//PUT THIS LAST - no one should make it here...
app.use((req, res) => {	
	res.status(404).send('404 resource not found')
});





app.listen(PORT, () => {
	console.log(`Listening at http://localhost:${PORT}`);
});