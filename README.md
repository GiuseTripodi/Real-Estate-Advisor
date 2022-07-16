
# The Condos Graph of Vienna

[Open our Presentation](./Condos_of_Vienna_KG_Presentation.pdf)

## Dev Environment

see docker-compose.yml -> mongo-setup script if needed (ATTENTION: will override jsonl files.)

```sh
docker-compose up -d
```

- [JupyterLab](http://127.0.0.1:8888)
- [MongoDB Browser](http://127.0.0.1:8081)
- [Neo4j Browser](http://127.0.0.1:7474)

## VS Code Dev Container - Backend

- inside dev container:
  - `npm run dev`
- see: [python route](./src/routes/pythonRoute.ts)
- see: [db route](./src/routes/dbRoute.ts)
- [Browser Python Demo](http://127.0.0.1:8080/demo)

## Import Data

To import data from mongodb into neo4j you can run the `import_neo.sh` file.
Make sure you have environment variables set in a `.env`file (in the project root folder).

Example default `.env` file: 
```
MONGO_URI=mongodb://localhost:27017
NEO4J_URI=bolt://localhost:7687
```

use different databases:

create a file called: `.env`

add following content:

```
MONGO_URI=mongodb://localhost:27017
NEO4J_URI=bolt://localhost:7687
```

### create indexes

```
ts-node src/graph/createIndexes.ts
```