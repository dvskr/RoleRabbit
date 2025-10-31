/**
 * Discussion Routes Module
 * 
 * Handles all discussion and comment-related routes
 */

const { 
  getDiscussionPosts,
  getDiscussionPostById,
  createDiscussionPost,
  updateDiscussionPost,
  deleteDiscussionPost,
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment
} = require('../utils/discussions');
const { authenticate } = require('../middleware/auth');

/**
 * Register all discussion routes with Fastify instance
 * @param {FastifyInstance} fastify - Fastify instance
 */
async function discussionRoutes(fastify, options) {
  // Get all discussion posts
  fastify.get('/api/discussions', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const community = request.query.community;
      const posts = await getDiscussionPosts(community);
      return { posts };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create new discussion post
  fastify.post('/api/discussions', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const userId = request.user.userId;
      const postData = request.body;
      
      const post = await createDiscussionPost(userId, postData);
      return { success: true, post };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get single discussion post by ID
  fastify.get('/api/discussions/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const post = await getDiscussionPostById(id);
      
      if (!post) {
        reply.status(404).send({ error: 'Post not found' });
        return;
      }
      
      return { post };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update discussion post
  fastify.put('/api/discussions/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      const existingPost = await getDiscussionPostById(id);
      if (!existingPost) {
        reply.status(404).send({ error: 'Post not found' });
        return;
      }
      
      const post = await updateDiscussionPost(id, updates);
      return { success: true, post };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Delete discussion post
  fastify.delete('/api/discussions/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      
      const existingPost = await getDiscussionPostById(id);
      if (!existingPost) {
        reply.status(404).send({ error: 'Post not found' });
        return;
      }
      
      await deleteDiscussionPost(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Get comments for a post
  fastify.get('/api/discussions/:postId/comments', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { postId } = request.params;
      const comments = await getCommentsByPostId(postId);
      return { comments };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Create comment on a post
  fastify.post('/api/discussions/:postId/comments', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { postId } = request.params;
      const userId = request.user.userId;
      const commentData = request.body;
      
      const comment = await createComment(postId, userId, commentData);
      return { success: true, comment };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Update comment
  fastify.put('/api/comments/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      const updates = request.body;
      
      const comment = await updateComment(id, updates);
      return { success: true, comment };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });

  // Delete comment
  fastify.delete('/api/comments/:id', {
    preHandler: authenticate
  }, async (request, reply) => {
    try {
      const { id } = request.params;
      await deleteComment(id);
      return { success: true };
    } catch (error) {
      reply.status(500).send({ error: error.message });
    }
  });
}

module.exports = discussionRoutes;

