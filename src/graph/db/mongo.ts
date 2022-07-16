import {
  MongoClient,
  Db
} from "mongodb";

// Replace the uri string with your MongoDB deployment's connection string.
const mongoUri = process.env['MONGO_URI'] || 'mongodb://localhost:27017';
const mongoClient = new MongoClient(mongoUri);

export default mongoClient

export function getAttributesGroupedByCondoAttribute(database: Db, attr: string) {
  return database.collection('condos').aggregate([{
    '$group': {
      '_id': {
        [attr]: `$attributes.${attr}`
      },
      [attr]: {
        '$first': `$attributes.${attr}`
      }
    }
  }]).toArray();
}

export function groupCollectionByTag(database: Db, collection: string, tag: string) {
  return database.collection(collection).aggregate([{
    '$group': {
      '_id': {
        [tag]: `$tags.${tag}`
      },
      [tag]: {
        '$first': `$tags.${tag}`
      }
    }
  }]).toArray();
}