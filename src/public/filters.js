function name(params) {
    
}

function filterGraph(){
    let cat = document.getElementById('category-filter').value;
    let num = document.getElementById('node-quantity').value;
    let price = parseInt(document.getElementById('condo-price').value);
    let priceSpan = parseInt(document.getElementById('condo-span').value);
    let span = price/100 * priceSpan
    let minPrice = price - span
    let maxPrice = price + span

    let query = 'MATCH (n:'+cat+') RETURN n LIMIT '+num
    if (cat == 'Condo') query = 'MATCH (n:'+cat+') WHERE n.price >= '+minPrice+' and n.price <= '+maxPrice+' RETURN n LIMIT '+num
    
    console.log(query)
    drawGraph(null, null, query);
}

function updateGraph(node){

    if(node["raw"]["labels"].includes("Line")) {
        const line = node["raw"]["properties"]["name"]
        // Show all apartments on clicked line
        drawGraph(null, null, `MATCH p=(l:Line {name:"${line}"})-[:SERVES]-(s:Station)-[:NEAR]-(c:Condo) RETURN p`)
    } else {
        // MATCH p=(n:Condo)-->() WHERE ID(n) = 92 RETURN p LIMIT 500
        var num = document.getElementById('node-quantity').value;
        var query = 'MATCH p=(n:'+node['group']+')--() WHERE ID(n) = '+node['id']+' RETURN p LIMIT '+num
        console.log(query)
        // console.log(node)
        const [lat, long] = getPosition(node)
        drawGraph(lat, long, query);
    }
}

function getPosition(node) {
    var lat, long
    try{
        var coords = node['raw']['properties']['COORDINATES'].split(",")
        lat = coords[0]
        long = coords[1]
    }
    catch(err){
        try{
            var lat, long
            if(node.raw.properties.latitude.split(",").length == 2){
                lat = parseFloat(node.raw.properties.latitude.split(",")[1])
                long = parseFloat(node.raw.properties.longitude.split(",")[0])
            }else{
                lat = node.raw.properties.latitude
                long = node.raw.properties.longitude
            }
        }
        catch(err){
            lat = node.raw.properties.latitude
            long = node.raw.properties.longitude
        }

    }

    return [lat, long]
}
