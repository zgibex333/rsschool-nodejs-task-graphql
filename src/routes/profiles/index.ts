import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { createProfileBodySchema, changeProfileBodySchema } from "./schema";
import type { ProfileEntity } from "../../utils/DB/entities/DBProfiles";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<ProfileEntity[]> {
    const profiles = await fastify.db.profiles.findMany();
    if (!profiles) throw fastify.httpErrors.notFound();
    return profiles;
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const profile = await fastify.db.profiles.findOne({
        key: "id",
        equals: request.params.id,
      });
      if (!profile) throw fastify.httpErrors.notFound();
      return profile;
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        body: createProfileBodySchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const {
        avatar,
        birthday,
        city,
        country,
        memberTypeId,
        sex,
        street,
        userId,
      } = request.body;
      if (
        typeof avatar !== "string" ||
        !avatar ||
        typeof city !== "string" ||
        !city ||
        typeof country !== "string" ||
        !country ||
        typeof memberTypeId !== "string" ||
        !memberTypeId ||
        typeof sex !== "string" ||
        !sex ||
        typeof street !== "string" ||
        !street ||
        typeof userId !== "string" ||
        !userId ||
        typeof birthday !== "number"
      )
        throw fastify.httpErrors.badRequest();
      const existingMemberType = !!(await fastify.db.memberTypes.findOne({
        key: "id",
        equals: memberTypeId,
      }));
      const duplicate = !!(await fastify.db.profiles.findOne({
        key: "userId",
        equals: userId,
      }));
      if (!existingMemberType || duplicate)
        throw fastify.httpErrors.badRequest();
      const newProfile = await fastify.db.profiles.create(request.body);
      if (!newProfile) throw fastify.httpErrors.unprocessableEntity;
      return newProfile;
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      try {
        const profile = await fastify.db.profiles.delete(request.params.id);
        if (!profile) throw fastify.httpErrors.notFound();
        return profile;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeProfileBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<ProfileEntity> {
      const { avatar, birthday, city, country, memberTypeId, sex, street } =
        request.body;

      if (
        !(
          (typeof avatar === "string" && avatar) ||
          (typeof city === "string" && city) ||
          (typeof country === "string" && country) ||
          (typeof memberTypeId === "string" && memberTypeId) ||
          (typeof sex === "string" && sex) ||
          (typeof street === "string" && street) ||
          typeof birthday === "number"
        )
      )
        throw fastify.httpErrors.badRequest();
      try {
        const profile = await fastify.db.profiles.change(
          request.params.id,
          request.body
        );
        if (!profile) throw fastify.httpErrors.notFound();
        return profile;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );
};

export default plugin;
