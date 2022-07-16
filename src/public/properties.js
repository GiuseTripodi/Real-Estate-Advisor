formatEuroAT = Intl.NumberFormat('de-DE');

function updateAverageShownPrice(data) {

  const nodes = Object.entries(data).map(node => node[1]["raw"])

  const condos = nodes.filter(node => node.labels.includes("Condo") && node.properties?.price && (node.properties?.living_size?.low || node.properties?.usable_size?.low));

  const prices = condos.map(condo => {

      const price = condo.properties?.price
      const size = condo.properties?.living_size?.low || condo.properties?.usable_size?.low

      return price / size
  })
  if (prices.length > 0) {
      const total = prices.reduce((a,b) => a + b)

      const avg = total / prices.length

      document.getElementById("avgPriceSpan").textContent = formatEuroAT.format(Math.ceil(avg)) + " €/㎡"
  } else {
      document.getElementById("avgPriceSpan").textContent = ""
  }
}

function displayProperties(node) {

  let propertiesContainer = document.getElementById('propertiesContainer')
  propertiesContainer.replaceChildren(getPropertiesElement(node))

}

function getPropertiesElement(node) {
  let el = document.createElement('div')
  el.setAttribute('class', 'col')

  let table = document.createElement('table')

  // add table head
  let tr = document.createElement('tr')
  let th = document.createElement('th')
  th.innerText = node?.label
  tr.append(th)
  table.append(tr)

  let properties = node?.raw?.properties

  if (node?.label == 'Condo') {

    const price = properties.price
    const size = properties.living_size?.low || properties.usable_size?.low

    avgPrice = price / size

    let tr = document.createElement('tr')
    let td = document.createElement('td')
    tr.innerText = 'price per square meter'
    td.innerText = formatEuroAT.format(Math.ceil(avgPrice)) + " €/㎡"
    tr.append(td)
    table.append(tr)
  }

  // add table rows
  for (const [propName, propDetails] of Object.entries(properties)) {
    let tr = document.createElement('tr')
    let td = document.createElement('td')
    tr.innerText = propName
    td.innerText = propDetails
    tr.append(td)
    table.append(tr)
  }

  el.append(table)
  return el
}

function getSimilarCondos() {
  let cluster = currentCondo?.raw?.properties?.cluster

  let query = `MATCH (c:Condo {cluster:"${cluster}"}) return c`

  if (cluster) drawGraph(null, null, query)
  else alert('no similar condos found..')
}