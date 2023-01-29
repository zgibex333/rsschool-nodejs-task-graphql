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
} from 'graphql';
import {
  DetailedUserType,
  MembershipIDsEnum,
  MemberType,
  PostsWithSubsribersType,
  PostType,
  ProfileType,
  ProfileWithSubscriptionsType,
  SubsTreeType,
  UserType,
} from './gql-types';

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
      const RootQueryType = new GraphQLObjectType({
        name: 'RootQueryType',
        description: 'Root Query Type',
        fields: () => ({
          users: {
            type: new GraphQLList(UserType),
            description: 'List of users',
            resolve: async (parent, args) => await fastify.db.users.findMany(),
          },
          profiles: {
            type: new GraphQLList(ProfileType),
            description: 'List of profiles',
            resolve: async (parent, args) =>
              await fastify.db.profiles.findMany(),
          },
          posts: {
            type: new GraphQLList(PostType),
            description: 'List of posts',
            resolve: async (parent, args) => await fastify.db.posts.findMany(),
          },
          memberTypes: {
            type: new GraphQLList(MemberType),
            description: 'List of memberTypes',
            resolve: async (parent, args) =>
              await fastify.db.memberTypes.findMany(),
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
              id: { type: new GraphQLNonNull(MembershipIDsEnum) },
            },
            resolve: async (parent, args) => {
              const memberType = await fastify.db.memberTypes.findOne({
                key: 'id',
                equals: args.id,
              });
              return memberType;
            },
          },
          detailedUsers: {
            type: new GraphQLNonNull(new GraphQLList(DetailedUserType)),
            description: 'Detailed All Users Info',
            resolve: async () => {
              const users = await fastify.db.users.findMany();
              if (!users.length) return [];
              return await Promise.all(
                users.map(async (user) => {
                  const profile = await fastify.db.profiles.findOne({
                    key: 'userId',
                    equals: user.id,
                  });
                  const posts = await fastify.db.posts.findMany({
                    key: 'userId',
                    equals: user.id,
                  });
                  const memberType = profile?.memberTypeId
                    ? await fastify.db.memberTypes.findOne({
                        key: 'id',
                        equals: profile.memberTypeId,
                      })
                    : null;
                  return {
                    user,
                    posts,
                    memberType,
                    profile,
                  };
                })
              );
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
          postsWithSubscribers: {
            type: PostsWithSubsribersType,
            description: 'User`s posts and subscribers',
            args: {
              id: { type: new GraphQLNonNull(GraphQLID) },
            },
            resolve: async (parent, args) => {
              const user = await fastify.db.users.findOne({
                key: 'id',
                equals: args.id,
              });
              if (!user) throw fastify.httpErrors.notFound();
              const posts = await fastify.db.posts.findMany({
                key: 'userId',
                equals: args.id,
              });
              const allUsers = await fastify.db.users.findMany();
              const subscribers = allUsers.filter((user) =>
                user.subscribedToUserIds.includes(args.id)
              );
              return {
                user,
                posts,
                subscribers,
              };
            },
          },
          subsTree: {
            type: new GraphQLNonNull(new GraphQLList(SubsTreeType)),
            description: 'Subs Tree',
            resolve: async () => {
              const users = await fastify.db.users.findMany();

              const result = await Promise.all(
                // map all users to get fields
                users.map(async (user) => {
                  // user's subscriptions
                  const ids = user.subscribedToUserIds;
                  const subscriptions = await Promise.all(
                    // <-- ready nested object
                    ids.map(async (id) => {
                      // here is one
                      const subscription = await fastify.db.users.findOne({
                        // <-- inner user
                        key: 'id',
                        equals: id,
                      });
                      // find this one's subscriptions
                      const subsctiptionSubscriptions = // <-- next to it his subscriptions
                        subscription?.subscribedToUserIds
                          ? await Promise.all(
                              subscription.subscribedToUserIds.map(
                                async (id) => {
                                  return await fastify.db.users.findOne({
                                    key: 'id',
                                    equals: id,
                                  });
                                }
                              )
                            )
                          : [];
                      // now find this one's subscribers
                      const subsctiptionSubscribers = subscription?.id // <-- next to it his subs
                        ? users.filter((possibleSub) =>
                            possibleSub.subscribedToUserIds.includes(
                              subscription.id
                            )
                          )
                        : [];
                      // done, return nested one
                      return {
                        user: subscription,
                        subscriptions: subsctiptionSubscriptions,
                        subscribers: subsctiptionSubscribers,
                      };
                    })
                  );
                  const subscribers = users.filter((possibleSub) =>
                    possibleSub.subscribedToUserIds.includes(user.id)
                  );
                  const subscribersSubscriptions = await Promise.all(
                    // <-- ready nested object
                    subscribers.map(async (subscriber) => {
                      // find this one's subscriptions
                      const subsctiptionSubscriptions = // <-- next to it his subscriptions
                        await Promise.all(
                          subscriber.subscribedToUserIds.map(async (id) => {
                            return await fastify.db.users.findOne({
                              key: 'id',
                              equals: id,
                            });
                          })
                        );

                      // now find this one's subscribers
                      const subsctiptionSubscribers =
                        users.filter((possibleSub) =>
                            possibleSub.subscribedToUserIds.includes(
                              subscriber.id
                            )
                          )
                      // done, return nested one
                      return {
                        user: subscriber,
                        subscriptions: subsctiptionSubscriptions,
                        subscribers: subsctiptionSubscribers,
                      };
                    })
                  );
                  return {
                    user,
                    subscriptions,
                    subscribers: subscribersSubscriptions,
                  };
                })
              );
              return result;
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
              memberTypeId: { type: new GraphQLNonNull(MembershipIDsEnum) },
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
              const user = await fastify.db.users.findOne({
                key: 'id',
                equals: args.userId,
              });
              if (!user)
                throw fastify.httpErrors.badRequest("User doesn't exist");
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
