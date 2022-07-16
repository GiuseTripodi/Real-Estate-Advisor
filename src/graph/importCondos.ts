// ts-node mongo2neo4j.ts

require('dotenv').config()

import mongoClient, {
  getAttributesGroupedByCondoAttribute
} from './db/mongo'
import neo4jDriver, {
  addAttributesToNeo4j,
  matchAttributesToCondo,
  matchAttributeToCondo
} from './db/neo4j'


async function main() {

  const mongoConnection = await mongoClient.connect();

  try {

    const database = mongoConnection.db('kg');
    const condos = await database.collection('condos').find({}).toArray();

    const ESTATE_PREFERENCES = await database.collection('condos').aggregate([{
      '$unwind': {
        'path': '$attributes.ESTATE_PREFERENCE'
      }
    }, {
      '$group': {
        '_id': {
          'ESTATE_PREFERENCE': '$attributes.ESTATE_PREFERENCE'
        },
        'ESTATE_PREFERENCE': {
          '$first': '$attributes.ESTATE_PREFERENCE'
        }
      }
    }]).toArray();

    await addAttributesToNeo4j(await getAttributesGroupedByCondoAttribute(database, 'PROPERTY_TYPE'), 'PROPERTY_TYPE', 'PROPERTY_TYPE')
    await addAttributesToNeo4j(await getAttributesGroupedByCondoAttribute(database, 'BUILDING_TYPE'), 'BUILDING_TYPE', 'BUILDING_TYPE')
    await addAttributesToNeo4j(await getAttributesGroupedByCondoAttribute(database, 'ENERGY_HWB_CLASS'), 'ENERGY_HWB_CLASS', 'ENERGY_HWB_CLASS')
    await addAttributesToNeo4j(await getAttributesGroupedByCondoAttribute(database, 'ENERGY_FGEE_CLASS'), 'ENERGY_FGEE_CLASS', 'ENERGY_FGEE_CLASS')
    await addAttributesToNeo4j(ESTATE_PREFERENCES, 'ESTATE_FEATURE', 'ESTATE_PREFERENCE')


    //TODO study:
    // - https://neo4j.com/developer/javascript/
    // - https://neo4j.com/docs/cypher-manual/current/introduction/
    // - https://github.com/neo4j-examples/movies-javascript-bolt
    for (let i = 0; i < condos.length; i++) {
      const neo4jSession = neo4jDriver.session()

      try {

        await neo4jSession.run(`CREATE (c:Condo {
          uuid: ${`"${String(condos[i].uuid)}"`},
          mongo_id: ${`"${String(condos[i]._id)}"`},
          floor: ${parseFloat(condos[i].attributes.FLOOR) || null},
          gross_size: ${parseFloat(condos[i].attributes['ESTATE_SIZE/GROSS_AREA']) || null},
          usable_size: ${parseFloat(condos[i].attributes['ESTATE_SIZE/USEABLE_AREA']) || null},
          living_size: ${parseFloat(condos[i].attributes['ESTATE_SIZE/LIVING_AREA']) || null},
          additional_cost: ${parseFloat(condos[i].attributes['ADDITIONAL_COST/FEE']) || null},
          price_suggestions: ${parseFloat(condos[i].attributes['ESTATE_PRICE/PRICE_SUGGESTION']) || null},
          price: ${parseFloat(condos[i].attributes.PRICE) || null},
          NO_OF_ROOMS: ${parseInt(condos[i].attributes.NO_OF_ROOMS) || null},
          ENERGY_HWB: ${parseFloat(condos[i].attributes.ENERGY_HWB) || null},
          ENERGY_HWB_CLASS: ${`"${String(condos[i].attributes.ENERGY_HWB_CLASS)}"`},
          ENERGY_FGEE_CLASS: ${`"${String(condos[i].attributes.ENERGY_FGEE_CLASS)}"`},
          PROPERTY_TYPE: ${`"${String(condos[i].attributes.PROPERTY_TYPE)}"`},
          BUILDING_TYPE: ${`"${String(condos[i].attributes.BUILDING_TYPE)}"`},
          FLOOR_SURFACE: ${`"${String(condos[i].attributes.FLOOR_SURFACE)}"`},
          BUILDING_CONDITION: ${`"${String(condos[i].attributes.BUILDING_CONDITION)}"`},
          AVAILABLE_DATE_FREETEXT: ${`"${String(condos[i].attributes.AVAILABLE_DATE_FREETEXT)}"`},
          HEATING: ${`"${String(condos[i].attributes.HEATING)}"`},
          OWNAGETYPE: ${`"${String(condos[i].attributes.OWNAGETYPE)}"`},
          UNIT_TITLE: ${`"${String(condos[i].attributes.UNIT_TITLE)}"`},
          COORDINATES: ${`"${String(condos[i].attributes.COORDINATES)}"`}
        }) RETURN c`)


      } catch (err) {
        console.error(err)
      } finally {
        await neo4jSession.close()
      }

      let ESTATE_PREFERENCE = condos[i].attributes.ESTATE_PREFERENCE
      if (!Array.isArray(ESTATE_PREFERENCE)) ESTATE_PREFERENCE = [ESTATE_PREFERENCE]

      let promises = []

      promises.push(matchAttributesToCondo(ESTATE_PREFERENCE, String(condos[i]._id), 'HAS'))
      promises.push(matchAttributeToCondo(condos[i].attributes.PROPERTY_TYPE, String(condos[i]._id), 'IS', 'PROPERTY_TYPE'))
      promises.push(matchAttributeToCondo(condos[i].attributes.BUILDING_TYPE, String(condos[i]._id), 'IS', 'BUILDING_TYPE'))
      promises.push(matchAttributeToCondo(condos[i].attributes.ENERGY_HWB_CLASS, String(condos[i]._id), 'HAS', 'ENERGY_HWB_CLASS'))
      promises.push(matchAttributeToCondo(condos[i].attributes.ENERGY_FGEE_CLASS, String(condos[i]._id), 'HAS', 'ENERGY_FGEE_CLASS'))

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