import * as THREE from 'three';
import { getSpacedPoints, computeFrenetFrames } from '../../helpers/curveHelpers';

export const createApexes = (scene, trackParams) => {
  const threshold = 0.05; // 0.12;
  const pointsCount = Math.floor(trackParams.length * 0.05);
  const { binormals, tangents } = computeFrenetFrames(trackParams.centerLine, pointsCount);
  const points = trackParams.centerLine.getSpacedPoints(pointsCount);

  const angles = tangents.map((t, i, arr) => {
    if (arr[i - 1] && arr[i + 1]) {
      return 0.5 * arr[i - 1].angleTo(arr[i + 1]);
    }
    return 0;
  });

  const apexes = angles.reduce((agg, theta, i) => {
    if (
      angles[i - 1]
      && angles[i + 1]
      && (theta > threshold)
      && angles[i - 1] < theta
      && angles[i + 1] < theta
    ) {
      const signedArea = signedTriangleArea(points[i - 1], points[i], points[i + 1]);
      const dir = Math.sign(signedArea);

      return [
        ...agg,
        { i, p: points[i], dir, binormal: binormals[i] },
      ];
    }
    return agg;
  }, []);
  console.log({ apexes });

  apexes.forEach((apex, i) => {
    const geometry = new THREE.SphereBufferGeometry(2, 10, 5);
    const material = new THREE.MeshPhongMaterial({ color: 0xff8822, wireframe: true })
    const sphere = new THREE.Mesh(geometry, material);
    const apexMarkerPosn = apex.p.sub(apex.binormal.clone().multiplyScalar(trackParams.trackHalfWidth * apex.dir));
    sphere.position.set(apexMarkerPosn.x, apexMarkerPosn.y + 1, apexMarkerPosn.z);
    scene.add(sphere);
  });
  
  return apexes;
};

export const createApexMarkers = (scene, trackParams) => {
  console.log({ trackParams });
  
  const apexes = trackParams.apexes;
  const map = new THREE.TextureLoader().load('./assets/textures/location_map.png');
  const material = new THREE.SpriteMaterial({ map });
  //console.log({ apexes });
  
  apexes.forEach((apex, i) => {
    const sprite = new THREE.Sprite(material);
    const apexMarkerPosn = apex.p.sub(apex.binormal.clone().multiplyScalar(trackParams.trackHalfWidth * apex.dir));
    sprite.position.set(apexMarkerPosn.x, apexMarkerPosn.y + 1, apexMarkerPosn.z);

    scene.add(sprite);
  });
}

export const signedTriangleArea = (a, b, c) => (
  a.x * b.z - a.z * b.x + a.z * c.x - a.x * c.z + b.x * c.z - c.x * b.z
);