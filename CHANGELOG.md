# Sep 24

Delegate Error Message to the Client

Client side:
Add modal as a way to show message to the client.
Limit the allowable file type to only txt

Server side:
Add clientErrMsg function: handle internal error by sending error.ejs to the client
Now get('\*') catches 404 error and all other errors

# Sep 25

Add message to error.ejs
Changed file structure
Deleted config.js

# Oct 14

## Major Change!

Transfer from CommonJS module to ES module.

## Major Change!

Add MySQL database to the server.

# Oct 16

## 1

Add GET, POST methods to the server router:

GET: read file data from database and read file content from system

POST: insert file data into database and write file content from system

_I'm considering change the POST to PUT. PUT is more accurate here._

## 2

Now the title-container div is content-editable. I used the script to make sure that the filename can't have line breaks.

I also changed the editor to plaintext-only so that user is unable to add html contents to it and break the style.

## 3

_Next step is to separate the script for each component into different files to make it more organized_.

_Then compile all the scripts together when rendering the html_
