# DB Setup:

1. $ createdb bands                     //postgrse command to create bands database
1. $ knex migrate:latest                //this runs the latest version of all the knex migration files to create some tables in the bands dabase and add some data 

    ### you should now see a table 'bands' exists within the 'bands' db. can use pgadmin or psql cli