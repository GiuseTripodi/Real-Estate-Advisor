


const fs = require("fs");
const https = require('https');

function convertFile() {
	const data = JSON.parse(fs.readFileSync("data/OEFFHALTESTOGD.json"));

	console.log("Features:" + data.features.length)

	const simple = data.features
		.map(feature => {
			return {
				id: feature.id,
				location: {
					type: "Point",
					coordinates: feature.geometry.coordinates
				},
				name: feature.properties["HTXT"],
				lines: feature.properties["HLINIEN"].split(",").map(it => it.trim()),
				ltype: feature.properties["LTYP"]
			}
		})
		.map(entry => JSON.stringify(entry))
		.reduce((left, right) => left + "\n" + right);

	fs.writeFileSync("data/" + "public_transport_stations.jsonl", simple);
}



convertFile();
