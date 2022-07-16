const https = require('https');
const jsdom = require("jsdom")
const { JSDOM } = jsdom;
const fs = require("fs");
const MD5 = require("crypto-js/md5")

const httpsAgent = new https.Agent({
	//keepAlive: true
});




const sleep = ms => new Promise(r => setTimeout(r, ms));


function downloadHTML(hostName: string, url: string): Promise<string> {
	const options = {
		hostname: hostName,
		path: url,
		method: "GET",
		agent: httpsAgent,
		headers: {
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36"
		}
	};

	const promise = new Promise<string>(((resolve, reject) => {
		const request = https.request(options, (res) => {
			let responseMessage = "";
			res.setEncoding("utf8");

			res.on("data", (buffer) => {
				responseMessage += buffer;
			});

			res.on("end", () => {
				resolve(responseMessage);
			})
		}).on("error", error => {
			console.error(error);
			reject(error);
		});

		//request.write();
		request.end();
	}));

	promise.catch((error) => {
		console.log("error on query", error)
	});

	return promise;
}

function extractLinks(html: string): string[] {
	const dom = new JSDOM(html)
	const document = dom.window.document

	const url_prefix = "/iad/immobilien/d/eigentumswohnung/wien"

	return [...document.querySelectorAll(`a[href^="${url_prefix}"]`)]
		.map(element => element.href)
}


const linksFile = fs.createWriteStream("./data/willhaben/links.txt", {flags: "a"});

async function downloadPage(page: number) {
	console.log("Downloading page " + page + "...")
	const links = await downloadHTML("www.willhaben.at", "/iad/immobilien/eigentumswohnung/wien?rows=5&page=" + page).then(extractLinks)

	for(let link of links) {
		await sleep(1000 + Math.random() * 1000)

		linksFile.write(link + "\n")
		console.log("Downloading " + link + "...")
		const immoHTML = await downloadHTML("www.willhaben.at", link)

		const hash = MD5(link)
		fs.writeFileSync("./data/willhaben/" + hash + ".html", immoHTML)
		console.log("Saved to to " + hash)
	}
}


async function crawl() {
	let i = 1;

	while(i < 1000) {
		await downloadPage(i)

		await sleep(5000 + Math.random() * 5000)

		i++
	}


	console.log("Fin!")

	linksFile.close()
}

crawl()



