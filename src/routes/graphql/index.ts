import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { GraphQLObjectType, GraphQLSchema, graphql } from 'graphql';
import { RootQuery } from './queries.js';
import { Mutation } from './mutations.js';

const gqlSchema = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
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
      const { query, variables } = req.body;
      try {
        const { data, errors } = await graphql({
          schema: gqlSchema,
          source: query,
          variableValues: variables
        });
        return { data, errors };
      }
      catch (error) {
        return { errors: [error] };
      }

    },

  });
};

export default plugin;
