# Chronontology (Frontend)

## Prerequisites

The following components need to be installed:
* [NodeJS](https://nodejs.org/)
* [gulp](https://github.com/gulpjs/gulp/blob/master/docs/getting-started.md)

## Installation of Dependencies

Install development and production dependencies with the following commands within your chronontology-frontend directory

```
npm install
```

##  Running the development server

In order to run the frontend in the development server use the following command:
```
npm start
```

Chronontology frontend will access the backend on port 4567 and is accessible at [localhost:1238/](http://localhost:1238/). You can use a different backend instance by setting `backendUri` in `dev-config.json` (for example to http://chronontology.dainst.org/data in order to use the production backend).

Any changes made to HTML, SCSS or JS files should automatically trigger a browser reload.

## Deployment

Build the application by running

```
npm run build
```

After building, chronontology-frontend lies inside the dist directory. 
