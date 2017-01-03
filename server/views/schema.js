import {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLID,
  GraphQLList
} from 'graphql/type';
import beerStyles from "../plugins/beer/data/styles.json";

const categoryType = new GraphQLObjectType({
  name: 'category',
  fields: () => {
    return {
      id: {type: GraphQLID},
      name: {type: GraphQLString}
    }
  }
});

const BeerStylesType = new GraphQLObjectType({
  name: 'beerstyles',
  fields: () => {
    return {
      id: {type: GraphQLInt},
      abvMax: {type: GraphQLInt},
      abvMin: {type: GraphQLInt},
      categoryId: {type: GraphQLInt},
      description: {type: GraphQLString},
      fgMax: {type: GraphQLFloat},
      fgMin: {type: GraphQLFloat},
      ibuMax: {type: GraphQLInt},
      ibuMin: {type: GraphQLInt},
      name: {type: GraphQLString},
      ogMin: {type: GraphQLFloat},
      shortName: {type: GraphQLString},
      srmMax: {type: GraphQLInt},
      srmMin: {type: GraphQLInt},
      category: {type: categoryType}
    }
  }
});

const queryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => {
    return {
      beerstyles: {
        type: new GraphQLList(BeerStylesType),
        args: {
          id: {
            type: GraphQLInt
          }
        },
        resolve: (args) => {
          return new Promise((resolve, reject) => {
            console.log('------------', beerStyles.data);
            resolve(beerStyles.data.beerstyles[args.id]);
          });
        }
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: queryType
});
