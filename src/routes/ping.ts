import { 
  FastifyInstance, 
  FastifyPluginOptions, 
  FastifyPluginAsync 
} from 'fastify';
import fp from 'fastify-plugin';

const Route: FastifyPluginAsync = async (server: FastifyInstance, options: FastifyPluginOptions) => {

  server.get('/ping', async (request, reply) => {
    return 'pong\n'
  })

}

export default fp(Route);