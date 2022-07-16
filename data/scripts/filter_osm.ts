const fs = require("fs");
const path = require("path");
const Parser = require("../node_modules/node-xml-stream")



let refedIds = {}
const entries = []


function processXML() {
	console.log("start")

	const stream = fs.createReadStream("./data/map.xml");
	const parser = new Parser();


	function checkTag(tag: any) {
		if(tag.k == "leisure") {
			// https://wiki.openstreetmap.org/wiki/DE:Key:leisure?uselang=de
			if(tag.v == "park") {
				return true;
			}

			// Just include all
			return true;
		} else if(tag.k == "landuse") {
			if(tag.v == "recreation_ground") {
				// https://wiki.openstreetmap.org/wiki/DE:Tag:landuse=recreation%20ground?uselang=de
				return true;
			}
		} else if(tag.k == "natural") {
			if(tag.v == "wood") {
				// https://wiki.openstreetmap.org/wiki/DE:Key:natural?uselang=de
				return true;
			}

			return true;
		} else if(tag.k == "amenity") {
			return true;
		}

		return false;
	}





	let entryCount = 0;

	console.time("processing");





	let nodeOpen = false
	let wayOpen = false
	let currentAttrs = {}
	let currentTags = []
	let currentNds = []

	parser.on("opentag", (name, attrs) => {
		// https://wiki.openstreetmap.org/wiki/Elements
		if(name == "node" || name == "way") {
			if(name == "node") {
				nodeOpen = true
			} else if(name == "way") {
				wayOpen = true
			}

			currentAttrs = attrs
			currentTags = []
			currentNds = []
		} else if(name == "tag") {
			// somehow the string ends in /
			if(attrs.v[attrs.v.length - 1] == '/') {
				attrs["v"] = attrs.v.substring(0, attrs.v.length - 1)
			}

			currentTags.push(attrs)
		} else if(name == "nd" && attrs["ref"] != null) {
			// somehow the string ends in /
			const id = attrs.ref.substring(0, attrs.ref.length - 1)
			currentNds.push(id)
			refedIds[id] = []
		}
	})

	parser.on("closetag", (name) => {
		if(name == "node" || name == "way") {



			nodeOpen = false
			wayOpen = false

			if(currentTags.findIndex(tag => checkTag(tag)) == -1) {
				return;
			}

			const tagsObj = {}
			currentTags.forEach(tag => {
				tagsObj[tag.k] = tag.v
			})

			currentAttrs["tags"] = tagsObj


			if(currentNds[0] != currentNds[currentNds.length - 1]) {
				// Bounds is not a poly -> first = last
				return;
			}

			currentAttrs["bounds"] = currentNds



			delete currentAttrs["changeset"]
			delete currentAttrs["version"]
			delete currentAttrs["uid"]


			// console.log("node", currentAttrs)
			//outStream.write(JSON.stringify(currentAttrs) + "\n")
			entries.push(currentAttrs)
			entryCount++
		}
	})


	parser.on("finish", () => {
		console.log("Finish!");
		console.log("Refed ids: ", Object.keys(refedIds).length)
		console.log("Entries: ", entryCount)

		stream.close();



		fillRefIds()
	})

	stream.pipe(parser);
}

function fillRefIds() {

	const outStream = fs.createWriteStream("./data/osm_features.json", {flags: "w"});
	const stream = fs.createReadStream("./data/map.xml");
	const parser = new Parser();

	parser.on("opentag", (name, attrs) => {
		// https://wiki.openstreetmap.org/wiki/Elements
		if(name == "node") {
			if(refedIds[attrs.id] != null) {
				refedIds[attrs.id] = [attrs.lat, attrs.lon]
			}
		}
	})

	parser.on("finish", () => {
		entries.forEach(entry => {
			entry.bounds = entry.bounds.map(id => refedIds[id])
		});



		entries.forEach(entry => {
			outStream.write(JSON.stringify(entry) + "\n")
		})

		outStream.close()

		console.log("Finished!")
	});

	stream.pipe(parser);
}

processXML();







