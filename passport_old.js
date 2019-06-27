const dotenv = require('dotenv');   //this should be the first thing you ever do
dotenv.config();

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const bcryptjs = require('bcryptjs');

const UserModel = require('./models/user');

passport.use(new LocalStrategy({
  usernameField: username,
  passwordField: password,
}, async (username, password, done) => {
  try {
    const userDocument = await UserModel.findOne({username: username}).exec();
    const passwordsMatch = await bcryptjs.compare(password, userDocument.passwordHash);

    if (passwordsMatch) {
      return done(null, userDocument);
    } else {
      return done('Incorrect Username / Password');
    }
  } catch (error) {
    done(error);
  }
}));

passport.use(new JWTStrategy({
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


router.post('/login', (req, res) => {
  passport.authenticate(
    'local',
    { session: false },
    (error, user) => {

      if (error || !user) {
        res.status(400).json({ error });
      }

      /** This is what ends up in our JWT */
      const payload = {
        username: user.username,
        expires: Date.now() + parseInt(process.env.JWT_EXPIRATION_MS),
      };

      /** assigns payload to req.user */
      req.login(payload, {session: false}, (error) => {
        if (error) {
          res.status(400).send({ error });
        }

        /** generate a signed json web token and return it in the response */
        const token = jwt.sign(JSON.stringify(payload), keys.secret);

        /** assign our jwt to the cookie */
        res.cookie('jwt', jwt, { httpOnly: true, secure: true });
        res.status(200).send({ username });
      });
    },
  )(req, res);
});