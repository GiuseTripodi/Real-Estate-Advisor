import neo4j, {
  Config as neo4jConfig
} from 'neo4j-driver';

import {
  cleanupString
} from '../utils'

const neo4jUri = process.env['NEO4J_URI'] || 'bolt://localhost:7687';
const neo4jConfig: neo4jConfig = {
  maxConnectionLifetime: 60 * 1000, // 1 minute
  maxConnectionPoolSize: 1000,
}
const neo4jDriver = neo4j.driver(neo4jUri, undefined, neo4jConfig)

export default neo4jDriver


export async function addAttributesToNeo4j(types: Array < any >, label: string, key?: string) {
  const neo4jSession = neo4jDriver.session()
  try {
    for (let i = 0; i < types.length; i++) {
      let type = types[i][label]
      if (key) type = types[i][key]
      if (type == undefined || type == '' || type == null || type == 'null') continue
      type = cleanupString(String(type))
      console.log("INSERTING:", label, "-->", type);
      let createString = `CREATE (x:${label} {type: "${type}" }) RETURN x`
      await neo4jSession.run(createString)
    }
  } catch (err) {
    console.error(err)
  } finally {
    await neo4jSession.close()
  }
}

export async function addTagsToNeo4j(types: Array < any >, label: string, key?: string) {
  const neo4jSession = neo4jDriver.session()
  try {
    for (let i = 0; i < types.length; i++) {
      let type = types[i][label]
      if (key) type = types[i][key][label]
      if (type == undefined || type == '' || type == null || type == 'null') continue
      type = cleanupString(String(type))
      let longitude = null
      let latitude = null
      if (types[i]['location'].type == 'Point') {
        longitude = types[i]['location'].coordinates[0]
        latitude = types[i]['location'].coordinates[1]
      } else if (types[i]['location'].type == 'Polygon') {
        longitude = types[i]['location'].coordinates[0][0]
        latitude = types[i]['location'].coordinates[0][1]
      }
      console.log("INSERTING:", label, "-->", type);
      let createString = `CREATE (x:${type}:${cleanupString(String(label))} {mongo_id: "${String(types[i]._id)}", longitude: "${longitude}", latitude: "${latitude}"  }) RETURN x`
      await neo4jSession.run(createString)
    }
  } catch (err) {
    console.error(err)
  } finally {
    await neo4jSession.close()
  }
}

export async function matchAttributesToCondo(types: Array < any > , mongo_id: string, relation: string, key?: string | undefined) {

  const neo4jSession_2 = neo4jDriver.session()
  try {
    for (let i = 0; i < types.length; i++) {
      let type = undefined
      if (key) {
        type = cleanupString(String(types[i][key]))
      } else {
        type = cleanupString(String(types[i]))
      }
      if (type == undefined || type == '' || type == null || type == 'null') continue
      let matchString = `
          MATCH
            (x:ESTATE_FEATURE {type: "${type}"}),
            (c:Condo {mongo_id: "${mongo_id}"})
          MERGE (c)-[r:${relation}]->(x)
          RETURN c`
      await neo4jSession_2.run(matchString)
    }
  } catch (err) {
    console.error(err)
  } finally {
    await neo4jSession_2.close()
  }
}

export async function matchAttributeToCondo(type: string , mongo_id: string, relation: string, label: string) {

  const neo4jSession_2 = neo4jDriver.session()
  try {
    let matchString = `
        MATCH
          (x:${cleanupString(String(label))} {type: "${cleanupString(String(type))}"}),
          (c:Condo {mongo_id: "${mongo_id}"})
        MERGE (c)-[r:${relation}]->(x)
        RETURN c`
    await neo4jSession_2.run(matchString)
  } catch (err) {
    console.error(err)
  } finally {
    await neo4jSession_2.close()
  }
}


export async function matchFeatureToCondo(type: string , mongo_id: string, relation: string, label: string) {

  const neo4jSession_2 = neo4jDriver.session()
  try {
    let matchString = `
        MATCH
          (x:${cleanupString(String(label))} {type: "${cleanupString(String(type))}"}),
          (c:Condo {mongo_id: "${mongo_id}"})
        MERGE (c)-[r:${relation}]->(x)
        RETURN c`
    await neo4jSession_2.run(matchString)
  } catch (err) {
    console.error(err)
  } finally {
    await neo4jSession_2.close()
  }
}

export async function matchTagToCondo(tag_mongo_id: string , condo_mongo_id: string, relation: string, label: string) {

  const neo4jSession_2 = neo4jDriver.session()
  try {
    let matchString = `
        MATCH
          (x:${cleanupString(String(label))} {mongo_id: "${tag_mongo_id}"}),
          (c:Condo {mongo_id: "${condo_mongo_id}"})
        MERGE (c)-[r:${relation}]->(x)
        RETURN c`
    await neo4jSession_2.run(matchString)
  } catch (err) {
    console.error(err)
  } finally {
    await neo4jSession_2.close()
  }
}