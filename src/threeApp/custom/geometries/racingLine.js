import * as THREE from 'three';
import { getSpacedPoints, computeFrenetFrames } from '../../helpers/curveHelpers';
// import { signedTriangleArea } from '../../helpers/apexHelpers';
// import createApexes from './track';
// import { createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
// import { InstancesStandardMaterial, InstancesDepthMaterial } from '../materials/InstancesStandardMaterials';
// import { MeshSurfaceSampler } from '../../helpers/MeshSurfaceSampler';

export const racingLineCrossSection = () => (new THREE.Shape([
  new THREE.Vector2(-0, 1),
  new THREE.Vector2(-0, -1),
]));


// export const racingLineCurve = (trackParams) => {
//   const centerLine = trackParams.centerLine;
//   const steps = trackParams.steps;
//   const { binormals, tangents } = computeFrenetFrames(centerLine, steps);
//   const points = centerLine.getSpacedPoints(steps);

//   const angles = tangents.map((t, i, arr) => {
//     if (arr[i - 1] && arr[i + 1]) {
//       const signedArea = signedTriangleArea(points[i - 1], points[i], points[i + 1]);
//       const dir = Math.sign(signedArea);
//       return 0.5 * arr[i - 1].angleTo(arr[i + 1]) * dir;
//     }
//     return 0;
//   });

//   // const signedArea = signedTriangleArea(points[i - 1], points[i], points[i + 1]);
//   // const dir = Math.sign(signedArea);
//   const shiftedPoints = points.reduce((a, p, i) => {
//     //console.log((trackParams.trackHalfWidth) * angles[i] * 100);
//     let averageAngle = 0;
//     if (angles[i+1]) {
//       //averageAngle = (angles[i-1] + angles[i] + angles[i+1])/3;
//       averageAngle = getAverageAngle(i, angles)
//       //console.log({averageAngle})
//     }

//     const shiftK = Math.min(
//       trackParams.trackHalfWidth * Math.tan(averageAngle) * 40,
//       trackParams.trackHalfWidth,
//     );

//     const point = p.sub(
//       binormals[i]
//         .clone()
//         .multiplyScalar(shiftK),
//     );
//     return [...a, point];
//   }, []);

//   const curve = new THREE.CatmullRomCurve3(shiftedPoints);
//   curve.closed = true;
//   curve.arcLengthDivisions = steps;

//   return curve;
// }

// export const racingLineCurve2 = (trackParams) => {
//   const apexes = trackParams.apexes;
//   const centerLine = trackParams.centerLine;
//   const steps = trackParams.steps;

//   const apexPoints = apexes.map((apex, i) => {
//     const apexMarkerPosn = apex.p
//       // .sub(
//       //   apex.binormal
//       //     .clone()
//       //     .multiplyScalar((trackParams.trackHalfWidth - 1) * apex.dir),
//       // );
//     const position = new THREE.Vector3(apexMarkerPosn.x, apexMarkerPosn.y + 0.1, apexMarkerPosn.z);
//     return position;
//   });

//   const rawCurve = new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,0), ...apexPoints]);
//   rawCurve.closed = true;
//   rawCurve.arcLengthDivisions = steps;
//   //const rawCurve.getSpaced
//   const apexSpacedPoints = getSpacedPoints(rawCurve, steps);
//   const centerLineSpacedPoints = getSpacedPoints(centerLine, steps);
//   const spacedPoints = apexSpacedPoints.map((p, i) => new THREE.Vector3(p.x, centerLineSpacedPoints[i].y + 0.2, p.z));
//   console.log({ centerLineSpacedPoints, spacedPoints });

//   // TODO: need same steps as centerline and adjust height to be above track
//   const curve = new THREE.CatmullRomCurve3(spacedPoints);
//   curve.closed = true;
//   return curve;
// }


const getAverageAngle = (i, angles, spread = 20) => {
  angles[i] + angles[i + 1]

  return new Array(spread).fill(0).reduce((a, c, idx) => {
    let arrI = i + idx - spread;
    if (arrI < 0) arrI += angles.length;
    if (arrI > angles.length) arrI -= angles.length;
    return a + angles[arrI] / spread;
  }, 0);
}

export const racingLine = (scene) => {
  // const centerLine = trackParams.centerLine;
  // const steps = 10;//trackParams.steps;
  // /const { binormals, tangents } = computeFrenetFrames(centerLine, steps);
  // const cpPoints = centerLine.getSpacedPoints(steps);

  const wpCount = 7;
  const cpCount = 20;
  const trackHalfWidth = 2;

  const b = [
    new THREE.Vector3(0, 0, 10),
    // new THREE.Vector3(0,0,0),
    new THREE.Vector3(10, 0, -10),
    new THREE.Vector3(-10, 0, -30),
    new THREE.Vector3(-10, 0, -50),

    new THREE.Vector3(0,0,-70),
    // new THREE.Vector3(0, 0, -40),
    // new THREE.Vector3(10, 0, -80),

  ];
  const centerLine = new THREE.CatmullRomCurve3(b);
  const cpPoints = centerLine.getSpacedPoints(cpCount);
  const { binormals } = computeFrenetFrames(centerLine, cpCount);
  console.log({ binormals, cpPoints });


  const matrix = cpPoints.map((cp, i) => {
    return new Array(wpCount).fill(null).map((wp, j) => {
      const s = (trackHalfWidth * 2) / (wpCount - 1);
      return cp.clone().sub(binormals[i].clone().multiplyScalar(s * (j - (Math.floor(wpCount / 2)))));
    });
  });

  console.log({ matrix });
  const path = Dijkstra(matrix);
  

  // const segmentValue = (pMinus1, p, pPlus1) => {
  //   const alpha = 0.01;
  //   const beta = 0.5;
  //   // Beta * Cos( P ) – Alpha * ( A + B );
  //   const v1 = p.clone().sub(pMinus1.clone());
  //   const v2 = pPlus1.clone().sub(p.clone());
  //   const theta = v1.angleTo(v2);
  //   // debugger;
  //   // console.log(beta * Math.cos(theta));
  //   // console.log('1::', pMinus1, p, pPlus1)
  //   //console.log('2::', (theta / (2 * Math.PI)) * 360);
  //   return beta * Math.cos(theta);


  //   // return beta * Math.cos(theta);// - alpha * (v1.length() + v2.length());
  // }


  // const nodes = [{ routeValue: 0, nextNode: 3 }, { routeValue: 0, nextNode: 3 }];

  // for (let i = cpPoints.length - 2; i >= 1; i -= 1) {
  //   let brv = 0;
  //   let bnn = 0;

  //   nodes[i] = [];
  //   // for each node on i - 1;
  //   for (let j = 0; j < wpCount; j++) { //PREV
  //     // for each node on i + 1
  //     for (let k = 0; k < wpCount; k++) { //NEXT
  //       let trv;
  //       if (nodes[i + 1] && nodes[i + 1].routeValue) {
  //         trv = segmentValue(matrix[i - 1][j], matrix[i][j], matrix[i + 1][j]) + nodes[i + 1].routeValue;
  //       } else {
  //         trv = segmentValue(matrix[i - 1][j], matrix[i][j], matrix[i + 1][j]);
  //       }
  //       if (i === cpPoints.length - 2) {
  //         console.log(i, '---', trv);

  //       }

  //       if (trv > brv) {
  //         brv = trv;
  //         bnn = j;
  //         // console.log(i, '  ', nodes[i]);

  //       }
  //     }
  //     nodes[i][j] = { routeValue: brv, nextNode: bnn };
  //   }
  // }
  // nodes.reverse()
  // console.log({ nodes });
  // line materials
  const redMat = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const pinkMat = new THREE.LineBasicMaterial({ color: 0xff5555 });
  const greenMat = new THREE.LineBasicMaterial({ color: 0x55ff55 });


  // add line objects

  const cpGeometry = new THREE.BufferGeometry().setFromPoints(cpPoints);
  const cpLineObj = new THREE.Line(cpGeometry, redMat);
  scene.add(cpLineObj);

  const s = trackHalfWidth;

  const olPointsL = cpPoints.map((cp, i) => cp.clone().sub(binormals[i].clone().multiplyScalar(s)));
  const olGeometryL = new THREE.BufferGeometry().setFromPoints(olPointsL);
  const olObjL = new THREE.Line(olGeometryL, redMat);
  scene.add(olObjL);
  const olPointsR = cpPoints.map((cp, i) => cp.clone().sub(binormals[i].clone().multiplyScalar(-s)));
  const olGeometryR = new THREE.BufferGeometry().setFromPoints(olPointsR);
  const olObjR = new THREE.Line(olGeometryR, redMat);
  scene.add(olObjR);

  const segments = cpPoints.map((cp, i) => ([
    cp.clone().sub(binormals[i].clone().multiplyScalar(s)),
    cp.clone().sub(binormals[i].clone().multiplyScalar(-s)),
  ]));
  segments.forEach((segment) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([...segment]);
    const slObj = new THREE.Line(geometry, pinkMat);
    scene.add(slObj);
  });

  const segments2 = matrix.map((cp, i) => ([
    ...cp,
  ]));
  segments2.forEach((segment) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([...segment]);
    const slObj = new THREE.Line(geometry, greenMat);
    scene.add(slObj);
  });

  // const rlPoints = nodes.map((node, i) => {
  //   if (nodes[i+1]) {
  //     return [matrix[i][node.nextNode], matrix[i + 1][nodes[i+1].nextNode]];
  //   }
  //   return [matrix[i][node.nextNode], matrix[i + 1][3]];
  // });
  // console.log({ rlPoints });

  // rlPoints.forEach((rlSeg) => {
  //   console.log({ rlSeg });
    
  //   const geometry = new THREE.BufferGeometry().setFromPoints([...rlSeg]);
  //   const rlObj = new THREE.Line(geometry, greenMat);
  //   scene.add(rlObj);
  // });
  console.log({ xxxx: path });
  
  path.forEach((rlSeg, idx) => {
    if (path[idx + 1]) {
      const point1 = rlSeg.split('-');
      const point2 = path[idx + 1].split('-');
      //console.log({ pointString });
      const p1 = matrix[point1[0]][point1[1]];
      const p2 = matrix[point2[0]][point2[1]];
      console.log({ p1 });
      const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const rlObj = new THREE.Line(geometry, greenMat);
      scene.add(rlObj);
    }
    
    
  })
 
};

/*
For each node Prev on Line 5
{
    For each node Next on Line 7
    {
        This Route Value = SegmentValue( Prev to Cur to Nex) + Next’s RVM[1].m_routeValue;

        If (This Route Value &gt; Best Route Value So Far)
        {
            Best Route Value So Far = This Route Value;
            Best Next Node So Far = Next ;
        }
    }
    Cur’s RVM [ Prev ].m_routeValue = Best Route Value So Far;
    Cur’s RVM [ Prev ].m_routeNextNode = Best Next Node So Far;
}
*/

class Graph {
  constructor() {
    this.nodes = [];
    this.adjacencyList = {};
  }

  addNode(node) {
    this.nodes.push(node);
    this.adjacencyList[node] = [];
  }

  addEdge(node1, node2, weight) {
    this.adjacencyList[node1].push({ node: node2, weight });
    //this.adjacencyList[node2].push({ node: node1, weight });
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
    console.log('after enqueue');

    while (!pq.isEmpty()) {
      const shortestStep = pq.dequeue();

      const currentNode = shortestStep[0];
      this.adjacencyList[currentNode].forEach((neighbor) => {
        const weight = totalWeights[currentNode] + neighbor.weight;
        console.log({ totalWeights });

        if (weight < totalWeights[neighbor.node]) {
          totalWeights[neighbor.node] = weight;
          backtrace[neighbor.node] = currentNode;
          pq.enqueue([neighbor.node, weight]);
        }
      });
    }
    console.log('before end');

    const path = [endNode];
    let lastStep = endNode;
    while (lastStep !== startNode) {
      path.unshift(backtrace[lastStep]);
      lastStep = backtrace[lastStep];
    }
    console.log(`Path is ${path} and totalWeight is ${totalWeights[endNode]}`);
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


const Dijkstra = (matrix) => {
  const map = new Graph();

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
          weight = matrix[i][j].distanceTo(matrix[i + 1][k]);
        } else {
          weight = 0;
        }
        map.addEdge(`${i}-${j}`, `${i + 1}-${k}`, weight);
      }
    }
  }
  console.log({ map });
  const path = map.findPathWithDijkstra('0-6', '20-0');
  console.log({ path });
  return path;
}