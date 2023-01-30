import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { graphqlBodySchema } from './schema';
import { validate } from 'graphql/validation';
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLID,
} from 'graphql';
import {
  MembershipIDsEnum,
  MemberType,
  PostInputType,
  PostType,
  ProfileInputType,
  ProfileType,
  SubscribeToUserInputType,
  UnsubscribeFromUserInputType,
  UpdateMemberTypeInputType,
  UpdatePostInputType,
  UpdateProfileInputType,
  UpdateUserInputType,
  UserInputType,
  UserType,
} from './gql-types';
import { UserEntity } from '../../utils/DB/entities/DBUsers';
import depthLimit from 'graphql-depth-limit';
import gglTag from 'graphql-tag';

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
              user: { type: UserInputType },
            },
            resolve: async (parent, args) => {
              if (!args.user)
                throw fastify.httpErrors.badRequest('Provide required fields');
              const { email, firstName, lastName } = args.user;
              if (
                typeof email !== 'string' ||
                !email ||
                typeof firstName !== 'string' ||
                !firstName ||
                typeof lastName !== 'string' ||
                !lastName
              )
                throw fastify.httpErrors.badRequest(
                  'All fields of correct type are required'
                );
              const newUser = await fastify.db.users.create(args.user);
              if (!newUser) throw fastify.httpErrors.HttpError;
              return newUser;
            },
          },
          addProfile: {
            type: ProfileType,
            description: 'Add a profile',
            args: { profile: { type: ProfileInputType } },
            resolve: async (parent, args) => {
              if (!args.profile)
                throw fastify.httpErrors.badRequest('Provide required fields');
              const {
                avatar,
                birthday,
                city,
                country,
                memberTypeId,
                sex,
                street,
                userId,
              } = args.profile;
              if (
                typeof avatar !== 'string' ||
                !avatar ||
                typeof city !== 'string' ||
                !city ||
                typeof country !== 'string' ||
                !country ||
                typeof memberTypeId !== 'string' ||
                !memberTypeId ||
                typeof sex !== 'string' ||
                !sex ||
                typeof street !== 'string' ||
                !street ||
                typeof userId !== 'string' ||
                !userId ||
                typeof birthday !== 'number'
              )
                throw fastify.httpErrors.badRequest(
                  'All fields of correct type are required'
                );
              const user = await fastify.db.users.findOne({
                key: 'id',
                equals: args.profile.userId,
              });
              const duplicate = !!(await fastify.db.profiles.findOne({
                key: 'userId',
                equals: args.profile.userId,
              }));
              if (!user)
                throw fastify.httpErrors.badRequest("User doesn't exist");
              if (duplicate) {
                throw fastify.httpErrors.badRequest('User already has profile');
              }
              const newPost = await fastify.db.profiles.create(args.profile);
              if (!newPost) throw fastify.httpErrors.HttpError;
              return newPost;
            },
          },
          addPost: {
            type: PostType,
            description: 'Add a post',
            args: {
              post: { type: PostInputType },
            },
            resolve: async (parent, args) => {
              if (!args.post)
                throw fastify.httpErrors.badRequest('Provide required fields');
              const { content, title, userId } = args.post;
              if (
                typeof content !== 'string' ||
                typeof title !== 'string' ||
                typeof userId !== 'string' ||
                !content ||
                !title ||
                !userId
              )
                throw fastify.httpErrors.badRequest();
              const user = await fastify.db.users.findOne({
                key: 'id',
                equals: args.post.userId,
              });
              if (!user)
                throw fastify.httpErrors.badRequest("User doesn't exist");
              const newPost = await fastify.db.posts.create(args.post);
              if (!newPost) throw fastify.httpErrors.HttpError;
              return newPost;
            },
          },
          updateUser: {
            type: UserType,
            description: 'Update user',
            args: {
              userInfo: { type: UpdateUserInputType },
            },
            resolve: async (parent, args): Promise<UserEntity> => {
              if (!args.userInfo)
                throw fastify.httpErrors.badRequest('Provide required fields');
              const { id, email, firstName, lastName } = args.userInfo;
              if (
                !(
                  (typeof email === 'string' && email) ||
                  (typeof firstName === 'string' && firstName) ||
                  (typeof lastName === 'string' && lastName)
                )
              )
                throw fastify.httpErrors.badRequest(
                  'Provide at least one field with correct type'
                );
              const user = await fastify.db.users.findOne({
                key: 'id',
                equals: id,
              });
              if (!user) throw fastify.httpErrors.notFound();
              const updatedUser = await fastify.db.users.change(user.id, {
                email: email ?? user.email,
                firstName: firstName ?? user.firstName,
                lastName: lastName ?? user.lastName,
              });
              return updatedUser;
            },
          },
          updateProfile: {
            type: ProfileType,
            description: 'Profile Type',
            args: {
              profileInfo: {
                type: UpdateProfileInputType,
              },
            },
            resolve: async (parent, args) => {
              if (!args.profileInfo)
                throw fastify.httpErrors.badRequest('Provide required fields');
              const {
                id,
                avatar,
                birthday,
                city,
                country,
                memberTypeId,
                sex,
                street,
              } = args.profileInfo;
              if (
                !(
                  (typeof avatar === 'string' && avatar) ||
                  (typeof city === 'string' && city) ||
                  (typeof country === 'string' && country) ||
                  (typeof memberTypeId === 'string' && memberTypeId) ||
                  (typeof sex === 'string' && sex) ||
                  (typeof street === 'string' && street) ||
                  typeof birthday === 'number'
                )
              )
                throw fastify.httpErrors.badRequest(
                  'Provide at least one field with correct type'
                );
              const profile = await fastify.db.profiles.findOne({
                key: 'id',
                equals: id,
              });
              if (!profile) throw fastify.httpErrors.notFound();
              const updatedProfile = await fastify.db.profiles.change(
                profile.id,
                {
                  avatar: avatar ?? profile.avatar,
                  city: city ?? profile.city,
                  country: country ?? profile.country,
                  memberTypeId: memberTypeId ?? profile.memberTypeId,
                  sex: sex ?? profile.sex,
                  street: street ?? profile.street,
                  birthday: birthday ?? profile.birthday,
                }
              );
              return updatedProfile;
            },
          },
          updatePost: {
            type: PostType,
            description: 'Post Type',
            args: {
              postInfo: {
                type: UpdatePostInputType,
              },
            },
            resolve: async (parent, args) => {
              if (!args.postInfo)
                throw fastify.httpErrors.badRequest('Provide required fields');
              const { id, content, title } = args.postInfo;
              if (
                !(
                  (typeof content === 'string' && content) ||
                  (typeof title === 'string' && title)
                )
              )
                throw fastify.httpErrors.badRequest(
                  'Provide at least one field with correct type'
                );
              const post = await fastify.db.posts.findOne({
                key: 'id',
                equals: id,
              });
              if (!post) throw fastify.httpErrors.notFound();
              const updatedPost = await fastify.db.posts.change(post.id, {
                content: content ?? post.content,
                title: title ?? post.title,
              });
              return updatedPost;
            },
          },
          updateMemberType: {
            type: MemberType,
            description: 'UpdateMemberTypeType',
            args: {
              memberTypeInfo: {
                type: UpdateMemberTypeInputType,
              },
            },
            resolve: async (parent, args) => {
              if (!args.memberTypeInfo)
                throw fastify.httpErrors.badRequest('Provide required fields');
              const { id, discount, monthPostsLimit } = args.memberTypeInfo;
              const memberType = await fastify.db.memberTypes.findOne({
                key: 'id',
                equals: id,
              });
              if (!memberType) throw fastify.httpErrors.badRequest();
              if (
                !(
                  typeof discount === 'number' ||
                  typeof monthPostsLimit === 'number'
                )
              )
                throw fastify.httpErrors.badRequest(
                  'Provide at least one field with correct type'
                );
              const updateMemberType = await fastify.db.memberTypes.change(id, {
                discount: discount ?? memberType.discount,
                monthPostsLimit: monthPostsLimit ?? memberType.monthPostsLimit,
              });
              return updateMemberType;
            },
          },
          subscribeToUser: {
            type: UserType,
            description: 'Subscribe To User',
            args: {
              subscribeInfo: { type: SubscribeToUserInputType },
            },
            resolve: async (parent, args) => {
              if (!args.subscribeInfo)
                throw fastify.httpErrors.badRequest('Provide required fields');
              const { userId, subscribeToId } = args.subscribeInfo;
              const user = await fastify.db.users.findOne({
                key: 'id',
                equals: userId,
              });
              const subscription = await fastify.db.users.findOne({
                key: 'id',
                equals: subscribeToId,
              });
              if (!user || !subscription)
                throw fastify.httpErrors.badRequest("Entity(ies) don't exist");
              const { subscribedToUserIds } = user;
              if (subscribedToUserIds.includes(subscription.id))
                throw fastify.httpErrors.unprocessableEntity(
                  'Already subscribed'
                );
              const updatedSubscriptions = [
                ...subscribedToUserIds,
                subscription.id,
              ];
              const updatedUser = await fastify.db.users.change(userId, {
                subscribedToUserIds: updatedSubscriptions,
              });
              return updatedUser;
            },
          },
          unsubscribeFromUser: {
            type: UserType,
            description: 'Unsubscribe from user',
            args: {
              unsubscribeInfo: {
                type: UnsubscribeFromUserInputType,
              },
            },
            resolve: async (parent, args) => {
              if (!args.unsubscribeInfo)
                throw fastify.httpErrors.badRequest('Provide required fields');
              const { userId, unsubscribeFromId } = args.unsubscribeInfo;
              const user = await fastify.db.users.findOne({
                key: 'id',
                equals: userId,
              });
              const subscription = await fastify.db.users.findOne({
                key: 'id',
                equals: unsubscribeFromId,
              });
              if (!user || !subscription)
                throw fastify.httpErrors.badRequest("Entity(ies) don't exist");
              const { subscribedToUserIds } = user;
              if (!subscribedToUserIds.includes(subscription.id))
                throw fastify.httpErrors.unprocessableEntity(
                  'Already unsubscribed'
                );
              const updatedSubscriptions = subscribedToUserIds.filter(
                (id) => id !== subscription.id
              );
              const updatedUser = await fastify.db.users.change(userId, {
                subscribedToUserIds: updatedSubscriptions,
              });
              return updatedUser;
            },
          },
        }),
      });

      const taskSchema = new GraphQLSchema({
        query: RootQueryType,
        mutation: RootMutationType,
      });
      const depth = 6;
      let isValid = true;
      if (request.body.query) {
        const validation = validate(taskSchema, gglTag(request.body.query), [
          depthLimit(depth),
        ]);
        if (validation.length > 0) isValid = false;
      }
      if (!isValid) {
        const responseError = {
          errors: [
            {
              message: `Max depth is ${depth}`,
            },
          ],
          data: null,
        };
        reply.send({ responseError });
        return;
      }

      return await graphql({
        schema: taskSchema,
        source: String(request.body.query),
        contextValue: fastify,
        variableValues: request.body.variables,
      });
    }
  );
};

export default plugin;
