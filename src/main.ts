require('dotenv').config()

const Port = parseInt(process.env.PORT!) || 8000;
const Host = process.env.HOST! || '0.0.0.0';
const uri = process.env.MONGO_URI || 'mongodb://mongo:27017/kg';

import path from 'path';
import fastify from 'fastify';
import pino from 'pino';
import db from './plugins/db';
const routes = [
  import('./routes/dbRoute'),
  import('./routes/ping'),
  import('./routes/pythonRoute')
]

const server = fastify({
  logger: pino({ level: 'info' })
});
server.register(db, { uri });
routes.forEach(route => {
  server.register(route);
})

server.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public')
  //prefix: '/public/', // optional: default '/'
})

const start = async () => {
    try {

        await server.listen({
          port: Port,
          host: Host,
        });
        console.log('Server started successfully');

    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
