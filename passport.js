module.exports = function({db}) {

    const dotenv = require('dotenv');   //this should be the first thing you ever do
    dotenv.config();

    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    // const passportJWT = require('passport-jwt');
    // const JWTStrategy = passportJWT.Strategy;
    const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
    const bcrypt = require('bcryptjs');
    const Promise = require("bluebird");
    const util = require('util');

    passport.use('login', new LocalStrategy({  
        usernameField: 'username',
        passwordField: 'password',
    }, (username, password, done) => {
        Promise.try(() => {
            console.log(`username: ${username}`);
            return db('bands').from('users').where('username', username)
            .then((user) => {
                console.log(user);
                try{
                    if(user.length ===0) {
                       return done('Incorrect Username or Password');
                    }
                    console.log(`password: ${password},  user.password ${user[0].password}`);
                    bcrypt.compare(password, user[0].password, (err, res) => {
                        if(res) {
                            return done(null, user);
                        }
                        else{
                            return done('Incorrect Username or Password');
                        }
                    });
                } catch (error) {
                    done(error);
                }
            })
        })
    }));

    let opts = {}
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
    opts.secretOrKey = process.env.SECRET_OR_KEY;

    passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
        console.log(`payload: ${util.inspect(jwt_payload)}`);
        console.log(`payload: ${jwt_payload.username}`);
        Promise.try(() => {
            return db('bands').from('users').where('username', jwt_payload.username)
            .then((user) => {       //what to do if error or user DNE
                console.log(`user: ${util.inspect(user)}`);
                // if (err) {
                //     return done(err, false);
                // }
                if (user[0]) {
                    return done(null, user);
                } else {
                    console.log("user doesn't exist for that token");
                    return done(null, false);
                    // or you could create a new account
                }
            });
        });
    }));

    // passport.use(new JWTStrategy({
    //     jwtFromRequest: req => req.cookies.jwt,
    //     secretOrKey: process.env.SECRET_OR_KEY,
    // },
    // (jwtPayload, done) => {
    //     if (Date.now() > jwtPayload.expires) {
    //     return done('jwt expired');
    //     }

    //     return done(null, jwtPayload);
    // }   
    // ));

    //TODO check this
    passport.serializeUser(function(user, done) {
        done(null, user);
      });
    //TODO check this  
    passport.deserializeUser(function(user, done) {
    done(null, user);
    });
}
