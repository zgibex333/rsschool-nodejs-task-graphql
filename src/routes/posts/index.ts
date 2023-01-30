import { FastifyPluginAsyncJsonSchemaToTs } from '@fastify/type-provider-json-schema-to-ts';
import { idParamSchema } from '../../utils/reusedSchemas';
import { createPostBodySchema, changePostBodySchema } from './schema';
import type { PostEntity } from '../../utils/DB/entities/DBPosts';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async (
  fastify
): Promise<void> => {
  fastify.get('/', async function (request, reply): Promise<PostEntity[]> {
    const posts = await fastify.db.posts.findMany();
    if (!posts) throw fastify.httpErrors.notFound();
    return posts;
  });

  fastify.get(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const post = await fastify.db.posts.findOne({
        key: 'id',
        equals: request.params.id,
      });
      if (!post) throw fastify.httpErrors.notFound();
      return post;
    }
  );

  fastify.post(
    '/',
    {
      schema: {
        body: createPostBodySchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { content, title, userId } = request.body;
      if (
        typeof content !== 'string' ||
        typeof title !== 'string' ||
        typeof userId !== 'string' ||
        !content ||
        !title ||
        !userId
      )
        throw fastify.httpErrors.badRequest();

      const newPost = await fastify.db.posts.create(request.body);
      if (!newPost) throw fastify.httpErrors.HttpError;
      return newPost;
    }
  );

  fastify.delete(
    '/:id',
    {
      schema: {
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      try {
        const post = await fastify.db.posts.delete(request.params.id);
        if (!post) throw fastify.httpErrors.notFound();
        return post;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );

  fastify.patch(
    '/:id',
    {
      schema: {
        body: changePostBodySchema,
        params: idParamSchema,
      },
    },
    async function (request, reply): Promise<PostEntity> {
      const { content, title } = request.body;
      if (
        !(
          (typeof content === 'string' && content) ||
          (typeof title === 'string' && title)
        )
      )
        throw fastify.httpErrors.badRequest();
      try {
        const post = await fastify.db.posts.change(
          request.params.id,
          request.body
        );
        if (!post) throw fastify.httpErrors.notFound();
        return post;
      } catch {
        throw fastify.httpErrors.badRequest();
      }
    }
  );
};

export default plugin;
