import ReduxRouterEngine from 'electrode-redux-router-engine';
import React from 'react';
import {routes} from "../../client/routes";
import {createStore} from "redux";
import {graphql} from 'graphql';
import schema from './schema';
import rootReducer from "../../client/reducers";
import beerStyles from "../plugins/beer/data/styles.json";
import injectTapEventPlugin from 'react-tap-event-plugin';

const Promise = require("bluebird");
const fs = require('fs');
const DEFAULT_BEER_CARDS = 300;

function executeQuery(query) {
  return (resolve, reject) => {
    graphql(schema, query)
    .then((result) => {
      console.log(result.data);
      resolve(result.data);
    });
  }
}

function importBeers(styleId){
  let result = [];
  let counter = 0;

  let styleMetaData = fs.readFileSync(__dirname + '/../plugins/beer/data/beers-style-' + styleId + '-page-1.json', 'utf8');
  if(!styleMetaData) throw err;

  let totalPages = JSON.parse(styleMetaData).numberOfPages;

  for(let pages = 1; pages <= totalPages; pages++) {

    let styleData = fs.readFileSync(__dirname + '/../plugins/beer/data/beers-style-' + styleId + '-page-' + pages + '.json', 'utf8');
    if(!styleData) throw err;

    let parsedStyleData = JSON.parse(styleData);
    parsedStyleData = parsedStyleData.data;

    Object.keys(parsedStyleData).forEach(function(key) {
      result[counter++] = parsedStyleData[key];
    });
  }

  return result;
}

function queryInitializer(req) {
  let query = '';

  if(req.path === "/") {
    let firstRender = req.url.query.prefetch_cards ? req.url.query.prefetch_cards : DEFAULT_BEER_CARDS;
    // (limit: ${firstRender})
    query = `query {beerstyles {id, name}}`;
  } else if(req.path === "/beerstyle") {
    let styleId = Number(req.url.query.style);
    let data = null;
    let beersOfStyleID = importBeers(styleId);

    for (let i = 0; i < beerStyles.data.length; i++) {
      if (beerStyles.data[i].id === styleId){
        data = beerStyles.data[i];
        break;
      }
    }

    data.beers = beersOfStyleID; //(id: "${styleId}")
    query = `query {beerstyles(id: 1) { description}}`;
  } else if(req.path === "/beerdetails") {
    let styleId = Number(req.url.query.style);
    let beerId = req.url.query.beer;
    let data = null;
    let beers = importBeers(styleId);

    for (let i = 0; i < beers.length; i++) {
      if (beers[i].id === beerId){
        data = beers[i];
        break;
      }
    }

    initialState = {data};
  }

  return query;
}

function createReduxStore(req, match) {
  let query = queryInitializer(req);

  return Promise.all([
      new Promise(executeQuery(query)),
      Promise.resolve({})
    ]).then((values) => {
      const initialState = {data: values[0].beerstyles};
      return createStore(rootReducer, initialState);
  });
}

// This function is exported as the content for the webapp plugin.
//
// See config/default.json under plugins.webapp on specifying the content.
//
// When the Web server hits the routes handler installed by the webapp plugin, it
// will call this function to retrieve the content for SSR if it's enabled.

module.exports = (req) => {
  // For Warning: Material UI: userAgent should be supplied in the muiTheme context for server-side rendering
  global.navigator = global.navigator || {};
  global.navigator.userAgent = req.headers['user-agent'] || 'all';

  const app = req.server && req.server.app || req.app;
  if (!app.routesEngine) {
    // For Warning: Unknown prop `onTouchTap` on <button> tag.
    injectTapEventPlugin();
    app.routesEngine = new ReduxRouterEngine({routes, createReduxStore});
  }

  return app.routesEngine.render(req);
};
