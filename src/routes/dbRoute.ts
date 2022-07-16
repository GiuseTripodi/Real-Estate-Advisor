import { 
  FastifyInstance, 
  FastifyPluginOptions, 
  FastifyPluginAsync 
} from 'fastify';
import fp from 'fastify-plugin';
import { Db } from '../plugins/db';
import { MyAttrs } from '../models/MyCollectionItem';

// Declaration merging
declare module 'fastify' {
    export interface FastifyInstance {
        db: Db;
    }
}

interface myParams {
    id: string;
}

const Route: FastifyPluginAsync = async (server: FastifyInstance, options: FastifyPluginOptions) => {

    server.get('/MyCollectionItem', {}, async (request, reply) => {
        try {
            const { MyCollectionItem } = server.db.models;
            const thing = await MyCollectionItem.find({});
            return reply.code(200).send(thing);
        } catch (error) {
            request.log.error(error);
            return reply.send(500);
        }
    });

    server.post<{ Body: MyAttrs }>('/MyCollectionItem', {}, async (request, reply) => {
        try {
            const { MyCollectionItem } = server.db.models;
            const thing = await MyCollectionItem.addOne(request.body);
            await thing.save();
            return reply.code(201).send(thing);
        } catch (error) {
            request.log.error(error);
            return reply.send(500);
        }
    });
 
    server.get<{ Params: myParams }>('/MyCollectionItem/:id', {}, async (request, reply) => {
        try {
            const ID = request.params.id;
            const { MyCollectionItem } = server.db.models;
            const thing = await MyCollectionItem.findById(ID);
            if (!thing) {
                return reply.send(404);
            }
            return reply.code(200).send(thing);
        } catch (error) {
            request.log.error(error);
            return reply.send(400);
        }
    });
};
export default fp(Route);