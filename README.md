# Jeremy

Jeremy provides a framework for storing, searching and making accessible linked data objects in JSON format. It is based on elasticsearch as a datastore and search engine and provides a flexible type system for defining custom object types.

## Prerequisites

The following components need to be installed:
* node
* bower
* elasticsearch

## Install

Install backend dependencies:

    npm install

Install frontend dependencies

    bower install

Run jeremy

    node src/server.js

Jeremy should now be accessible at [localhost:1234/](http://localhost:1234/) .

You can now start adding mappings for custom types in `config/types/` and by implementing a custom user interface with AngularJS in `public/`.
