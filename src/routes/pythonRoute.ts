
   
import {
	PythonShell
} from 'python-shell'
import path from 'path'
import { 
  FastifyInstance, 
  FastifyPluginOptions, 
  FastifyPluginAsync 
} from 'fastify';
import fp from 'fastify-plugin';

const demo = (js: any): Promise <any> => {
	return new Promise((resolve, reject) => {
		const pyshell = new PythonShell(path.join(__dirname, '../scripts/demo.py'), {
			mode: 'text'
		})

		let returnMessage: unknown

		// sends a message to the Python script via stdin
		pyshell.send(JSON.stringify(js))

		pyshell.on('message', function (message) {
			// received a message sent from the Python script (a simple "print" statement)
			returnMessage = JSON.parse(message)
		})

		pyshell.on('stderr', function (stderr) {
			// handle stderr (a line of text from stderr)
			console.log(stderr)
		})

		// end the input stream and allow the process to exit
		pyshell.end(function (err, code, signal) {
			if (err) reject(err)
			resolve(returnMessage)
		})

	})
}


const Route: FastifyPluginAsync = async (server: FastifyInstance, options: FastifyPluginOptions) => {

  const object = {
    Demo: 'this_will_be_modified'
  }

  server.get('/demo', async (request, reply) => {
    return demo(object)
  })

}

export default fp(Route);