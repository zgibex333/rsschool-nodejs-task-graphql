## Assignment: Graphql

### Tasks:

1. Add logic to the restful endpoints (users, posts, profiles, member-types folders in ./src/routes).  
   1.1. npm run test - 100%
2. Add logic to the graphql endpoint (graphql folder in ./src/routes).  
    Constraints and logic for gql queries should be done based on restful implementation.  
    For each subtask provide an example of POST body in the PR.  
    All dynamic values should be sent via "variables" field.  
    If the properties of the entity are not specified, then return the id of it.  
    `userSubscribedTo` - these are users that the current user is following.  
    `subscribedToUser` - these are users who are following the current user.

- Get gql requests:  
     2.1. Get users, profiles, posts, memberTypes - 4 operations in one query.

   ```
   query {
      users {
         id
         firstName
         lastName
         subscribedToUserIds
      }
      profiles {
         id
         avatar
         sex
         birthday
         country
         street
         city
         memberTypeId
         userId
      }
      posts {
         id
         title
         content
         userId
      }
      memberTypes {
         id
         discount
         monthPostsLimit
      }
   }

   ```

   2.2. Get user, profile, post, memberType by id - 4 operations in one query.

   ```

   query GET_UNIT_BY_ID(
      $userId: ID!
      $profileId: ID!
      $postId: ID!
      $memberTypeId: MembershipIDsEnum!
   ) {
      user(id: $userId) {
         id
         firstName
         lastName
         email
         subscribedToUserIds
      }
      profile(id: $profileId) {
         avatar
         sex
      }
      post(id: $postId) {
         title
         content
         userId
      }
      memberType(id: $memberTypeId) {
         id
         discount
         monthPostsLimit
      }
   }

   QUERY VARIABLES
   {
      "userId": "89865dfe-0d46-408f-83fe-cf46303f20d0",
      "profileId": "string_value",
      "postId": "string_value",
      "memberTypeId": "basic"
   }

   ```

   2.3. Get users with their posts, profiles, memberTypes.

   ```

   query USERS_WITH_DETAILS {
      users {
         id
         email
         subscribedToUserIds

         profile {
            userId
            memberTypeId
            sex
         }
         posts {
            userId
            title
            id
         }
         memberType {
            id
            discount
            monthPostsLimit
         }
      }
   }

   ```

   2.4. Get user by id with his posts, profile, memberType.

   ```

   query USER_WITH_DETAIL($id: ID!) {
      user(id: $id) {
         id
         email
         subscribedToUserIds
         profile {
            userId
            memberTypeId
            sex
         }
         posts {
            userId
            title
            id
         }
         memberType {
            id
            discount
            monthPostsLimit
         }
      }
   }

   QUERY VARIABLES
   {
      "id": "89865dfe-0d46-408f-83fe-cf46303f20d0"
   }

   ```

   2.5. Get users with their `userSubscribedTo`, profile.

   ```

   query USERS_PROFILE_WITH_SUBSCRIBED_TO {
      users {
         firstName
         subscribedTo {
            id
            firstName
            lastName
         }
         profile {
            sex
            userId
            id
         }
      }
   }

   ```

   2.6. Get user by id with his `subscribedToUser`, posts.

   ```
   query GET_POSTS_AND_SUBSCRIBERS($id: ID!) {
      user(id: $id) {
         posts {
            title
         }
         subscribedToUser {
            id
            email
         }
      }
   }

   QUERY VARIABLES 
   {
      "id": "4b1efa1a-2898-45ef-ad21-7e57d3f62b82"
   }

   ```

   2.7. Get users with their `userSubscribedTo`, `subscribedToUser` (additionally for each user in `userSubscribedTo`, `subscribedToUser` add their `userSubscribedTo`, `subscribedToUser`).

   ```
   query {
      users {
         id
         subscribedTo {
            id
            subscribedTo {
               id
            }
            subscribedToUser {
               id
            }
         }
         subscribedToUser {
            id
            subscribedTo {
               id
            }
            subscribedToUser {
               id
            }
         }
      }
   }


   ```

- Create gql requests:  
     2.8. Create user.

   ```

   mutation ADD_USER($user: UserInputType) {
      addUser(user: $user) {
         firstName
         email
         id
      }
   }

   QUERY VARIABLES
   {
      "user": {
         "email": "random_email@mail.ru",
         "firstName": "random_firstname",
         "lastName": "random_lastname"
      }
   }


   ```

   2.9. Create profile.  
   ```
   mutation ADD_PROFILE ($profile: ProfileInputType) {
      addProfile(profile: $profile) {
         id
         avatar
         birthday
      }
   }   

   QUERY VARIABLES
   {
      "profile": {
        "userId": "89865dfe-0d46-408f-83fe-cf46303f20d0", 
        "avatar":"https://qweq/image.png", 
        "birthday": 2000, 
        "city": "New York", 
        "country": "USA", 
        "memberTypeId": "basic", 
        "sex": "Male", 
        "street": "Queens, st.Anger 130209"
      }
   }

   ```
   2.10. Create post.  
   ```

   mutation CREATE_POST ($post: PostInputType) {
      addPost(post: $post) {
         id
         title
         content
         userId
      }
   }


   QUERY VARIABLES
   {
      "post": {
      "content": "lorem2000", 
      "title": "postTitle",
      "userId": "89865dfe-0d46-408f-83fe-cf46303f20d0"
      }
   }

   ```
   2.11. [InputObjectType](https://graphql.org/graphql-js/type/#graphqlinputobjecttype) for DTOs.

- Update gql requests:  
   2.12. Update user.  
   ```

   mutation UPDATE_USER($user: UpdateUserInputType) {
      updateUser(userInfo: $user) {
         firstName
         lastName
         email
      }
   }

   QUERY VARIABLES 
   {
      "user": {
         "id": "89865dfe-0d46-408f-83fe-cf46303f20d0",
         "email": "random_email@ffmail.ru",
         "firstName": "random_firstname",
         "lastName": "random_lastname"
      }
   }


   ```
   2.13. Update profile.
   ```

   mutation UPDATE_PROFILE($profileInfo: UpdateProfileInputType) {
      updateProfile(profileInfo: $profileInfo) {
         avatar
         birthday
         id
         sex 
         city
         street
         memberTypeId
      }
   }   

   QUERY VARIABLES 
   {
      "profileInfo": {
         "id": "1927eb64-1020-49a9-9044-bfaf9baf4595",
         "avatar":"https://qweq/image.kawagepng", 
         "birthday": 1993, 
         "city": "Boston", 
         "street": "Queens, st.Anger 130209"
      }
   }

   ```  
   2.14. Update post.  
   ```

   mutation UPDATE_POST($postInfo: UpdatePostInputType) {
      updatePost(postInfo: $postInfo) {
         id
         title
         content
         userId
      }
   }

   QUERY VARIABLES 
   {
      "postInfo": {
         "id": "423432432", 
         "title": "34234", 
         "content":"32432432"
      }
   }

   ```
   2.15. Update memberType.  
   ```
   mutation UPDATE_MEMBER_TYPE ($memberTypeInfo: UpdateMemberTypeInputType) {
      updateMemberType(memberTypeInfo: $memberTypeInfo) {
         id
         discount
         monthPostsLimit
      }
   }

   QUERY VARIABLES
   {
      "memberTypeInfo": {
         "id": "basic", 
         "discount": 95, 
         "monthPostsLimit": 100
      }
   }
   ```
   2.16. Subscribe to; unsubscribe from.  
   ```
   mutation SUBSCRIBE_TO_USER($subscribeInfo: SubscribeToUserInputType) {
      subscribeToUser(subscribeInfo: $subscribeInfo) {
         id
         subscribedToUserIds
      }
   }

   QUERY VARIABLES
   {
      "subscribeInfo": {
         "userId": "e714940d-86a8-488d-ac2d-a9a12ee9c8fc", 
         "subscribeToId": "48a2b769-6b89-4247-9fa7-6a09a9f1134b"
      }
   }

   #####################################

   mutation UNSUBSCRIBE_FROM_USER($unsubscribeInfo: UnsubscribeFromUserInputType) {
      unsubscribeFromUser(unsubscribeInfo: $unsubscribeInfo) {
         id
         subscribedToUserIds
      }
   }

   QUERY VARIABLES
   {
      "unsubscribeInfo": {
         "userId": "1ba718d5-534d-4135-b3ef-dc33eff4a9d6", 
         "unsubscribeFromId" : "8991696f-b757-4dae-8299-a793f5a849a5"
      }
   }

   ```
   2.17. [InputObjectType](https://graphql.org/graphql-js/type/#graphqlinputobjecttype) for DTOs.

3. Solve `n+1` graphql problem with [dataloader](https://www.npmjs.com/package/dataloader) package in all places where it should be used.  
   You can use only one "findMany" call per loader to consider this task completed.  
   It's ok to leave the use of the dataloader even if only one entity was requested. But additionally (no extra score) you can optimize the behavior for such cases => +1 db call is allowed per loader.  
   3.1. List where the dataloader was used with links to the lines of code (creation in gql context and call in resolver).
4. Limit the complexity of the graphql queries by their depth with [graphql-depth-limit](https://www.npmjs.com/package/graphql-depth-limit) package.  
   4.1. Provide a link to the line of code where it was used.  
   [Show where it was used](https://github.com/zgibex333/rsschool-nodejs-task-graphql/blob/cae6c4277b7be7de8cdb71b665571b78053b8f24/src/routes/graphql/index.ts#L478)
   4.2. Specify a POST body of gql query that ends with an error due to the operation of the rule. Request result should be with `errors` field (and with or without `data:null`) describing the error.
   ```
   CAUSES ERROR - <MAX DEPTH IS 6>
   query {
      users {
         id
         subscribedTo {
            id
            subscribedTo {
               id
               subscribedTo {
                  id
                  subscribedTo {
                     id
                     subscribedTo {
                        id
                        subscribedTo {
                           id
                        }
                     }
                  }
               }
            }
         }
      }
   }
   ```

### Description:

All dependencies to complete this task are already installed.  
You are free to install new dependencies as long as you use them.  
App template was made with fastify, but you don't need to know much about fastify to get the tasks done.  
All templates for restful endpoints are placed, just fill in the logic for each of them.  
Use the "db" property of the "fastify" object as a database access methods ("db" is an instance of the DB class => ./src/utils/DB/DB.ts).  
Body, params have fixed structure for each restful endpoint due to jsonSchema (schema.ts files near index.ts).

### Description for the 1 task:

If the requested entity is missing - send 404 http code.  
If operation cannot be performed because of the client input - send 400 http code.  
You can use methods of "reply" to set http code or throw an [http error](https://github.com/fastify/fastify-sensible#fastifyhttperrors).  
If operation is successfully completed, then return an entity or array of entities from http handler (fastify will stringify object/array and will send it).

Relation fields are only stored in dependent/child entities. E.g. profile stores "userId" field.  
You are also responsible for verifying that the relations are real. E.g. "userId" belongs to the real user.  
So when you delete dependent entity, you automatically delete relations with its parents.  
But when you delete parent entity, you need to delete relations from child entities yourself to keep the data relevant.  
(In the next rss-school task, you will use a full-fledged database that also can automatically remove child entities when the parent is deleted, verify keys ownership and instead of arrays for storing keys, you will use additional "join" tables)

To determine that all your restful logic works correctly => run the script "npm run test".  
But be careful because these tests are integration (E.g. to test "delete" logic => it creates the entity via a "create" endpoint).

### Description for the 2 task:

You are free to create your own gql environment as long as you use predefined graphql endpoint (./src/routes/graphql/index.ts).  
(or stick to the [default code-first](https://github.dev/graphql/graphql-js/blob/ffa18e9de0ae630d7e5f264f72c94d497c70016b/src/__tests__/starWarsSchema.ts))

### Description for the 3 task:

If you have chosen a non-default gql environment, then the connection of some functionality may differ, be sure to report this in the PR.

### Description for the 4 task:

If you have chosen a non-default gql environment, then the connection of some functionality may differ, be sure to report this in the PR.  
Limit the complexity of the graphql queries by their depth with "graphql-depth-limit" package.  
E.g. User can refer to other users via properties `userSubscribedTo`, `subscribedToUser` and users within them can also have `userSubscribedTo`, `subscribedToUser` and so on.  
Your task is to add a new rule (created by "graphql-depth-limit") in [validation](https://graphql.org/graphql-js/validation/) to limit such nesting to (for example) 6 levels max.
