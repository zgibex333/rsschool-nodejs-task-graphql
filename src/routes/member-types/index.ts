import { FastifyPluginAsyncJsonSchemaToTs } from "@fastify/type-provider-json-schema-to-ts";
import { idParamSchema } from "../../utils/reusedSchemas";
import { changeMemberTypeBodySchema } from "./schema";
import type { MemberTypeEntity } from "../../utils/DB/entities/DBMemberTypes";

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get("/", async function (request, reply): Promise<
    MemberTypeEntity[]
  > {
    const memberTypes = await fastify.db.memberTypes.findMany();
    if (!memberTypes) throw fastify.httpErrors.notFound();
    return memberTypes;
  });

  fastify.get(
    "/:id",
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const memberType = await fastify.db.memberTypes.findOne({
        key: "id",
        equals: request.params.id,
      });
      if (!memberType) throw fastify.httpErrors.notFound();
      return memberType;
    }
  );

  fastify.patch(
    "/:id",
    {
      schema: {
        body: changeMemberTypeBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<MemberTypeEntity> {
      const { discount, monthPostsLimit } = request.body;
      if (
        !(typeof discount === "number" || typeof monthPostsLimit === "number")
      )
        throw fastify.httpErrors.badRequest();
      try {
        const memberType = await fastify.db.memberTypes.change(
          request.params.id,
          request.body
        );
        if (!memberType) throw fastify.httpErrors.notFound();
        return memberType;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );
};

export default plugin;
