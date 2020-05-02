// Dikstra's shortest path algorithm, without backtracing
class Graph {
  constructor() {
    this.nodes = [];
    this.adjacencyList = {};
  }

  addNode(node) {
    this.nodes.push(node);
    this.adjacencyList[node] = [];
  }

  addEdge(node1, node2, weight) { // backwards edge not required
    this.adjacencyList[node1].push({ node: node2, weight });
    // this.adjacencyList[node2].push({ node: node1, weight });
  }

  findPathWithDijkstra(startNode, endNode) {
    const totalWeights = {};
    const backtrace = {};
    const pq = new PriorityQueue();

    totalWeights[startNode] = 0;

    this.nodes.forEach((node) => {
      if (node !== startNode) {
        totalWeights[node] = Infinity;
      }
    });

    pq.enqueue([startNode, 0]);

    while (!pq.isEmpty()) {
      const shortestStep = pq.dequeue();

      const currentNode = shortestStep[0];
      this.adjacencyList[currentNode].forEach((neighbour) => {
        const weight = totalWeights[currentNode] + neighbour.weight;

        if (weight < totalWeights[neighbour.node]) {
          totalWeights[neighbour.node] = weight;
          backtrace[neighbour.node] = currentNode;
          pq.enqueue([neighbour.node, weight]);
        }
      });
    }

    const path = [endNode];
    let lastStep = endNode;
    while (lastStep !== startNode) {
      path.unshift(backtrace[lastStep]);
      lastStep = backtrace[lastStep];
    }
    console.info(`Path is ${path} and totalWeight is ${totalWeights[endNode]}`);
    return path;
  }
};

class PriorityQueue {
  constructor() {
    this.collection = [];
  }

  enqueue(element) {
    if (this.isEmpty()) {
      this.collection.push(element);
    } else {
      let added = false;
      for (let i = 1; i <= this.collection.length; i++) {
        if (element[1] < this.collection[i - 1][1]) {
          this.collection.splice(i - 1, 0, element);
          added = true;
          break;
        }
      }
      if (!added) {
        this.collection.push(element);
      }
    }
  }

  dequeue() {
    const value = this.collection.shift();
    return value;
  }

  isEmpty() {
    return (this.collection.length === 0);
  }
}


export const dijkstraMethod = (matrix, binormals, start, end) => {
  const map = new Graph();

  const segmentWeight = (v1, v2, binormal) => {
    const alpha = 0.1;
    const beta = 10;
    const theta = v2.angleTo(binormal);
    return alpha * v1.distanceTo(v2) + beta * Math.sin(theta);

    // Beta * Cos( P ) – Alpha * ( A + B );
    // const v1 = p.clone().sub(pMinus1.clone());
    // const v2 = pPlus1.clone().sub(p.clone());
    
    // debugger;
    // console.log(beta * Math.cos(theta));
    // console.log('1::', pMinus1, p, pPlus1)
    //console.log('2::', (theta / (2 * Math.PI)) * 360);
    return beta * Math.cos(theta);

    // return beta * Math.cos(theta);// - alpha * (v1.length() + v2.length());
  };

  // add nodes
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      map.addNode(`${i}-${j}`);
    }
  }
  // add edges
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[0].length; j++) {
      for (let k = 0; k < matrix[0].length; k++) {
        let weight;
        if (matrix[i + 1]) {
          // we can also weight by curvature
          weight = segmentWeight(matrix[i][j], matrix[i + 1][k], binormals[i]);
        } else {
          weight = 0;
        }
        map.addEdge(`${i}-${j}`, `${i + 1}-${k}`, weight);
      }
    }
  }
  const pathKeys = map.findPathWithDijkstra(`${start}-3`, `${end}-3`);
  const nodes = pathKeys.map((pathKey) => {
    const [nodeX, nodeY] = pathKey.split('-');
    return [parseInt(nodeX, 10), parseInt(nodeY, 10)];
  });
  return nodes;
};
