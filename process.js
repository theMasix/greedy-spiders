let selectMode = $('#select-mode');
selectMode.on('change', () => {
  gameMode = Number(selectMode.val());
  // console.log(gameMode);
});

let startButton = $('.start-button');
startButton.on('click', () => {
  Game.setGamePlay(true);
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
    let textSVGElement = `<span style="left:${aNodeXPosition - 3}px; top:${aNodeYPosition -
      8}px;" fill="red";" class="node-index" data-node-index="${aNodeIndex}">${aNodeIndex}</span>`;
    // console.log(textSVGElement);
    $('svg')
      .parent()
      .append(textSVGElement);
  }
};

if (writeIndexOnNodes) {
  // Run writeNodesIndex automaticly and with intervals
  setInterval(() => {
    procGraph.writeNodesIndex();
  }, 20);
}

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

procGraph.addData = function(dataName, dataToAdd, targetNodeIndex) {
  for (aNode of nodes) {
    if (aNode.index == targetNodeIndex) {
      let targetXPosition = aNode.x;
      let target = $(`[cx='${targetXPosition}']`);
      target.attr(`data-${dataName}`, dataToAdd);
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
    // Minus one because our index starts at 0
    spiderIndex = Number(splittedData[0] - 1);
    // remove spiderIndex from splittedData
    splittedData.splice(0, 1);
  }

  butterfliesCount = Number(splittedData[0]);
  // remove butterfliesCount from splittedData
  splittedData.splice(0, 1);

  if (butterfliesCount) {
    // Minus one because our index starts at 0
    butterfliesIndexes = splittedData[0].split(' ').map(value => {
      return Number(value) - 1;
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
procGraph.removeSpider = function() {
  let lastSpider = $('.spider');
  lastSpider.removeClass('spider');
};
procGraph.addSpider = function() {
  let newSpiderEl = $('.node_selected');

  if (gamePlay && gameMode == 1) {
    let isNeighbor = false;
    if (!this.allNode) {
      // Then it means allNodes has not been processed
      // So we process it
      let gameGraph = procGraph.getGraphMatrix();
      Game.allNodes = Game.createNodesObject(gameGraph);
    }

    // Check if the rules alows the spider to move
    let currentSpidersIndex = procGraph.getSpiders();
    let currentSpiderNode = Game.allNodes[currentSpidersIndex[0]];

    let newSpiderIndex = newSpiderEl.data('node-index');

    // Check if the newSpider is in the currentSpiderNode or not
    for (aNeighbor of currentSpiderNode.neighbors) {
      if (aNeighbor.index == newSpiderIndex) {
        isNeighbor = true;
        break;
      }
    }

    if (!isNeighbor) {
      text = `راسی را انتخاب کنید که امکان حرکت به آن را داشته باشید.`;
      toast(text, 'red');
      // Then we know we couldn't continue
      return;
    }
  }
  // First remove last spider
  procGraph.removeSpider();

  // if (newSpiderEl.length) {
  newSpiderEl.addClass('spider');
  // }

  if (gamePlay && gameMode == 1) {
    // We know that we should play as protector
    Game.play();
  }
};
procGraph.moveSpider = function(newSpiderNodeIndex) {
  // First remove last spider
  procGraph.removeSpider();
  // Then add new spider
  procGraph.addClass('spider', newSpiderNodeIndex);
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
  // Minus one because our index starts at 0
  spiders = spiders.map(num => num + 1);
  // Add number of spiders
  textToSave += prepareTextToWrite(spiders.length);
  if (spiders.length) {
    // Add index of spiders
    textToSave += prepareTextToWrite(arrayToText(spiders));
  }

  let butterflies = procGraph.getButterflies();
  // Minus one because our index starts at 0

  butterflies = butterflies.map(num => num + 1);

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

Game.createWinners = function(butterfliesIndexes) {
  // First initialize the base
  // It means we first specify all butterflies as winners
  for (butterflyIndex of butterfliesIndexes) {
    let butterfly = this.allNodes[butterflyIndex];
    butterfly.isWinner = true;
    butterfly.isButterfly = true;
    // butterfly.set remains empty
  }
  let graphSize = this.allNodes.length;

  // let refreshCount = 1;
  for (mainIterator = 0; mainIterator < graphSize; mainIterator++) {
    let stateChange = false;
    let currentNode = this.allNodes[mainIterator];

    // If the currentNode is butterfly, we should ignore it
    if (currentNode.isButterfly) continue;

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
        let winnerNeighborsEdges = Game.makeDictFromNodesSet(winnerNeighbors);
        let newSet = currentNode.createNewSet(winnerNeighborsEdges, winnerNeighbors);

        if (!areArraysEqual(newSet, currentNode.set) || true != currentNode.isWinner) {
          currentNode.isWinner = true;
          currentNode.set = newSet;
          // let's refresh the loop
          stateChange = true;
        }
      }
    }

    if (stateChange) {
      // console.log('refreshed!');
      // Reset main loop
      mainIterator = -1;
      // refreshCount += 1;
    }
  }
};

Game.bfs = function(spiderNode) {
  let foundedNode = undefined;
  let current = undefined;
  let queue = [];
  spiderNode.bfs.isSeen = true;
  queue.push(spiderNode);

  while (queue.length != 0) {
    current = queue.shift();

    // If we go to next level from our last founded isWinner
    if (foundedNode && current.bfs.parent != foundedNode.bfs.parent) break;

    if (current.isWinner) {
      // We found a butterfly
      foundedNode = current;

      // If the node is butterfly, we exit from bfs searching
      if (foundedNode.isButterfly) break;
    }
    for (aNode of current.neighbors) {
      if (!aNode.bfs.isSeen) {
        aNode.bfs.isSeen = true;
        aNode.bfs.parent = current;
        queue.push(aNode);
      }
    }
  }

  // Lets make route from start to end
  let route = [];
  // This means we didn't found any route to a winner node
  if (!foundedNode) {
    return route;
  }

  let routeNode = foundedNode;
  route.unshift(routeNode);
  while (routeNode.bfs.parent) {
    routeNode = routeNode.bfs.parent;
    route.unshift(routeNode);
  }

  // // Lets clear our nodes
  // for (aNode of Game.allNodes) {
  //   aNode.bfs.parent = undefined;
  //   aNode.bfs.isSeen = false;
  // }
  return route;
};

Game.bestMove = function(spiderNode) {
  let distNode = undefined;

  if (spiderNode.isWinner) {
    let winnerNeighbors = spiderNode.getWinnerNeighbors();

    // Lets pick a winnerNeighbor
    distNode = winnerNeighbors[0];

    // Search in winnerNeighbors to find if there is a butterfly
    for (winnerNeighbor of winnerNeighbors) {
      if (winnerNeighbor.isButterfly) {
        // Now we change current distNode
        distNode = winnerNeighbor;
        break;
      }
    }
  } else {
    let bfs = Game.bfs(spiderNode);
    if (bfs.length != 0) {
      distNode = bfs[1];
    }
  }
  return distNode;
};

Game.bestCut = function(spiderNode) {
  let chosenEdge = [];
  // Lets create a dict with all nodes
  let generalDict = Game.makeDictFromNodesSet(this.allNodes);
  let butterflyNeighbor = undefined;

  let winnerNeighbors = spiderNode.getWinnerNeighbors();
  if (winnerNeighbors.length == 0) {
    // If spider node has no node which is a winner
    // We cut an edge that more winners will transform to not winners
    // And if we have no winner node except butterflies, we find the spider route
    // Then remove the last edge from it's route

    // If we have winner nodes except butterflies
    if (generalDict.length != 0) {
      // Find the most common edge in generalDict
      let mostEdgesCount = 0;
      for (setOfEdges of generalDict) {
        if (setOfEdges.length > mostEdgesCount) {
          mostEdgesCount = setOfEdges.length;
          chosenEdge = setOfEdges[0];
        }
      }
    } else {
      // we have no winner node except butterflies
      let route = Game.bfs(spiderNode);

      if (route.length) {
        // It means that we have a route from spider to butterflies
        let routeLength = route.length;

        let fromNode = route[routeLength - 2];
        let toNode = route[routeLength - 1];

        chosenEdge = Game.makeEdge(fromNode.index, toNode.index);
      }
    }
  } else {
    // Then we cut an edge which is in the all winner neighbors set and is the most common in other winner neighbors node

    // Lets create a dict with all spiderNode winner neighbors
    winnerNeighborsSetDict = Game.makeDictFromNodesSet(winnerNeighbors);

    // Create an array which has edges that are in all winner neighbors
    let subscriptionSet = [];
    for (setGroup of winnerNeighborsSetDict) {
      if (setGroup.length == winnerNeighbors.length) {
        subscriptionSet.push(setGroup[0]);
      }
    }

    if (subscriptionSet.length == 0) {
      // If it happens, we know that a butterfly is in the neighbors

      // Let's find the butterfly neighbor
      for (aNode of winnerNeighbors) {
        if (aNode.isButterfly) {
          butterflyNeighbor = aNode;
        }
      }

      if (!butterflyNeighbor) {
        // If butterflyNeighbor is undefined!
        // Means that non of the neighbors is not winnners
        // So we cut as we cut when winnerNeighbors.length == 0

        // Find the most common edge in generalDict
        let mostEdgesCount = 0;
        for (setOfEdges of generalDict) {
          if (setOfEdges.length > mostEdgesCount) {
            mostEdgesCount = setOfEdges.length;
            chosenEdge = setOfEdges[0];
            return chosenEdge;
          }
        }
      }

      // Then cut the edges between spiderNode and butterflyNode
      chosenEdge = Game.makeEdge(spiderNode.index, butterflyNeighbor.index);
      return chosenEdge;
    }

    // Find the most common edge in generalDict which is also in subscriptionSet
    let mostEdgesCount = 0;
    for (setOfEdges of generalDict) {
      if (setOfEdges.length > mostEdgesCount && isArrayExistsInArray(subscriptionSet, setOfEdges[0])) {
        mostEdgesCount = setOfEdges.length;
        chosenEdge = setOfEdges[0];
      }
    }
  }
  return chosenEdge;
};

Game.setGamePlay = function(newGamePlay) {
  gamePlay = newGamePlay;

  let spidersIndex = procGraph.getSpiders();
  if (spidersIndex.length == 0) {
    text = `اول عنکبوت رو مشخص کن. روی یه راس کلیک کن و حرف s رو بزن `;
    toast(text, 'red');
    return;
  }

  let butterflyIndexes = procGraph.getButterflies();
  if (butterflyIndexes.length == 0) {
    text = `اول پروان ها رو مشخص کن. روی یه راس کلیک کن و حرف b رو بزن `;
    toast(text, 'red');
    return;
  }

  // If there was no error
  if (newGamePlay) {
    // Add node index data to svg
    Game.addIndexData();

    text = `بازی شروع شده! حرکتت رو انجام بده`;
    toast(text);
  }
};

Game.makeDictFromNodesSet = function(someNodes) {
  let mydict = [];
  let founded = false;
  for (aNode of someNodes) {
    for (aNodeSetEdge of aNode.set) {
      for (el of mydict) {
        if (isArrayExistsInArray(el, aNodeSetEdge)) {
          el.push(aNodeSetEdge);
          founded = true;
          break;
        }
      }
      if (!founded) {
        mydict.push([aNodeSetEdge]);
        founded = false;
      }
    }
  }
  return mydict;
};

Game.addIndexData = function() {
  for (aNode of nodes) {
    procGraph.addData('node-index', String(aNode.index), aNode.index);
  }
};

Game.play = function() {
  let gameGraph = procGraph.getGraphMatrix();
  this.allNodes = Game.createNodesObject(gameGraph);

  console.log(this.allNodes);

  let butterfliesIndexes = procGraph.getButterflies();
  Game.createWinners(butterfliesIndexes);

  // Get the first spider node
  let spidersIndex = procGraph.getSpiders();
  let spiderNode = this.allNodes[spidersIndex[0]];

  // computer plays as spider
  if (gameMode == 0) {
    let distinationNode = Game.bestMove(spiderNode);

    if (!distinationNode) {
      // It means butterflies won
      text = `شما بردید! عنکبوت دیگه راهی نداره که ببره`;
      toast(text);

      // Stop the game
      Game.setGamePlay(false);
      return;
    }
    procGraph.moveSpider(distinationNode.index);

    if (distinationNode.isButterfly) {
      text = `شما باختید! عنکبوت به پروانه رسید`;
      toast(text, 'red');

      // Stop the Game
      Game.setGamePlay(false);
    }
  }

  // Computer plays as protector
  if (gameMode == 1) {
    if (spiderNode.isButterfly) {
      // It means the spider won
      let text = `شما بردید. به پروانه رسیدید!`;
      toast(text);

      Game.setGamePlay(false);
      return;
    }

    let distinationLink = Game.bestCut(spiderNode);

    if (distinationLink.length) {
      // Delete the link
      let fromNodeIndex = distinationLink[0];
      let targetNodeIndex = distinationLink[1];
      procGraph.removeLink(fromNodeIndex, targetNodeIndex);

      // We should create allNodes again to know if the protector won or not
      let gameGraph = procGraph.getGraphMatrix();
      this.allNodes = Game.createNodesObject(gameGraph);
      Game.createWinners(butterfliesIndexes);
      // Get the spider node again
      let spidersIndex = procGraph.getSpiders();
      let spiderNode = this.allNodes[spidersIndex[0]];

      // Now run bfs again
      let route = Game.bfs(spiderNode);
      if (route.length == 0) {
        // It means there is route from spider to butterflies
        text = `شما باختید! نتونستید به پروانه برسید`;
        toast(text, 'red');

        Game.setGamePlay(false);
      }
    }
  }

  // Reset date
  this.allNodes = [];
};

function Node(index) {
  this.index = Number(index);
  this.isWinner = false;
  // this.isChecked = false;
  this.isButterfly = false;
  this.set = [];
  this.neighbors = [];
  this.bfs = {};
  this.bfs.isSeen = false;
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
}

// Enable hotkeys
window.addEventListener('keydown', e => {
  key = e.key;
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
      Game.setGamePlay(true);
  }
});

// Download the text that is given to it
function saveFile(text) {
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
