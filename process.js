// Checking gameMode and track it
let gameMode = 0;
let selectMode = $('#select-mode');
selectMode.on('change', () => {
  gameMode = selectMode.val();
  // console.log(gameMode);
});

// Reading file from input
document.getElementById('input-file').addEventListener('change', getFile);
function getFile(event) {
  let input = event.target;
  readFileContent(input.files[0])
    .then(content => {
      // console.log(content);
      procGraph.handleReadFile(content);
    })
    .catch(error => console.log(error));
}
function readFileContent(file) {
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = event => resolve(event.target.result);
    reader.onerror = error => reject(error);
    reader.readAsText(file);
  });
}

// Graph processing container
let procGraph = {};

procGraph.writeNodesIndex = function() {
  // Remove previous span
  $('.node-index').remove();

  for (aNodeIndex in nodes) {
    let aNode = nodes[aNodeIndex];
    let aNodeXPosition = aNode.x;
    let aNodeYPosition = aNode.y;
    let textSVGElement = `<span style="left:${aNodeXPosition - 5}px; top:${aNodeYPosition -
      5}px;" fill="red";" class="node-index" data-node-index="${aNodeIndex}">${aNodeIndex}</span>`;
    // console.log(textSVGElement);
    $('svg')
      .parent()
      .append(textSVGElement);
  }
};

// Run writeNodesIndex automaticly and with intervals
// setInterval(() => {
//   procGraph.writeNodesIndex();
// }, 50);

procGraph.hasLink = function(nodeIndex1, nodeIndex2) {
  for (aLink of links) {
    if ((aLink.source.index == nodeIndex1 && aLink.target.index == nodeIndex2) || (aLink.source.index == nodeIndex2 && aLink.target.index == nodeIndex1))
      return true;
  }
  return false;
};
procGraph.addLink = function(nodeIndex1, nodeIndex2) {
  let newLink = {
    source: Number(nodeIndex1),
    target: Number(nodeIndex2)
  };
  links.push(newLink);
  redraw();
};
procGraph.removeLink = function(nodeIndex1, nodeIndex2) {
  // First find that Link
  var linkIndex = -1;
  for (aLinkIndex in links) {
    let aLink = links[aLinkIndex];
    if ((aLink.source.index == nodeIndex1 && aLink.target.index == nodeIndex2) || (aLink.source.index == nodeIndex2 && aLink.target.index == nodeIndex1)) {
      linkIndex = aLinkIndex;
      break;
    }
  }

  // Check if we found any link
  if (linkIndex == -1) return false;
  // Then remove it
  links.splice(linkIndex, 1);
  redraw();
  return true;
};

procGraph.addClass = function(newClass, targetNodeIndex) {
  for (aNode of nodes) {
    if (aNode.index == targetNodeIndex) {
      let targetXPosition = aNode.x;
      let target = $(`[cx='${targetXPosition}']`);
      target.addClass(newClass);
      break;
    }
  }
};
procGraph.removeClass = function(oldClass, targetNodeIndex) {
  for (aNode of nodes) {
    if (aNode.index == targetNodeIndex) {
      let targetXPosition = aNode.x;
      let target = $(`[cx='${targetXPosition}']`);
      target.removeClass(oldClass);
      break;
    }
  }
};

procGraph.handleReadFile = function(content) {
  // Initialize vars
  var spiderCount, spiderIndex, butterfliesCount, butterfliesIndexes;
  // Remove the node which is in the initialization
  nodes.pop();
  redraw();

  let splittedData = content.split('\n');

  let graphSize = Number(splittedData[0]);
  // remove graphSize from splittedData
  splittedData.splice(0, 1);

  let matrix = [];
  for (i = 0; i < graphSize; i++) {
    // Convert data type from string to integer
    let row = splittedData[i].split(' ').map(data => {
      return Number(data);
    });
    matrix.push(row);
  }

  // remove matrix from splittedData
  for (i = 0; i < graphSize; i++) {
    splittedData.splice(0, 1);
  }

  spiderCount = Number(splittedData[0]);
  // remove spiderCount from splittedData
  splittedData.splice(0, 1);

  if (spiderCount) {
    spiderIndex = Number(splittedData[0]);
    // remove spiderIndex from splittedData
    splittedData.splice(0, 1);
  }

  butterfliesCount = Number(splittedData[0]);
  // remove butterfliesCount from splittedData
  splittedData.splice(0, 1);

  if (butterfliesCount) {
    butterfliesIndexes = splittedData[0].split(' ').map(value => {
      return Number(value);
    });
    // remove butterfliesIndexes from splittedData
    splittedData.splice(0, 1);
  }

  // Draw nodes
  for (i = 0; i < graphSize; i++) {
    nodes.push({});
  }
  redraw();

  // Draw links
  for (currentNodeIndex in matrix) {
    currentNodeIndex = Number(currentNodeIndex);
    // console.log(currentNodeIndex);
    let row = matrix[currentNodeIndex];

    for (nodeIndex in row) {
      nodeIndex = Number(nodeIndex);
      if (row[nodeIndex]) {
        if (procGraph.hasLink(currentNodeIndex, nodeIndex)) continue;
        procGraph.addLink(currentNodeIndex, nodeIndex);
      }
    }
  }

  // Specify Spider
  // This timeout fixes the bug!
  setTimeout(() => {
    procGraph.addClass('spider', spiderIndex);
  }, 100);

  // Specify butterflies
  // This timeout fixes the bug!
  setTimeout(() => {
    for (butterflyIndex of butterfliesIndexes) {
      procGraph.addClass('butterfly', butterflyIndex);
    }
  }, 100);
};

procGraph.getLinks = function(myLinks) {
  answer = [];
  for (myLink of myLinks) {
    let vertexes = [];
    vertexes.push(myLink.source.index);
    vertexes.push(myLink.target.index);
    answer.push(vertexes);
  }
  return answer;
};
procGraph.getNodes = function(allNodes) {
  answer = [];
  for (myNode in allNodes) {
    answer.push(myNode);
  }
  return answer;
};
procGraph.getButterflies = function() {
  // force.stop();
  let allNodes = force.nodes();
  let indexes = [];
  for (myNode of allNodes) {
    let x = myNode.x;
    // console.log(svgNode);
    let svgNode = $(`[cx='${x}'].butterfly`);
    if (svgNode.length) {
      indexes.push(myNode.index);
    }
  }
  // force.start();
  return indexes;
};
procGraph.getSpiders = function() {
  // force.stop();
  let allNodes = force.nodes();
  let indexes = [];
  for (myNode of allNodes) {
    let x = myNode.x;
    // console.log(svgNode);
    let svgNode = $(`[cx='${x}'].spider`);
    if (svgNode.length) {
      indexes.push(myNode.index);
    }
  }
  // force.start();
  return indexes;
};
procGraph.getGraphSize = function() {
  let myGraph = force.nodes();
  return myGraph.length;
};
procGraph.getGraphMatrix = function() {
  let myGraph = this.getNodes(force.nodes());
  let myLinks = this.getLinks(force.links());
  let graphLength = myGraph.length;

  for (i = 0; i < graphLength; i++) {
    myGraph[i] = [];
  }

  for (i in myGraph) {
    for (j = 0; j < graphLength; j++) {
      myGraph[i].push(0);
    }
  }

  for (myLink of myLinks) {
    let x = myLink[0];
    let y = myLink[1];
    myGraph[x][y] = 1;
    myGraph[y][x] = 1;
  }
  return myGraph;
};
procGraph.addButterfly = function() {
  let searchElement = $('.node_selected');
  if (searchElement.length) {
    searchElement.addClass('butterfly');
  }
};
procGraph.addSpider = function() {
  let searchElement = $('.node_selected');
  if (searchElement.length) {
    searchElement.addClass('spider');
  }
};

// preparing a variable to save and download.
procGraph.createExportFile = function() {
  let textToSave = '';
  textToSave += prepareTextToWrite(procGraph.getGraphSize());

  let graphMatrix = procGraph.getGraphMatrix();
  // add each row to textToSave
  for (row of graphMatrix) {
    textToSave += prepareTextToWrite(arrayToText(row));
  }

  let spiders = procGraph.getSpiders();
  // Add number of spiders
  textToSave += prepareTextToWrite(spiders.length);
  if (spiders.length) {
    // Add index of spiders
    textToSave += prepareTextToWrite(arrayToText(spiders));
  }

  let butterflies = procGraph.getButterflies();

  // Add number of butterflies
  textToSave += prepareTextToWrite(butterflies.length);
  if (butterflies.length) {
    // Add index of butterflies
    textToSave += prepareTextToWrite(arrayToText(butterflies));
  }

  // Only for ebrahim
  // Save position of each node
  // let newNodes = force.nodes();
  // for (myNode of newNodes) {
  //   let px = Math.floor(myNode.px);
  //   let py = Math.floor(myNode.py);
  //   let text = `${myNode.index} ${px} ${py}`;
  //   textToSave += prepareTextToWrite(text);
  // }

  // textToSave += prepareTextToWrite(gameMode);

  // saving Data and download it!
  saveFile(textToSave);
};

let Game = {};

Game.allNodes = [];

Game.createNodesObject = function(gameGraph) {
  let allNodes = [];
  // Create objects
  for (nodeIndex in gameGraph) {
    let newNode = new Node(nodeIndex);
    allNodes.push(newNode);
  }

  // Add neighbors
  for (nodeIndex in gameGraph) {
    let currentNode = allNodes[nodeIndex];

    let row = gameGraph[nodeIndex];
    for (neighborIndex in row) {
      if (row[neighborIndex]) {
        currentNode.neighbors.push(allNodes[neighborIndex]);
      }
    }
  }
  return allNodes;
};

// Game.unCheckNodes = function() {
//   for (aNode of this.allNodes) {
//     if (!aNode.isButterfly) {
//       aNode.isChecked = false;
//     }
//   }
// };

// Game.checkWinner = function() {};

Game.createWinners = function(butterfliesIndexes) {
  // First initialize the base
  // It means we first specify all butterflies as winners
  for (butterflyIndex of butterfliesIndexes) {
    let butterfly = this.allNodes[butterflyIndex];
    // butterfly.isChecked = true;
    butterfly.isWinner = true;
    butterfly.isButterfly = true;
    // butterfly.set remains empty
  }
  let graphSize = this.allNodes.length;

  let refreshCount = 1;
  for (mainIterator = 0; mainIterator < graphSize; mainIterator++) {
    let stateChange = false;
    let currentNode = this.allNodes[mainIterator];

    // If the currentNode is butterfly, we should ignore it
    if (currentNode.isButterfly) continue;
    // if (currentNode.isChecked) continue;
    // Let's check it!
    // currentNode.isChecked = true;

    let winnerNeighbors = currentNode.getWinnerNeighbors();

    if (winnerNeighbors.length >= 2) {
      var couldBeWinner = currentNode.isWinner ? true : false;

      // Because we know if the spider is winner, it couldn't be a not-winner anymore
      if (!currentNode.isWinner) {
        for (i = 0; i < winnerNeighbors.length - 1; i++) {
          for (j = i + 1; j < winnerNeighbors.length; j++) {
            // Check for subscirption in sets
            let hasSetsSubscription = Game.hasSetsSubscription([winnerNeighbors[i], winnerNeighbors[j]]);
            if (!hasSetsSubscription) {
              couldBeWinner = true;
              break;
            }
          }
          if (couldBeWinner) {
            break;
          }
        }
      }

      // Now we create a set and check it if the loop should be restart
      if (couldBeWinner) {
        // Create a count edges object to know what edges should be in set
        let winnerNeighborsEdges = currentNode.countEdges(winnerNeighbors);
        let newSet = currentNode.createNewSet(winnerNeighborsEdges, winnerNeighbors);

        if (!areArraysEqual(newSet, currentNode.set) || true != currentNode.isWinner) {
          // console.log(newSetJSON != currentNodeSetJSON);
          // console.log(true != currentNode.isWinner);
          currentNode.isWinner = true;
          currentNode.set = newSet;
          // let's refresh the loop
          stateChange = true;
          // if (currentNode.index == 4 || currentNode.index == 6) {
          // if (true) {
          //   console.log(winnerNeighbors);
          //   console.log(winnerNeighborsEdges);
          //   console.log(newSet);
          //   console.log(currentNode);
          // }
        }
      }
    }

    if (stateChange) {
      console.log('refreshed!');
      // Reset main loop
      mainIterator = -1;
      refreshCount += 1;
      // Reset isChecked for each node
      // Game.unCheckNodes();
    }
  }
};

Game.hasSetsSubscription = function(nodes) {
  let dict = [];
  for (aNode of nodes) {
    for (edgeInSet of aNode.set) {
      if (dict.indexOf(edgeInSet) != -1) return true;
      dict.push(edgeInSet);
    }
  }
  return false;
};

// This create an edge based on our principles
// it means that node with lower index should write before another
Game.makeEdge = function(index1, index2) {
  let edge = [Math.min(index1, index2), Math.max(index1, index2)];
  return edge;
};

Game.play = function() {
  let gameGraph = procGraph.getGraphMatrix();
  this.allNodes = Game.createNodesObject(gameGraph);

  // add nodes index to svg circle class
  // This is temporary
  for (aNode of this.allNodes) {
    procGraph.addClass(String(aNode.index), aNode.index);
  }

  procGraph.writeNodesIndex();

  let butterfliesIndexes = procGraph.getButterflies();
  Game.createWinners(butterfliesIndexes);
  console.log(this.allNodes);
};

function Node(index) {
  this.index = Number(index);
  this.isWinner = false;
  // this.isChecked = false;
  this.isButterfly = false;
  this.set = [];
  this.neighbors = [];
  this.bfs = {};
  this.bfs.seen = false;
  this.bfs.parent = undefined;

  this.getWinnerNeighbors = function() {
    let winnerNeighbors = [];
    for (neighbor of this.neighbors) {
      // Now we check that that neighbor shouldn't be winner by this node!
      let edge = Game.makeEdge(this.index, neighbor.index);
      if (neighbor.isWinner && !isArrayExistsInArray(neighbor.set, edge)) {
        // if (neighbor.isWinner) {
        winnerNeighbors.push(neighbor);
      }
    }

    return winnerNeighbors;
  };
  this.createNewSet = function(neighborsEdgeDict, winnerNeighbors) {
    let newSet = [];

    // Add nodes' set to this node set
    for (el of neighborsEdgeDict) {
      if (el.length == winnerNeighbors.length - 1) {
        // Add one of that edges to the set
        newSet.push(el[0]);
      }
    }

    for (winnerNode of winnerNeighbors) {
      // Add edges between this node and winnerNeighbors to set
      let edge = Game.makeEdge(this.index, winnerNode.index);
      newSet.push(edge);
    }
    return newSet;
  };
  this.countEdges = function(winnerNeighbors) {
    let mydict = [];
    let founded = false;
    for (winnerNeighbor of winnerNeighbors) {
      for (winnerSetEdge of winnerNeighbor.set) {
        for (el of mydict) {
          if (el.indexOf(winnerSetEdge) != -1) {
            el.push(winnerSetEdge);
            founded = true;
          }
        }
        if (!founded) {
          mydict.push([winnerSetEdge]);
        }
      }
    }
    return mydict;
  };
}

// Enable hotkeys
window.addEventListener('keydown', e => {
  key = e.key;
  // console.log(key);
  switch (key) {
    case 'b':
      procGraph.addButterfly(key);
      break;
    case 's':
      procGraph.addSpider(key);
      break;
    case 'e':
      procGraph.createExportFile();
      break;
    case 'r':
      Game.play();
  }
});

// Download the text that is given to it
function saveFile(text) {
  // var pom = document.createElement('a');
  // pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURI(text));
  // pom.setAttribute('download', 'graphData');

  // pom.style.display = 'none';
  // document.body.appendChild(pom);
  // pom.click();
  // document.body.removeChild(pom);
  var blob = new Blob([text], {
    type: 'text/plain;charset=utf-8'
  });
  saveAs(blob, 'graphData.txt');
}
// Only add a \n to the end of the text
function prepareTextToWrite(text) {
  return text + '\n';
}
// It turns an array into string
function arrayToText(arr) {
  let text = '';
  for (i = 0; i < arr.length; i++) {
    text += arr[i];
    if (i != arr.length - 1) {
      text += ' ';
    }
  }
  return text;
}

function areArraysEqual(arr1, arr2) {
  let arr1JSON = JSON.stringify(arr1);
  let arr2JSON = JSON.stringify(arr2);
  if (arr1JSON == arr2JSON) return true;
  return false;
}

// Search array in array
function isArrayExistsInArray(array, value) {
  let stringifyValue = JSON.stringify(value);
  for (item of array) {
    let stringifyItem = JSON.stringify(item);
    if (stringifyItem == stringifyValue) return true;
  }
  return false;
}
