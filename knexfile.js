module.exports = {
  client: 'pg',
  connection : 'postgres://postgres:password@localhost/bands'
  // connection: {
  //   host: "localhost",
  //   user: "postgress",
  //   password: "password", //how to not have this in plaintext? node ch05slide 28
  //   database: "jwt_test"
  // }
};
