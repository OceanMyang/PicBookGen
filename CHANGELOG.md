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

# Oct 18

* Reorganized the frontend file structure.

  * Removed the public directory
  * Add css and js directories
* Separated different components' codes into different files

  * For example: $("#image-viewer").on ... -> imageViewer.js
* Renamed html components

  * file-name -> title-container
  * editor / reader -> text-container
  * new-file / save-file / add-link -> new-file save-file upload-image
  * back -> index-button
* Align the index-button with the file title

# December 12

* Add /upload endpoint to the router
  * Only support upload txt file
  * Temporarily store the file in the uploads/ folder
  * Check if the file is a text-plain file
    * If not: remove the file from the tmp folder
    * Else: mv the file from the uploads to the actual file storage

# December 13

* Add upload image functionality to the app
  * Store the uploaded image into the respective file folder

# December 18

* Upload Image, read all images, and delete images
* Link and unlink
* Client side scripts are compiled in modules
* next: update ui and add floating menu when uploading image

# December 19

## Major UI Update

Add interaction action menu to the text container

## Standardization of Components

Each component is included in components.js.

Each script will acquire components (image view is an exception) from the components.js.

If the corresponding component is missing, the script will throw an error.
