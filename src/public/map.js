// initialize the map on the "map" div with a given center and zoom
//TODO Maybe add different layers switch like sattelite, streets or grayscale
var map = L.map('map', {
    // center: [coordCondos[0][0], coordCondos[0][1]],
    center: [48.20910423727479, 16.370037008675986],
    zoom: 17,
    opacity: 0.5
});

var legend = L.control({ position: "bottomright" });

function createNodesOnMap(nodes, relationValue, value) {
    L.polyline([getCoordinates(value), getCoordinates(relationValue)], {
        color: '#7c28f0',
        // color: nodes['_network']['edgesHandler']['defaultOptions']['color']['color'],
        opacity: 0.3
    }).addTo(map);
    var popupContents = "<b>"+relationValue.group+'</b><br>';
    for(const [propName, propDetails] of Object.entries(relationValue.raw.properties)){
        popupContents += propName + ': ' + propDetails + '<br>'
    }
    L.circleMarker(getCoordinates(relationValue), {
        color: nodes['_network']['groups']['groups'][relationValue.group]['color']['border'],
        fillColor: nodes['_network']['groups']['groups'][relationValue.group]['color']['background'],
        fillOpacity: 1.0,
        radius: 5.0
    }).addTo(map).on('click', function(e) {
        updateGraph(relationValue);
        displayProperties(relationValue);
    }).bindPopup(popupContents).on('mouseover', function (e) {
        this.openPopup();
    }).on('mouseout', function (e) {
        this.closePopup();
    });
}

function loadNodesMap(x, y, nodes){
    console.log(nodes)

    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });

    legend.remove(map);

    let groups = [
        "amenity",
        "Station",
        "Condo",
        "leisure",
        "natural"
    ]
    for (const [key, value] of Object.entries(nodes["_nodes"])) {
        let nodeGroup = value.group
        if(groups.includes(nodeGroup)){
            for (const [key1, relation] of Object.entries(nodes["_edges"])) { 
                if(value.id == relation.to || value.id == relation.from){
                    for (const [key2, relationValue] of Object.entries(nodes["_nodes"])) {
                        if (groups.includes(relationValue.group)) {
                            if (relationValue.id == relation.from || relationValue.id == relation.to){
                                createNodesOnMap(nodes, relationValue, value)
                            }
                        }
                    }
                }
            }
            var popupContents = "<b>"+value.group+'</b><br>';
            for(const [propName, propDetails] of Object.entries(value.raw.properties)){
                popupContents += propName + ': ' + propDetails + '<br>'
            }
            L.circleMarker(getCoordinates(value), {
                color: nodes['_network']['groups']['groups'][nodeGroup]['color']['border'],
                fillColor: nodes['_network']['groups']['groups'][nodeGroup]['color']['background'],
                fillOpacity: 1.0,
                radius: 5.0
            }).addTo(map).on('click', function(e) {
                updateGraph(value);
                displayProperties(value);
            }).bindPopup(popupContents).on('mouseover', function (e) {
                this.openPopup();
            }).on('mouseout', function (e) {
                this.closePopup();
            });
        }
    }

    // Get the tile layer from OpenStreetMaps
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    
    // Specify the maximum zoom of the map
    maxZoom: 19,

    // Set the attribution for OpenStreetMaps
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // TODO Try to make the connections of the same color as they are on the graph

    if(x != null && y != null){
        map.setView([x, y], 16);
    }
    else{
        // Don't update the view when no position is given
        //map.setView([48.20910423727479, 16.370037008675986], 16);
    }

    // var legend = L.control({ position: "bottomleft" });

    legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "legend");
    div.innerHTML += "<h4>Legend</h4>";
    for (const [groupName, props] of Object.entries(nodes._network.groups.groups)) { 
        if(groups.includes(groupName)){
            div.innerHTML += '<i style="background: '+props.color.background+'; border: '+props.color.border+'"></i><span>'+groupName+'</span><br>';
        }
    }
    return div;
    };

    legend.addTo(map);

    // var condosLayer = L.layerGroup();

    // var baseMaps = {}

    // var overlay = {
    //     "Condos": condosLayer
    // };

    // var layerControl = L.control.layers({}, overlay, {collapsed:false}).addTo(map);
    
    updateAverageShownPrice(nodes["_nodes"])
}

function getCoordinates(node){
    //console.log(node)
    // console.log((parseFloat(nodeTo.raw.properties.latitude.split(",")[0]) + parseFloat(nodeTo.raw.properties.longitude.split(",")[0])) / 2)
    try{
        var lat, long
        if(node.raw.properties.latitude.split(",").length == 2){
            lat = parseFloat(node.raw.properties.latitude.split(",")[1])
            long = parseFloat(node.raw.properties.longitude.split(",")[0])
        }else{
            lat = node.raw.properties.latitude
            long = node.raw.properties.longitude
        }
        return [lat, long]
    }
    catch(err){
        try{
            return node['raw']['properties']['COORDINATES'].split(",")
        }
        catch(err){
            lat = node.raw.properties.latitude
            long = node.raw.properties.longitude
            return [lat, long]
        }
    }
}

// function addPlacesToMap(coordinates, name, nodes){
//     var condosMarkers = []
//     coordinates.forEach(function(coord) {
//         var circle = L.circleMarker(coord, {
//             color: nodes['_network']['groups']['groups'][name]['color']['border'],
//             fillColor: nodes['_network']['groups']['groups'][name]['color']['background'],
//             fillOpacity: 1.0,
//             radius: 5.0
//         }).addTo(map);
//         // TODO Maybe add info about the place on click
//         circle.bindPopup("Greetings, my lord!");
//         condosMarkers.push(circle)
//     });
//     return L.layerGroup(condosMarkers);
// }

// function addPlacesToMap(coordinates, color, fill){
//     coordinates.forEach(function(coord) {
//         var circle = L.circleMarker(coord, {
//             color: color,
//             fillColor: fill,
//             fillOpacity: 1.0,
//             radius: 5.0
//         }).addTo(map);
//     // TODO Maybe add info about the place on click
//     circle.bindPopup("Greetings, my lord!");
//     });
// }

// function getNodeColor(){

// }

// function getNodeFill(){

// }

/* function showSelectedNodeMap(x, y){
    map.setView([x, y], 16);
} */
