// ts-node mongo2neo4j.ts

import {MongoClient} from "mongodb";
import neo4j, {Config as neo4jConfig} from 'neo4j-driver';
import { readFileSync } from 'node:fs';

require('dotenv').config()

import mongoClient from './db/mongo'
import neo4jDriver from './db/neo4j'

async function main() {


	const clusters = JSON.parse(readFileSync("./notebooks/clusters.json").toString())

	console.log(clusters);

	const neo4jSession = neo4jDriver.session()

	try {
		for(const [cluster, condos] of Object.entries(clusters)) {

			for(const condo of (condos as Array<string>)) {
				await neo4jSession.run(
					`MATCH (c:Condo {uuid:$uuid}) SET c.cluster = $cluster`,
					{
						uuid: String(condo),
						cluster: String(cluster)
					}
				)
			}
		}

	} catch (err) {
		console.error(err)
	} finally {
		await neo4jSession.close()
	}




}

main().catch((err) => {
	console.error(err)
}).finally(() => {
	neo4jDriver.close()
});
