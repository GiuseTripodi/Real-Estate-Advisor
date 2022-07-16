// ts-node mongo2neo4j.ts

import {MongoClient} from "mongodb";
import neo4j, {Config as neo4jConfig} from 'neo4j-driver';

require('dotenv').config()

import mongoClient from './db/mongo'
import neo4jDriver from './db/neo4j'

async function main() {
	const mongoConnection = await mongoClient.connect();

	try {

		const database = mongoConnection.db('kg');
		const condos: any[] = await database.collection('condos').find().toArray();

		for(let condo of condos) {
			const stations: any[] = await database.collection("stations").find({
				"location": {
					$nearSphere: {
						$geometry: condo.location,
						$maxDistance: 500
					}
				}
			}).toArray()


			const neo4jSession = neo4jDriver.session()

			try {
				for (let station of stations) {

					console.log(condo.uuid, "-->", station.name);

					await neo4jSession.run(
						`MATCH
									(s:Station {name:$station_name}),
									(c:Condo {mongo_id:$mongo_id})
                               MERGE (s)-[r:NEAR]->(c)
                               RETURN type(r)`,
						{
							mongo_id: String(condo._id),
							station_name: station.name,
						}
					)
				}

			} catch (err) {
				console.error(err)
			} finally {
				await neo4jSession.close()
			}
		}

	} finally {
		// Ensures that the client will close when you finish/error
		await mongoConnection.close();
	}
}

main().catch((err) => {
	console.error(err)
}).finally(() => {
	neo4jDriver.close()
});
