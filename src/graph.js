var width = document.documentElement.clientWidth - 50,
  height = document.documentElement.clientHeight - 50;

var fill = d3.scale.category20();

// mouse event vars
var dragged = null,
  selected_node = null,
  selected_link = null,
  mousedown_link = null,
  mousedown_node = null,
  mouseup_node = null;

// init force layout
var force = d3.layout
  .force()
  .size([width, height])
  .nodes([{}]) // initialize with a single node
  .linkDistance(25)
  .charge(-1200)
  .on('tick', tick);

// init svg
var svg = d3
  .select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .on('mousemove', mousemove)
  .on('mousedown', mousedown)
  .on('mouseup', mouseup);

// line displayed when dragging new nodes
var drag_line = svg
  .append('line')
  .attr('class', 'drag_line')
  .attr('x1', 0)
  .attr('y1', 0)
  .attr('x2', 0)
  .attr('y2', 0);

// get layout properties
var nodes = force.nodes(),
  links = force.links(),
  node = svg.selectAll('.node'),
  link = svg.selectAll('.link');

// add keyboard callback
d3.select(window).on('keydown', keydown);

redraw();

// focus on svg?
svg.node().focus();

function mousedown() {
  // Exit if the game is playing
  if (gamePlay) return;
  if (!mousedown_node && !mousedown_link) {
    selected_node = null;
    selected_link = null;
    redraw();
    return;
  }

  if (mousedown_node) {
    // reposition drag line
    drag_line
      .attr('class', 'link')
      .attr('x1', mousedown_node.x)
      .attr('y1', mousedown_node.y)
      .attr('x2', mousedown_node.x)
      .attr('y2', mousedown_node.y);
  }

  redraw();
}

function mousemove() {
  // Exit if the game is playing
  if (gamePlay) return;
  if (!mousedown_node) return;

  dragged = true;
  // update drag line
  drag_line
    .attr('x1', mousedown_node.x)
    .attr('y1', mousedown_node.y)
    .attr('x2', d3.mouse(this)[0])
    .attr('y2', d3.mouse(this)[1]);
}

function mouseup() {
  // Exit if the game is playing
  if (gamePlay) return;
  // hide drag line
  drag_line.attr('class', 'drag_line_hidden');

  if (mouseup_node == mousedown_node) {
    resetMouseVars();
    return;
  }

  if (mouseup_node) {
    // add link
    var link = {
      source: mousedown_node,
      target: mouseup_node
    };
    links.push(link);

    // select new link
    selected_link = link;
    selected_node = null;
  } else {
    // add node
    var point = d3.mouse(this),
      node = {
        x: point[0],
        y: point[1]
      },
      n = nodes.push(node);

    // select new node
    selected_node = node;
    selected_link = null;

    // add link to mousedown node
    links.push({
      source: mousedown_node,
      target: node
    });
  }

  // clear mouse event vars
  resetMouseVars();

  redraw();
}

function resetMouseVars() {
  dragged = null;
  mousedown_node = null;
  mouseup_node = null;
  mousedown_link = null;
}

function tick() {
  link
    .attr('x1', function(d) {
      return d.source.x;
    })
    .attr('y1', function(d) {
      return d.source.y;
    })
    .attr('x2', function(d) {
      return d.target.x;
    })
    .attr('y2', function(d) {
      return d.target.y;
    });

  node
    .attr('cx', function(d) {
      return d.x;
    })
    .attr('cy', function(d) {
      return d.y;
    });
}

// redraw force layout
function redraw() {
  // console.log(nodes);
  link = link.data(links);

  link
    .enter()
    .insert('line', '.node')
    .attr('class', 'link')
    .on('mousedown', function(d) {
      mousedown_link = d;
      selected_link = d;
      selected_node = null;
      redraw();
    });

  link.exit().remove();

  link.classed('link_selected', function(d) {
    return d === selected_link;
  });

  node = node.data(nodes);

  node
    .enter()
    .insert('circle')
    .attr('class', 'node')
    .attr('r', 5)
    .on('mousedown', function(d) {
      mousedown_node = d;
      selected_node = d;
      selected_link = null;
      redraw();
    })
    .on('mouseup', function(d) {
      selected_node = d;
      mouseup_node = d;
      redraw();
    })
    .transition()
    .duration(500)
    .ease('cubic')
    .attr('r', 10);

  node
    .exit()
    .transition()
    .attr('r', 0)
    .remove();

  node.classed('node_selected', function(d) {
    return d === selected_node;
  });

  if (d3.event) {
    // prevent browser's default behavior
    d3.event.preventDefault();
  }
  force.start();
}

function spliceLinksForNode(node) {
  toSplice = links.filter(function(l) {
    return l.source === node || l.target === node;
  });
  toSplice.map(function(l) {
    links.splice(links.indexOf(l), 1);
  });
}

function keydown() {
  // Exit if the game is playing and computer plays as protector
  if (gameMode && gameMode == 1) return;
  if (!selected_node && !selected_link) return;

  switch (d3.event.keyCode) {
    case 8: // backspace
    case 46: {
      // delete
      if (selected_node) {
        nodes.splice(nodes.indexOf(selected_node), 1);
        spliceLinksForNode(selected_node);
      } else if (selected_link) {
        links.splice(links.indexOf(selected_link), 1);
      }
      selected_link = null;
      selected_node = null;
      redraw();
      if (gamePlay && gameMode == 0) {
        Game.play();
      }
      break;
    }
  }
}
