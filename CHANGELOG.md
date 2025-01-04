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

Now the title div is content-editable. I used the script to make sure that the filename can't have line breaks.

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

  * file-name -> title
  * editor / reader -> editor
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

Add interaction context menu to the Editor

## Standardization of Components

Each component is included in components.js.

Each script will acquire components (image view is an exception) from the components.js.

If the corresponding component is missing, the script will throw an error.

# December 25

Published the app on picbookgen.com on December 20

## Updates

* Local machine now uses local database instead of supabase
* Add dotenv package and .env file for the database url
* fixed style for Editor
* ejs now receives FileData[] type instead of string[]: solved the bug that file titles differ with contents in view
* change module from es2016 to node next (prevent import errors after tsc compilation)

# December 27

## Updates

* select image window - uncomplete
* improved the style of the page: now only scrollable element (editor)can be scrolled
* fixed that render vulnerability in errorhandler leads to source leak
* add idContainer to contain id information in editor
* change new file button to the form

# December 28

* select images window completed

# January 2

## Major UI Update

* editor and image routes now share the same page
  * enabling faster and more interactive experiences
* User now view file actions through context menu
  * Add option button to show context menu
  * This applies to editor, image and trash
* The rename action is now more intuitive.
  * The user can rename a file by clicking the title or rename option in context menu
  * This applies to editor and index page

## Minor Updates

* Renamed most js files so that they are arranged more intuitively
* Changed most icons to svg to reach max efficiency
* Add scripts to unify the experiences across different interfaces
* Improved the fluid title experience
* Change edit/../images endpoints to /access/.. endpoints
* Code practice: changed all var to const: use let when variable is necessary

# January 3

# Major Updates

* Fixed the bug in uploading image
  * upload image malfuncitons after first image upload
  * multiple images uploaded at the same time
* Add menu option to delete Link

# Minor Updates

* Change all components to string selectors
* Add dialog to the pages
* Add a button to delete all images at once

# To Do

* Solve the bug where selection inside of the anchor leads to multiple texts
* Button to delete all files at once (by repeatedly fetching)
* Generate Image!!!

# Janurary 4th

# Major Updates

* Disable user from adding link if link is involved in selection
* Button to reselect the image
* Reader now doesn't need any components from editor

# To Do
* Generate Image