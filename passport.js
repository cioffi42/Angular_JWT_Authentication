module.exports = function({db}) {

    const dotenv = require('dotenv');   //this should be the first thing you ever do
    dotenv.config();

    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    const passportJWT = require('passport-jwt');
    const JWTStrategy = passportJWT.Strategy;
    const bcrypt = require('bcryptjs');
    const Promise = require("bluebird");

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

    passport.use('jwt', new JWTStrategy({
        jwtFromRequest: req => req.cookies.jwt,
        secretOrKey: process.env.SECRET_OR_KEY,
    },
    (jwtPayload, done) => {
        if (Date.now() > jwtPayload.expires) {
        return done('jwt expired');
        }

        return done(null, jwtPayload);
    }
    ));

    //TODO check this
    passport.serializeUser(function(user, done) {
        done(null, user);
      });
    //TODO check this  
    passport.deserializeUser(function(user, done) {
    done(null, user);
    });
}
