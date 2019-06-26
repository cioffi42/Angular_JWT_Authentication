const router = require('express').Router();
const knex = require("knex");
let db = knex(require("./knexfile"));

router.post('/register', (req, res) => {
    res.send('Register');
});




module.exports = router;
