
exports.up = function(knex, Promise) {
    return knex.schema.createTable('bands', function(t) {
        t.text('name').notNull();
        t.text('city').nullable();
        t.text('country').nullable();
        t.text('yearFormed').nullable();
        t.specificType('genres', 'text ARRAY').nullable();
        t.increments('id').unsigned().primary();
    }).then(function () {
        return knex('bands').insert([
            {name: "Pink Floyd", city: "London", country: "England", 
            yearFormed: "1965", genres: ["Progressive rock", "psychedelic rock", "art rock"]},
            {name: "Morphine", city: "USA", country: "Boston", 
            yearFormed: "1990", genres: ["Alternative rock", "experimental rock", "jazz rock"]},
            {name: "Vitamin String Quartet", city: "USA", country: "Los Angeles", 
            yearFormed: "1999", genres: ["Rock", "Pop", "Instrumental"]},
            {name: "Slipknot", city: "Des Moines, IA", country: "USA", 
            yearFormed: "1995", genres: ["Heavy Metal", "Nu Metal"]},
            {name: "Sublime", city: "Long Beach, CA", country: "USA", 
            yearFormed: "1988", genres: ["Punk", "Ska", "Reggae-rock"]},
            {name: "Korn", city: "Bakersfield, CA", country: "USA", 
            yearFormed: "1992", genres: ["Nu Metal", "Alternative"]},
            {name: "Portishead", city: "Bristol", country: "UK", 
            yearFormed: "1991", genres: ["Trip Hop", "Experimental Rock", "Downtempo"]},
        ]);
    });
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('bands');
};