import {
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

export const MembershipIDsEnum = new GraphQLEnumType({
  name: 'MembershipIDsEnum',
  values: {
    basic: { value: 'basic' },
    business: { value: 'business' },
  },
});
export const UserType = new GraphQLObjectType({
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
export const ProfileType = new GraphQLObjectType({
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
