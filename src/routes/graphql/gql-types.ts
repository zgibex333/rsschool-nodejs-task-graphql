import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import { UserEntity } from '../../utils/DB/entities/DBUsers';

export const MembershipIDsEnum = new GraphQLEnumType({
  name: 'MembershipIDsEnum',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});
export const UserType: any = new GraphQLObjectType({
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
    subscribedTo: {
      type: new GraphQLNonNull(new GraphQLList(UserType)),
      resolve: async (parent, _, context) => {
        return await Promise.all(
          parent.subscribedToUserIds.map(async (id: any) => {
            return await context.db.users.findOne({ key: 'id', equals: id });
          })
        );
      },
    },
    profile: {
      type: ProfileType,
      resolve: async (parent, _, context) => {
        const profile = await context.db.profiles.findOne({
          key: 'userId',
          equals: parent.id,
        });
        return profile;
      },
    },
    subscribedToUser: {
      type: new GraphQLNonNull(new GraphQLList(UserType)),
      resolve: async (parent, _, context) => {
        const allUsers = await context.db.users.findMany();
        const subscribers = allUsers.filter((user: UserEntity) =>
          user.subscribedToUserIds.includes(parent.id)
        );
        return subscribers;
      },
    },
    posts: {
      type: new GraphQLNonNull(new GraphQLList(PostType)),
      resolve: async (parent, _, context) => {
        const userPosts = await context.db.posts.findMany({
          key: 'userId',
          equals: parent.id,
        });
        return userPosts;
      },
    },
  }),
});
export const ProfileType = new GraphQLObjectType({
  name: 'Profile',
  description: 'Profile Type',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    memberTypeId: { type: new GraphQLNonNull(MembershipIDsEnum) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});
export const PostType = new GraphQLObjectType({
  name: 'Post',
  description: 'Post Type',
  fields: () => ({
    id: { type: new GraphQLNonNull(GraphQLID) },
    title: { type: new GraphQLNonNull(GraphQLString) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    userId: { type: new GraphQLNonNull(GraphQLID) },
  }),
});
export const MemberType = new GraphQLObjectType({
  name: 'MemberType',
  description: 'MemberType Type',
  fields: () => ({
    id: { type: new GraphQLNonNull(MembershipIDsEnum) },
    discount: { type: new GraphQLNonNull(GraphQLInt) },
    monthPostsLimit: { type: new GraphQLNonNull(GraphQLInt) },
  }),
});
export const DetailedUserType = new GraphQLObjectType({
  name: 'DetailedUserType',
  description: 'Detailed User Type',
  fields: () => ({
    user: { type: UserType },
    profile: { type: ProfileType },
    posts: { type: new GraphQLNonNull(new GraphQLList(PostType)) },
    memberType: { type: MemberType },
  }),
});
export const ProfileWithSubscriptionsType = new GraphQLObjectType({
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
export const PostsWithSubsribersType = new GraphQLObjectType({
  name: 'PostsWithSubsribersType',
  description: 'Posts With Subsribers Type',
  fields: () => ({
    user: { type: UserType },
    posts: { type: new GraphQLNonNull(new GraphQLList(PostType)) },
    subscribers: {
      type: new GraphQLNonNull(new GraphQLList(UserType)),
    },
  }),
});

export const SubsTreeType = new GraphQLObjectType({
  name: 'SubsTreeType',
  description: 'Subs Tree Type',
  fields: () => ({
    user: { type: UserType },
    subscriptions: {
      type: new GraphQLNonNull(new GraphQLList(SubsHelperType)),
    },
    subscribers: {
      type: new GraphQLNonNull(new GraphQLList(SubsHelperType)),
    },
  }),
});

export const SubsHelperType = new GraphQLObjectType({
  name: 'SubscriptionType',
  description: 'Subscription Type',

  fields: () => ({
    user: { type: UserType },
    subscriptions: {
      type: new GraphQLNonNull(new GraphQLList(UserType)),
    },
    subscribers: {
      type: new GraphQLNonNull(new GraphQLList(UserType)),
    },
  }),
});

// InputObjectTypes

export const ProfileInputType = new GraphQLInputObjectType({
  name: 'ProfileInputType',
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLID) },
    avatar: { type: new GraphQLNonNull(GraphQLString) },
    birthday: { type: new GraphQLNonNull(GraphQLInt) },
    city: { type: new GraphQLNonNull(GraphQLString) },
    country: { type: new GraphQLNonNull(GraphQLString) },
    memberTypeId: { type: new GraphQLNonNull(MembershipIDsEnum) },
    sex: { type: new GraphQLNonNull(GraphQLString) },
    street: { type: new GraphQLNonNull(GraphQLString) },
  },
});
export const PostInputType = new GraphQLInputObjectType({
  name: 'PostInputType',
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) },
  },
});
export const UserInputType = new GraphQLInputObjectType({
  name: 'UserInputType',
  fields: {
    email: { type: new GraphQLNonNull(GraphQLString) },
    firstName: { type: new GraphQLNonNull(GraphQLString) },
    lastName: { type: new GraphQLNonNull(GraphQLString) },
  },
});

export const UpdateUserInputType = new GraphQLInputObjectType({
  name: 'UpdateUserInputType',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    email: { type: GraphQLString },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
  },
});
export const UpdatePostInputType = new GraphQLInputObjectType({
  name: 'UpdatePostInputType',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    content: { type: GraphQLString },
    title: { type: GraphQLString },
  },
});
export const UpdateProfileInputType = new GraphQLInputObjectType({
  name: 'UpdateProfileInputType',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    avatar: { type: GraphQLString },
    birthday: { type: GraphQLInt },
    city: { type: GraphQLString },
    country: { type: GraphQLString },
    memberTypeId: { type: MembershipIDsEnum },
    sex: { type: GraphQLString },
    street: { type: GraphQLString },
  },
});
export const UpdateMemberTypeInputType = new GraphQLInputObjectType({
  name: 'UpdateMemberTypeInputType',
  fields: {
    id: { type: new GraphQLNonNull(MembershipIDsEnum) },
    discount: { type: GraphQLInt },
    monthPostsLimit: { type: GraphQLInt },
  },
});

// Subscribtions DTO

export const SubscribeToUserInputType = new GraphQLInputObjectType({
  name: 'SubscribeToUserInputType',
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLID) },
    subscribeToId: { type: new GraphQLNonNull(GraphQLID) },
  },
});

export const UnsubscribeFromUserInputType = new GraphQLInputObjectType({
  name: 'UnsubscribeFromUserInputType',
  fields: {
    userId: { type: new GraphQLNonNull(GraphQLID) },
    unsubscribeFromId: { type: new GraphQLNonNull(GraphQLID) },
  },
});
