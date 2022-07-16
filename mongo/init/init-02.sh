echo "########## Importing Data ################"

mongoimport --db kg --collection stations --file /tmp/data/public_transport_stations.jsonl
mongoimport --db kg --collection osm --file /tmp/data/osm_features.jsonl
mongoimport --db kg --collection condos --file /tmp/data/condos.jsonl
