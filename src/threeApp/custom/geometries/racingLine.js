import * as THREE from 'three';
import { getSpacedPoints, computeFrenetFrames } from '../../helpers/curveHelpers';
import coordinates from '../geometries/CastleCombe';
import { converLatLngToVector } from '../../helpers/latlngConverter';
import { dijkstraMethod } from './dijkstraMethod';
import { splineMethod } from './splineMethod';
// import createApexes from './track'; 
// import { createInstancedMesh } from '../../helpers/InstancedBufferGeometry';
// import { InstancesStandardMaterial, InstancesDepthMaterial } from '../materials/InstancesStandardMaterials';
// import { MeshSurfaceSampler } from '../../helpers/MeshSurfaceSampler';

export const racingLineCrossSection = () => (new THREE.Shape([
  new THREE.Vector2(-0, 1),
  new THREE.Vector2(-0, -1),
]));

const mat = {
  red: new THREE.LineBasicMaterial({ color: 0xff0000 }),
  pink: new THREE.LineBasicMaterial({ color: 0xff5555 }),
  green: new THREE.LineBasicMaterial({ color: 0x55ff55 }),
  yellow: new THREE.LineBasicMaterial({ color: 0xffff77 }),
};

const getAverageAngle = (i, angles, spread = 20) => {
  angles[i] + angles[i + 1]

  return new Array(spread).fill(0).reduce((a, c, idx) => {
    let arrI = i + idx - spread;
    if (arrI < 0) arrI += angles.length;
    if (arrI > angles.length) arrI -= angles.length;
    return a + angles[arrI] / spread;
  }, 0);
};

export const racingLine = (scene, camera, trackParams) => {
  const b = converLatLngToVector(coordinates);
  const centerLine = trackParams.centerLine;

  const wpCount = 7; // width section pointscount
  const cpCount = 300; // segments in track direction
  const trackHalfWidth = 5;
  const steps = 10; // trackParams.steps;
  const { binormals, tangents } = computeFrenetFrames(centerLine, cpCount);
  const cpPoints = getSpacedPoints(centerLine, cpCount);



  // const test = [
  //   new THREE.Vector3(0, 0, 10),
  //   // new THREE.Vector3(0,0,0),
  //   new THREE.Vector3(10, 0, -10),
  //   new THREE.Vector3(-10, 0, -30),
  //   new THREE.Vector3(-10, 0, -50),

  //   new THREE.Vector3(0, 0, -70),
  //   // new THREE.Vector3(0, 0, -40),
  //   new THREE.Vector3(10, 0, -80),

  // ];
  // const centerLine = new THREE.CatmullRomCurve3(test);
  // const cpPoints = getSpacedPoints(centerLine, 50);
  // const { binormals, tangents } = computeFrenetFrames(centerLine, 50);

  const matrix = cpPoints.map((cp, i) => {
    return new Array(wpCount).fill(null).map((wp, j) => {
      const s = (trackHalfWidth * 2) / (wpCount - 1);
      return cp.clone().sub(binormals[i].clone().multiplyScalar(s * (j - (Math.floor(wpCount / 2)))));
    });
  });

  console.log({ matrix });
  const t0 = performance.now();
  const nodes = dijkstraMethod(matrix, binormals, 0, cpCount - 1);
  const t1 = performance.now();
  console.info(`Dijkstra took ${t1 - t0} ms with ${wpCount * cpCount} points`);


  //recursePath(matrix, cpCount, wpCount);
  const t2 = performance.now();
  const { racingLineSpline, edgeTouches } = splineMethod(cpPoints, binormals, tangents, trackParams.trackHalfWidth);
  const t3 = performance.now();
  console.info(`SplineMethod took ${t3 - t2} ms with ${cpCount} nodes`);

  // line materials

  // add line objects

  // render centerline
  const cpGeometry = new THREE.BufferGeometry().setFromPoints(cpPoints);
  const cpLineObj = new THREE.Line(cpGeometry, mat.red);

  cpGeometry.computeBoundingSphere();
  const c = cpLineObj.geometry.boundingSphere;
  camera.threeCamera.position.set(c.center.x, 1000, c.center.z);
  camera.threeCamera.lookAt(c.center.x, 0, c.center.z);

  scene.add(cpLineObj);

  // render track edges
  const s = trackHalfWidth;

  const olPointsL = cpPoints.map((cp, i) => cp.clone().sub(binormals[i].clone().multiplyScalar(s)));
  const olGeometryL = new THREE.BufferGeometry().setFromPoints(olPointsL);
  const olObjL = new THREE.Line(olGeometryL, mat.red);
  scene.add(olObjL);
  const olPointsR = cpPoints.map((cp, i) => cp.clone().sub(binormals[i].clone().multiplyScalar(-s)));
  const olGeometryR = new THREE.BufferGeometry().setFromPoints(olPointsR);
  const olObjR = new THREE.Line(olGeometryR, mat.red);
  scene.add(olObjR);

  const segments = cpPoints.map((cp, i) => ([
    cp.clone().sub(binormals[i].clone().multiplyScalar(s)),
    cp.clone().sub(binormals[i].clone().multiplyScalar(-s)),
  ]));
  segments.forEach((segment) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([...segment]);
    const slObj = new THREE.Line(geometry, mat.pink);
    scene.add(slObj);
  });

  const segments2 = matrix.map((cp) => ([
    ...cp,
  ]));
  segments2.forEach((segment) => {
    const geometry = new THREE.BufferGeometry().setFromPoints([...segment]);
    const slObj = new THREE.Line(geometry, mat.green);
    scene.add(slObj);
  });

  // render Dijkstra path
  nodes.forEach((node, idx) => {
    if (nodes[idx + 1]) {
      // const point1 = rlSeg.split('-');
      // const point2 = path[idx + 1].split('-');
      const p1 = matrix[node[0]][node[1]];
      const p2 = matrix[nodes[idx + 1][0]][nodes[idx + 1][1]];
      const geometry = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const rlObj = new THREE.Line(geometry, mat.green);
      scene.add(rlObj);
    }
  });

  // render spline path
  const splinePoints = racingLineSpline.reduce((out, p, i) => (
    [...out, racingLineSpline[(i + 1) % racingLineSpline.length]]
  ), []);
  const geometry = new THREE.BufferGeometry().setFromPoints(splinePoints);
  const splineObj = new THREE.Line(geometry, mat.yellow);
  scene.add(splineObj);
};
