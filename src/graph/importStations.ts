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
    const stations: any[] = await database.collection('stations').aggregate([
      {
        '$unwind': {
          'path': '$lines'
        }
      }, {
        '$group': {
          '_id': {
            'path': '$name'
          },
          'name': {
            '$first': '$name'
          },
          'location': {
            '$first': '$location'
          },
          'lines': {
            '$addToSet': '$lines'
          }
        }
      }
    ]).toArray();

    // Compute all existing line ids

    const lines = new Set();

    stations.map(station => {
      station["lines"].forEach(line => {
        lines.add(line);
      })
    });



    let neo4jSession = neo4jDriver.session()


    try {
      for (let line of lines) {


        await neo4jSession.run(
            `CREATE (l:Line {
            name: $name
          }) RETURN l`,
            {
              name: line
            }
        )
      }

    } catch (err) {
      console.error(err)
    } finally {
      await neo4jSession.close()
    }



    console.log("Created lines");



    neo4jSession = neo4jDriver.session()

    try {
      for (let station of stations) {

        await neo4jSession.run(
            `CREATE (s:Station {
              name: $name,
              latitude: $lat,
              longitude: $lon
            }) RETURN s`,
            {
              name: station.name,
              lat: station.location.coordinates[1],
              lon: station.location.coordinates[0]
            }
        )

      }
    } catch (err) {
      console.error(err)
    } finally {
      await neo4jSession.close()
    }





    console.log("Created stations");






    for (let station of stations) {

      neo4jSession = neo4jDriver.session()


      try {
        for (let line of station.lines) {

          console.log(station.name, "->", line)

          await neo4jSession.run(
            `MATCH (l:Line),(s:Station)
                  WHERE l.name = $line_name AND s.name=$station_name
                  CREATE (s)-[r:SERVES]->(l)
                  RETURN type(r)`,
              {
                line_name: line,
                station_name: station.name,
              }
          )

        }

      } catch (err) {
        console.error(err)
      } finally {
        await neo4jSession.close( )
      }


    }




    console.log("Created relationship")



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
