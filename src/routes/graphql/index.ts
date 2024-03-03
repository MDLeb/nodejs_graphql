import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { GraphQLObjectType, GraphQLSchema, graphql } from 'graphql';
import { RootQuery } from './queries.js';

const gqlSchema = new GraphQLSchema({
  query: RootQuery
}) 

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const {query, variables} = req.body;
      return graphql({
        schema: gqlSchema,
        source: query,
        variableValues: variables
      });
    },
  });
};

export default plugin;
