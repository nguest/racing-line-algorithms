import * as THREE from 'three';

export const objectsIndex = () => ([
  {
    name: 'groundPlane',
    type: 'PlaneBufferGeometry',
    params: [1, 1, 1, 1],
    position: [0, -0.1, 0],
    rotation: [-Math.PI * 0.5, 0, 0],
    material: 'green',
    shadows: {
      receive: false,
      cast: false,
    },
    add: true,
  },
]);
