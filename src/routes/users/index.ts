import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import {
  createUserBodySchema,
  changeUserBodySchema,
  subscribeBodySchema,
} from "./schemas";
import type { UserEntity } from "../../utils/DB/entities/DBUsers";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<UserEntity[]> {
    const users = await fastify.db.users.findMany();
    if (!users) throw fastify.httpErrors.notFound();
    return users;
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const user = await fastify.db.users.findOne({
        key: "id",
        equals: request.params.id,
      });
      if (!user) throw fastify.httpErrors.notFound();
      return user;
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createUserBodySchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { email, firstName, lastName } = request.body;
      if (
        typeof email !== "string" ||
        !email ||
        typeof firstName !== "string" ||
        !firstName ||
        typeof lastName !== "string" ||
        !lastName
      )
        throw fastify.httpErrors.badRequest();
      const newUser = await fastify.db.users.create(request.body);
      if (!newUser) throw fastify.httpErrors.notFound();
      return newUser;
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      try {
        const reqUser = await fastify.db.users.delete(request.params.id);
        if (!reqUser) throw fastify.httpErrors.notFound();
        const allUsers = await fastify.db.users.findMany();
        for await (const user of allUsers) {
          const userUpdatedSubscriptions = user.subscribedToUserIds.filter(
            (id) => id !== reqUser.id
          );
          await fastify.db.users.change(user.id, {
            subscribedToUserIds: userUpdatedSubscriptions,
          });
        }
        const profile = await fastify.db.profiles.findOne({
          key: "userId",
          equals: reqUser.id,
        });
        if (profile) await fastify.db.profiles.delete(profile.id);
        const posts = await fastify.db.posts.findMany({
          key: "userId",
          equals: reqUser.id,
        });
        for await (const post of posts) {
          await fastify.db.posts.delete(post.id);
        }
        return reqUser;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.post(
    "/:id/subscribeTo",
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { params, body } = request;
      const user = await fastify.db.users.findOne({
        key: "id",
        equals: body.userId,
      });
      if (!user) throw fastify.httpErrors.notFound();
      const subscription = await fastify.db.users.findOne({
        key: "id",
        equals: params.id,
      });
      if (!subscription) throw fastify.httpErrors.badRequest();
      if (user.subscribedToUserIds.includes(subscription.id))
        throw fastify.httpErrors.badRequest();
      try {
        await fastify.db.users.change(user.id, {
          subscribedToUserIds: [...user.subscribedToUserIds, subscription.id],
        });
        return user;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.post(
    "/:id/unsubscribeFrom",
    {
      schema: {
        body: subscribeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { params, body } = request;

      const user = await fastify.db.users.findOne({
        key: "id",
        equals: body.userId,
      });
      if (!user) throw fastify.httpErrors.notFound();
      const subscription = await fastify.db.users.findOne({
        key: "id",
        equals: params.id,
      });
      if (!subscription) throw fastify.httpErrors.badRequest();
      if (!user.subscribedToUserIds.includes(subscription.id))
        throw fastify.httpErrors.badRequest();
      const newSubscriptions = user.subscribedToUserIds.filter(
        (id) => id !== params.id
      );
      try {
        await fastify.db.users.change(user.id, {
          subscribedToUserIds: newSubscriptions,
        });
        return user;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeUserBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<UserEntity> {
      const { params, body } = request;
      const { email, firstName, lastName } = body;
      try {
        if (
          !(
            (typeof email === "string" && email) ||
            (typeof firstName === "string" && firstName) ||
            (typeof lastName === "string" && lastName)
          )
        )
          throw fastify.httpErrors.badRequest();

        const user = await fastify.db.users.change(params.id, body);
        if (!user) throw fastify.httpErrors.notFound();
        return user;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );
};

export default plugin;
