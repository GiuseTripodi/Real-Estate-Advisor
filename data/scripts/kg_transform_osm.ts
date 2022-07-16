


const fs = require("fs");
const https = require('https');

function convertFile() {

	const fullcontent = fs.readFileSync("data/osm_features2.jsonl", "utf-8")

	const out = fullcontent.split(/\r?\n/)
	.filter(line => line)
	.map(line =>  {
		return JSON.parse(line);
	})
	.map(feature => {

		if(feature.lat && feature.lon) {

			feature["location"] = {
				type: "Point",
				coordinates: [Number(feature.lon), Number(feature.lat)]
			}

		} else if(feature.bounds && feature.bounds.length != 0) {
			feature["location"] = {
				type: "Polygon",
				coordinates: [feature.bounds.map(it => [Number(it[1]), Number(it[0])])]
			}
		}

		delete feature.lat
		delete feature.lon
		delete feature.bounds

		return feature
	})
	.map(entry => JSON.stringify(entry))
	.reduce((left, right) => left + "\n" + right);





	fs.writeFileSync("data/" + "osm_features.jsonl", out);
}



convertFile();
