

db = new Mongo().getDB("kg");
db.createCollection("stations", { capped: false });
db.createCollection("osm", { capped: false });
db.createCollection("condos", { capped: false });
