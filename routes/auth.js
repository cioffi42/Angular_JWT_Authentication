//Could have routes in individual files, this currently isn't used, but we can move our auth routes into here

const router = require('express').Router();
const knex = require("knex");
let db = knex(require("./knexfile"));

router.post('/register', (req, res) => {
    res.send('Register');
});


module.exports = router;