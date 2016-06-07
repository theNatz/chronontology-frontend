# Chronontology (Frontend)

## Prerequisites

The following components need to be installed:
* [NodeJS](https://nodejs.org/)
* [gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)

## Installation of Dependencies
`
Install development and production dependencies with the following commands within your chronontology-frontend directory

```
npm install
npm install -g bower gulp
``

##  Running the development server

In order to run the frontend in the development server use the following command:
```
npm run build
npm run server
```

Chronontology frontend will access the backend on port 8080 and is accessible at [localhost:1238/](http://localhost:1238/) .

Any changes made to HTML, SCSS or JS files should automatically trigger a browser reload.

## Deployment

Build the application by running

```
npm run build
```

After running "gulp build", chronontology-frontend lies inside the dist directory. 