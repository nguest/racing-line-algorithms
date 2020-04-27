export const materialsIndex = [
  {
    name: 'green',
    type: 'MeshLambertMaterial',
    color: 0x3f451c,
    side: 'FrontSide',
    wireframe: false,
  },
  {
    name: 'mappedFlat',
    type: 'MeshPhongMaterial',
    color: 0xffffff,
    map: {
      name: 'UVGrid',
      repeat: [1, 1],
    },
    side: 'DoubleSide',
    wireframe: false,
    emissive: 0x000022,
    shininess: 100,
  },
  {
    name: 'wireFrame',
    type: 'MeshPhongMaterial',
    color: 0xff0000,
    side: 'FrontSide',
    wireframe: true,
    wireframeLinewidth: 5,
    emissive: 0x000000,
  },
];
