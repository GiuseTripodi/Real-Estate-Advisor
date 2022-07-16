function drawGraph(lat, long, query) {
    //TODO Add specific color for every node
    var config = {
        container_id: "viz",
        server_url: "bolt://localhost:7687",
        // server_user: "usr",
        // server_password: "psswrd",
        labels: {
            [NeoVis.NEOVIS_DEFAULT_CONFIG]: {
                caption: (node) => {
                    if (!Array.isArray(node.labels)) return node.label
                    if (node.labels.length >= 2) {
                        return node.labels[0] + ':' + node.labels[1]
                    } else if (node.labels.length == 1) return node.labels[0]
                }
            }
        },
        relationships: {
            "NEAR": {
                caption: true,
                thickness: "count"
            }
        },
        initial_cypher: query
    }

    var viz = new NeoVis.default(config);
    
    viz.registerOnEvent("completed", (e)=>{
        // console.log(lat)
        loadNodesMap(lat, long, viz)
        // loadFilter(viz)

        viz["_network"].on("click", (event)=>{
            if (event.nodes.length > 0) {
                updateGraph(viz["_nodes"][event.nodes[0]])
                displayProperties(viz["_nodes"][event.nodes[0]])
                currentCondo = viz["_nodes"][event.nodes[0]]
                //getSimilarCondos(viz["_nodes"][event.nodes[0]])
            } else if (event.edges.length > 0) {

            }

        });
    });

    viz.render();
    
}

//drawGraph("MATCH p=()-->() RETURN p LIMIT 250")