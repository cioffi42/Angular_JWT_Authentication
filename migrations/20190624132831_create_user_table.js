exports.up = function(knex, Promise) {
    return knex.schema.createTable('users', t => {
        t.increments('id').unsigned().primary();
        t.string('username').notNull();
        t.string('password').notNull();
    }).then(function () {
      return knex('users').insert([
        {username: "root", password: "root"},
      ]);
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTable('users');
  };
  