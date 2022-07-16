// ts-node mongo2neo4j.ts

require('dotenv').config()

import mongoClient from './db/mongo'
import neo4jDriver, {
  addTagsToNeo4j, matchTagToCondo
} from './db/neo4j'

async function main() {
  const mongoConnection = await mongoClient.connect();

  try {

    const database = mongoConnection.db('kg');
    const condos = await database.collection('condos').find({}).toArray();

    const leisures = await database.collection('osm').find({"tags.leisure": { $exists: true } }).toArray();
    await addTagsToNeo4j(leisures, 'leisure', 'tags')

    const amenities = await database.collection('osm').find({"tags.amenity": { $exists: true } }).toArray();
    await addTagsToNeo4j(amenities, 'amenity', 'tags')

    const landuse = await database.collection('osm').find({"tags.landuse": { $exists: true } }).toArray();
    await addTagsToNeo4j(landuse, 'landuse', 'tags')

    const natural = await database.collection('osm').find({$and: [
      {"tags.natural": { $exists: true }},
      {"tags.natural": { $nin: ['tree'] }}
    ]}).toArray();
    await addTagsToNeo4j(natural, 'natural', 'tags')


    for(let condo of condos) {
			const osms: any[] = await database.collection("osm").find({
				"location": {
					$nearSphere: {
						$geometry: condo.location,
						$maxDistance: 500
					}
				}
			}).toArray()

      let promises = []
      for (let osm of osms) {
        console.log(condo.uuid, "-->", osm.id);

        if (osm.tags.amenity) {
          promises.push(matchTagToCondo(String(osm._id), String(condo._id), 'NEAR', osm.tags.amenity))
        }
        if (osm.tags.leisure) {
          promises.push(matchTagToCondo(String(osm._id), String(condo._id), 'NEAR', osm.tags.leisure))
        }
        if (osm.tags.landuse) {
          promises.push(matchTagToCondo(String(osm._id), String(condo._id), 'NEAR', osm.tags.landuse))
        }
        if (osm.tags.natural) {
          promises.push(matchTagToCondo(String(osm._id), String(condo._id), 'NEAR', osm.tags.natural))
        }
      }
      await Promise.all(promises)
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