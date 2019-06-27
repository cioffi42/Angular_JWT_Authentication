# DB Setup:

1. $ createdb bands                     //postgrse command to create bands database
1. $ knex migrate:latest                //this runs the latest version of all the knex migration files to create some tables in the bands dabase and add some data 

    ### you should now see a table 'bands' exists within the 'bands' db. can use pgadmin or psql 
    

# Current status:

the node and db code is pretty much done.

using postman, you can register a user, then login as that user, which gives you a jwt token.
any user can getbands, but if you want to create, update delete, you will need to be logged in.
if  you want to use the 'create, update delete' routes you need to have the token for an existing user, they're passport protected
when you use postman for the authenticated routes, you have to put the token in the authorization tab as a 'bearer token'

it definitely works and is clean now, but could use some research on best practices for error handling, i've lest some comments as notes. 

so an angular front end could be made to hook up to this, when logging in it'd need to put the token in an http cookie, not localstorage, then use that cookie for all that protected routes
there's some unused code and unused files, i've tried to make comments to highlight that, i've left them as references because they may be used to improve the existing code

