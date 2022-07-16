// Create Indices

db = new Mongo().getDB("kg");

db.getCollection("stations").createIndex({
    "location" : "2dsphere"
}, {

})
db.getCollection("osm").createIndex({
    "location" : "2dsphere"
}, {

})
db.getCollection("condos").createIndex({
    "location" : "2dsphere"
}, {

})
