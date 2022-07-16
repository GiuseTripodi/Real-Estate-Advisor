
const jsdom = require("jsdom")
const { JSDOM } = jsdom;
const fs = require("fs");


const linksFile = fs.createWriteStream("./data/willhaben/condos.jsonl", {flags: "a"});

let sumPrice = 0
let sums = 0

function extractData(file: string) {
	const html = fs.readFileSync(file)

	const fragment = JSDOM.fragment(html)

	// const document = dom.window.document

	let element = fragment.getElementById("__NEXT_DATA__")
	const rawObj = JSON.parse(element.textContent)["props"]["pageProps"]["advertDetails"];

	const attributes = {}

	rawObj["attributes"]["attribute"].forEach(it => {
		const key = it.name;
		const value = it.values;

		if(Array.isArray(value) && value.length == 1) {
			attributes[key] = value[0];
		} else {
			attributes[key] = value;
		}

		/*
		if(!isNaN(attributes[key])) {
			attributes[key] = Number(attributes[key])
		}
		 */
	})

	if(!attributes["COORDINATES"]) {
		return
	}

	const rawPosition = attributes["COORDINATES"];

	const position = [Number(rawPosition.split(",")[1]),Number(rawPosition.split(",")[0])]

	const obj = {
		uuid: rawObj["uuid"],
		description: rawObj["description"],
		published: rawObj["publishedDate"],
		attributes,
		location: {
			type: "Point",
			coordinates: position
		},
		locationAccuracy: Number(attributes["POSITION_RADIUS_METERS"]),
		rawObj
	}

	linksFile.write( JSON.stringify(obj) + "\n")
}



const folder = "./data/willhaben/condos"
const files = fs.readdirSync(folder)

for(let i = 0; i < 1250; i++) {
	const file = files[i]
	extractData(folder + "/" + file)

	console.log(i + "/" + files.length)
}

linksFile.close()
console.log("Fin")

