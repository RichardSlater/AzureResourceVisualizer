function init() {
    graph = new joint.dia.Graph;
    paper = new joint.dia.Paper({ el: $('#paper'), gridSize: 1, model: graph, height: '100%', width: '100%' });
    
    joint.shapes.custom = {};
    joint.shapes.custom.ElementLink = joint.shapes.basic.Rect.extend({
        markup: '<a><g class="rotatable"><g class="scalable"><rect/></g><text/></g></a>',
        defaults: joint.util.deepSupplement({
            type: 'custom.ElementLink'
        }, joint.shapes.basic.Rect.prototype.defaults)
    });
    
    joint.shapes.custom.ElementLabelLink = joint.shapes.basic.Rect.extend({
        markup: '<g class="rotatable"><g class="scalable"><rect/></g><a><text/></a></g>',
        defaults: joint.util.deepSupplement({
            type: 'custom.ElementLabelLink'
        }, joint.shapes.basic.Rect.prototype.defaults)
    });
}

var template = new Template(arm);

var cells = [];
var links = [];
var graph;
var paper;

function createNodes() {
//Create the nodes
    template.getAllResources().forEach(function(resource) {
        console.log('Loading resource ' + resource.type);

        var shape = new joint.shapes.custom.ElementLink({
            position: { x: 80, y: 80 },
            size: { width: 170, height: 100 },
            attrs: {
                rect: { fill: '#E67E22', stroke: '#D35400', 'stroke-width': 5 },
                text: { text: resource.type, fill: 'white' }
            }
        });

        shape.attributes.attrs.text.text = resource.type.replace('/', '\n');

        template.associateNodeWithResource(shape, resource);

        cells.push(shape);
    });
}

function createLinks() {
    template.getAllResources().forEach(function(resource) {
        //Find the destination node
        var deps = template.resolveResourceDependencies(resource.dependsOn);

        deps.forEach(function(dep) {
            var sourceNode = template.getNodeForResource(resource);
            var destNode = template.getNodeForResource(dep);

            var l = new joint.dia.Link({
                source: { id: sourceNode.id },
                target: { id: destNode.id },
                attrs: {
                    '.connection': { 'stroke-width': 5, stroke: '#34495E' },
                    '.marker-target': { fill: 'yellow', d: 'M 10 0 L 0 5 L 10 10 z' }
                }
            });

            links.push(l);
        });
    });
}

function displayResource(resource) {
    $('#nodeProperties').val(JSON.stringify(resource, null, 2));
}

function initializeClickPopup() {
     paper.on('cell:pointerdown', function (evt, x, y) {
         var node = graph.getCell(evt.model.id);
         var resource = template.getResourceForNode(node);

         displayResource(resource);
     });   
}

function layoutNodes() {
    //https://github.com/cpettitt/dagre/wiki#configuring-the-layout

    var g = new dagre.graphlib.Graph();

    // Set an object for the graph label
    g.setGraph({});

    // Default to assigning a new object as a label for each new edge.
    g.setDefaultEdgeLabel(function () { return {}; });


    cells.forEach(function(cell) {
        g.setNode(cell.id, { width: cell.attributes.size.width, height: cell.attributes.size.height });
    });

    links.forEach(function(link) {
        g.setEdge(link.attributes.source.id, link.attributes.target.id);
    });

    dagre.layout(g);

    g.nodes().forEach(function (node) {
        var cell = _.findWhere(cells, { id: node });

        //var cell = graph.getCell(node);
        cell.attributes.position.x = g.node(node).x;
        cell.attributes.position.y = g.node(node).y;
    });

    graph.addCells(cells);
    graph.addCells(links);
}

$(function() {

});