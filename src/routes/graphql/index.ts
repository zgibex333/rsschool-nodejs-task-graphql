import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';

import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
  GraphQLInt,
} from 'graphql';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.post(
    '/',
    {
      schema: {
        body: graphqlBodySchema,
      },
    },
    async function (request, reply) {
      const UserType = new GraphQLObjectType({
        name: 'User',
        description: 'User Type',
        fields: () => ({
          id: { type: new GraphQLNonNull(GraphQLID) },
          firstName: { type: new GraphQLNonNull(GraphQLString) },
          lastName: { type: new GraphQLNonNull(GraphQLString) },
          email: { type: new GraphQLNonNull(GraphQLString) },
          subscribedToUserIds: {
            type: new GraphQLNonNull(new GraphQLList(GraphQLID)),
          },
        }),
      });
      const ProfileType = new GraphQLObjectType({
        name: 'Profile',
        description: 'Profile Type',
        fields: () => ({
          id: { type: new GraphQLNonNull(GraphQLID) },
          avatar: { type: new GraphQLNonNull(GraphQLString) },
          sex: { type: new GraphQLNonNull(GraphQLString) },
          birthday: { type: new GraphQLNonNull(GraphQLString) },
          country: { type: new GraphQLNonNull(GraphQLString) },
          street: { type: new GraphQLNonNull(GraphQLString) },
          city: { type: new GraphQLNonNull(GraphQLString) },
          memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
          userId: { type: new GraphQLNonNull(GraphQLID) },
        }),
      });
      const PostType = new GraphQLObjectType({
        name: 'Post',
        description: 'Post Type',
        fields: () => ({
          id: { type: new GraphQLNonNull(GraphQLID) },
          title: { type: new GraphQLNonNull(GraphQLString) },
          content: { type: new GraphQLNonNull(GraphQLString) },
          userId: { type: new GraphQLNonNull(GraphQLID) },
        }),
      });
      const MemberType = new GraphQLObjectType({
        name: 'MemberType',
        description: 'MemberType Type',
        fields: () => ({
          id: { type: new GraphQLNonNull(GraphQLID) },
          discount: { type: new GraphQLNonNull(GraphQLInt) },
          userId: { type: new GraphQLNonNull(GraphQLID) },
        }),
      });
      const DetailedUserType = new GraphQLObjectType({
        name: 'DetailedUserType',
        description: 'Detailed User Type',
        fields: () => ({
          user: { type: new GraphQLNonNull(UserType) },
          profile: { type: ProfileType },
          posts: { type: new GraphQLNonNull(new GraphQLList(PostType)) },
          memberType: { type: MemberType },
        }),
      });
      const ProfileWithSubscriptionsType = new GraphQLObjectType({
        name: 'ProfileWithSubscriptionsType',
        description: 'Profile With Subscriptions Type ',
        fields: () => ({
          user: { type: UserType },
          profile: { type: ProfileType },
          subscriptions: {
            type: new GraphQLNonNull(new GraphQLList(UserType)),
          },
        }),
      });

      const RootQueryType = new GraphQLObjectType({
        name: 'RootQueryType',
        description: 'Root Query Type',
        fields: () => ({
          users: {
            type: new GraphQLList(UserType),
            description: 'List of users',
            resolve: async () => await fastify.db.users.findMany(),
          },
          profiles: {
            type: new GraphQLList(ProfileType),
            description: 'List of profiles',
            resolve: async () => await fastify.db.profiles.findMany(),
          },
          posts: {
            type: new GraphQLList(PostType),
            description: 'List of posts',
            resolve: async () => await fastify.db.posts.findMany(),
          },
          memberTypes: {
            type: new GraphQLList(MemberType),
            description: 'List of memberTypes',
            resolve: async () => await fastify.db.memberTypes.findMany(),
          },
          user: {
            type: UserType,
            description: 'Single user by ID',
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (parent, args) => {
              const user = await fastify.db.users.findOne({
                key: 'id',
                equals: args.id,
              });
              return user;
            },
          },
          post: {
            type: PostType,
            description: 'Single post by ID',
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (parent, args) => {
              const post = await fastify.db.posts.findOne({
                key: 'id',
                equals: args.id,
              });
              return post;
            },
          },
          profile: {
            type: ProfileType,
            description: 'Single Profile by ID',
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (parent, args) => {
              const profile = await fastify.db.profiles.findOne({
                key: 'id',
                equals: args.id,
              });
              return profile;
            },
          },
          memberType: {
            type: MemberType,
            description: 'Single MemberType by ID',
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (parent, args) => {
              const memberType = await fastify.db.memberTypes.findOne({
                key: 'id',
                equals: args.id,
              });
              return memberType;
            },
          },
          detailedUser: {
            type: DetailedUserType,
            description: 'Detailed UserInfo by ID',
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (parent, args) => {
              const user = await fastify.db.users.findOne({
                key: 'id',
                equals: args.id,
              });
              if (!user) throw fastify.httpErrors.notFound();
              const profile = await fastify.db.profiles.findOne({
                key: 'userId',
                equals: args.id,
              });
              const posts = await fastify.db.posts.findMany({
                key: 'userId',
                equals: args.id,
              });

              const memberType = profile?.memberTypeId
                ? await fastify.db.memberTypes.findOne({
                    key: 'id',
                    equals: profile.memberTypeId,
                  })
                : null;

              return {
                user,
                profile,
                posts,
                memberType,
              };
            },
          },
          profileWithSubscriptions: {
            type: ProfileWithSubscriptionsType,
            description: 'User`s profile and subscriptions',
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (parent, args) => {
              const user = await fastify.db.users.findOne({
                key: 'id',
                equals: args.id,
              });
              if (!user) throw fastify.httpErrors.notFound();
              const profile = await fastify.db.profiles.findOne({
                key: 'userId',
                equals: args.id,
              });
              const subscriptions = await Promise.all(
                user.subscribedToUserIds.map(async (subId) => {
                  return await fastify.db.users.findOne({
                    key: 'id',
                    equals: subId,
                  });
                })
              );
              return {
                user,
                profile,
                subscriptions,
              };
            },
          },
        }),
      });

      const RootMutationType = new GraphQLObjectType({
        name: 'Mutation',
        description: 'Root Mutation',
        fields: () => ({
          addUser: {
            type: UserType,
            description: 'Add a user',
            args: {
              email: { type: new GraphQLNonNull(GraphQLString) },
              firstName: { type: new GraphQLNonNull(GraphQLString) },
              lastName: { type: new GraphQLNonNull(GraphQLString) },
            },
            resolve: async (parent, args) => {
              const newUser = await fastify.db.users.create(args);
              if (!newUser) throw fastify.httpErrors.HttpError;
              return newUser;
            },
          },
          addProfile: {
            type: ProfileType,
            description: 'Add a profile',
            args: {
              avatar: { type: new GraphQLNonNull(GraphQLString) },
              birthday: { type: new GraphQLNonNull(GraphQLString) },
              city: { type: new GraphQLNonNull(GraphQLString) },
              country: { type: new GraphQLNonNull(GraphQLString) },
              memberTypeId: { type: new GraphQLNonNull(GraphQLString) },
              sex: { type: new GraphQLNonNull(GraphQLString) },
              street: { type: new GraphQLNonNull(GraphQLString) },
              userId: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (parent, args) => {
              const newPost = await fastify.db.posts.create(args);
              if (!newPost) throw fastify.httpErrors.HttpError;
              return newPost;
            },
          },
          addPost: {
            type: PostType,
            description: 'Add a post',
            args: {
              content: { type: new GraphQLNonNull(GraphQLString) },
              title: { type: new GraphQLNonNull(GraphQLString) },
              userId: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (parent, args) => {
              const newPost = await fastify.db.posts.create(args);
              if (!newPost) throw fastify.httpErrors.HttpError;
              return newPost;
            },
          },
        }),
      });

      const taskSchema = new GraphQLSchema({
        query: RootQueryType,
        mutation: RootMutationType,
      });

      return await graphql({
        schema: taskSchema,
        source: String(request.body.query),
      });
    }
  );
};

export default plugin;
