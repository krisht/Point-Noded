
/**
* Graph config
*/
var width = 960;
var height = 500;
var linkDistance = 200;
var nodeRadius = 20;

var graphNodes = null;
var graphEdges = null;
var network = null;

function destroy() {
    if (network !== null) {
        network.destroy();
        network = null;
    }
}

/**
* Main function
*/
function main() {

    destroy();

    var graphNodes = [];
    var graphEdges = [];

    // Read nodes
    for(i=0;i<data_nodes.length;i++){
        graphNodes.push({
            id: data_nodes[i].id,
            instrumentList: [],
            label: data_nodes[i].name,
            name: data_nodes[i].name,
            value: round(0.00),
            title: '',
        });
    }

    // For each node, generate its list of instruments
    for(i = 0; i < data_node_positions.length; i++){
        (graphNodes.find(x=> x.id  === data_node_positions[i].nodeId)).instrumentList[data_node_positions[i].instrumentId]=data_node_positions[i].qty;
    }

    // Read edges
    for(i=0;i<data_edges.length;i++){
        graphEdges.push({
            from: data_edges[i].fromNodeId,
            to: data_edges[i].toNodeId,
            arrows: 'to',
            id: data_edges[i].id,
            instrumentList: [],
            value: round(0.00),
            title: '',
        });
    }

    // For each edge, generate its list of instruments
    for(i = 0; i < data_edge_positions.length; i++){
        (graphEdges.find(x=> x.id  === data_edge_positions[i].edgeId)).instrumentList[data_edge_positions[i].instrumentId]=data_edge_positions[i].qty;
    }

    // Read instruments
    var instruments = [];
    for(i = 0; i < data_instruments.length; i++){
        instruments[data_instruments[i].id] = {
            id: data_instruments[i].id,
            price: data_instruments[i].price
        }
    }

    // Get total value of each node
    for(i = 0; i < graphNodes.length; i++){
        for(k = 0; k < graphNodes[i].instrumentList.length; k++){
            graphNodes[i].value+=round((graphNodes[i].instrumentList[k] * instruments[k].price));
        }
    }

    // Get total value of each edge
    for(i = 0; i < graphEdges.length; i++){
        for(k = 0; k < graphEdges[i].instrumentList.length; k++){
            graphEdges[i].value+=round((graphEdges[i].instrumentList[k] * instruments[k].price));
        }
    }

    // For scaling nodes and edges:
    var min_node = Infinity;
    var min_edge = Infinity;
    var max_node = -Infinity;
    var max_edge = -Infinity;

    for(i = 0; i < graphNodes.length; i++) {
        if (graphNodes[i].value < min_node)
            min_node = graphNodes[i].value;
        else if (graphNodes[i].value > max_node)
            max_node = graphNodes[i].value;
    }
    for(i = 0; i < graphEdges.length; i++) {
        if (graphEdges[i].value < min_edge)
            min_edge = graphEdges[i].value;
        else if (graphEdges[i].value > max_edge)
            max_edge = graphEdges[i].value;
    }

    for( i =0; i < graphNodes.length; i++){
        graphNodes[i].title =  graphNodes[i].value;
    }

    for( i =0; i < graphEdges.length; i++){
        graphEdges[i].title =  graphEdges[i].value;
    }

    for( i = 0; i < graphEdges.length; i++){
        if(graphEdges[i].value == 0)
            graphEdges[i].hidden = true;
    }

    for(i = 0; i < graphNodes.length; i++){
        if(graphNodes[i].value == 0){
            graphNodes[i].hidden = true;
        }
    }

    // create a network
    var container = document.getElementById('mynetwork');
    var data = {
      nodes: graphNodes,
      edges: graphEdges
    };

    var options = {
        interaction: {
            navigationButtons: false,
            keyboard: true,
            hover: true,
            hoverConnectedEdges: true,
            tooltipDelay: 10
        },
        nodes: {
            scaling: {
                min: min_node,
                max: max_node,
                label: {
                    enabled: true,
                    min: 14,
                    max: 30,
                    maxVisible: 30,
                    drawThreshold: 5
                },
                customScalingFunction: function (min,max,total,value) {
                    var scale = 1 / (max - min);
                    return Math.max(0, (value - min)*scale);
                }
            },
            shape: 'circle'
        },
        edges: {
            arrowStrikethrough: false,
        }
    };

    var network = new vis.Network(container, data, options);
    network.fit();
    network.on("click", function (params) {
        params.event = "[original event]";
        id = params.nodes[0]
        n = (graphNodes.find(x=> x.id  === id));

        document.getElementById('eventSpan').innerHTML = '<h2>Node Detail:</h2>'+"<br" + "Node Id: "+id+"\n"+"Node Name: " + n.name
        +"\n";

        document.getElementById('eventSpan').innerHTML += "Instrument ID\t" + "Quantity"+"\t"+"Price"+"\t\t\t"+"Total"+"\n";
        total = 0
        for(i=0;i<n.instrumentList.length;i++){
          if(n.instrumentList[i]!=0){
            total += n.instrumentList[i]*instruments[i].price;
            document.getElementById('eventSpan').innerHTML += i+"\t\t" + n.instrumentList[i] +"\t\t"+instruments[i].price+"\t\t"+n.instrumentList[i]*instruments[i].price+"\n";
          }
        }

        document.getElementById('eventSpan').innerHTML += "<br>"+"<b>Total</b>:" + total;



    });

}



function round(value) {
    return Number(Math.round(value*100)/100);
}
