// ts-node createIndexes.ts

require('dotenv').config()

import mongoClient from './db/mongo'

async function main() {
  const mongoConnection = await mongoClient.connect();

  try {

    const db = mongoConnection.db('kg');

    await db.collection("stations").createIndex({
      "location" : "2dsphere"
    }, {})

    await db.collection("osm").createIndex({
      "location" : "2dsphere"
    }, {})

    await db.collection("condos").createIndex({
      "location" : "2dsphere"
    }, {})

  } finally {
    // Ensures that the client will close when you finish/error
    await mongoConnection.close();
  }
}

main().catch((err) => {
    console.error(err)
  })
