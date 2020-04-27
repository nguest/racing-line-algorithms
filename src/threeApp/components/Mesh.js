import * as THREE from 'three';
import { GLTFLoader } from '../loaders/GLTFLoader';
import { ExtrudeBufferGeometry } from '../helpers/ExtrudeGeometry';


export class Mesh {
  constructor({
    add,
    calculateFaces,
    calculateUVs,
    calculateVertices,
    customFunction,
    geoRotate,
    manager,
    material,
    name,
    params,
    physics = {},
    position = [0, 0, 0],
    renderOrder,
    rotation = [0, 0, 0],
    scale = [1, 1, 1],
    scene = this.scene,
    shadows = { receive: false, cast: true },
    type,
    url,
    uv2Params,
  }) {
    this.addObjectToScene = add;
    this.geoRotate = geoRotate;
    this.manager = manager;
    this.material = material;
    this.name = name;
    this.params = params;
    this.physics = physics;
    this.physicsWorld = physics.physicsWorld;
    this.position = position;
    this.renderOrder = renderOrder;
    this.rotation = rotation;
    this.scale = scale;
    this.scene = scene;
    this.shadows = shadows;
    this.type = type;
    this.customFunction = customFunction;

    if (!add) return;

    if (type === 'GLTF') {
      this.initLoader(url, manager);
    } else {
      let geometry = THREE[type] && new THREE[type](...params);
      // use custom extrude function
      if (type === 'ExtrudeGeometry' || type === 'ExtrudeBufferGeometry') {
        geometry = new ExtrudeBufferGeometry(...params);
        let uv;
        if (uv2Params) {
          uv = geometry.attributes.uv.array.map((x, i) => {
            if (i % 2 === 0) return x * uv2Params[0];
            return x * uv2Params[1];
          });
        } else {
          uv = geometry.attributes.uv.array;
        }
        geometry.setAttribute('uv2', new THREE.BufferAttribute(uv, 2));
        if (name === 'barriers') {
          // console.log({ xxx: geometry.attributes.position.count * 3 })
          // geometry.clearGroups(); // just in case

          // for (let i = 0; i < geometry.attributes.position.count * 3; i+=50) {
          //   geometry.addGroup( i, i+50, 0 ); // first 3 vertices use material 0
          //   geometry.addGroup( i+50, i+50, 1 ); // next 3 vertices use materia
          // }
          // geometry.addGroup( 0, 100, 0 ); // first 3 vertices use material 0
          // geometry.addGroup( 100, Infinity, 1 ); // next 3 vertices use material 1
          // geometry.addGroup( 200, Infinity, 0 ); // remaining vertices use material 2
          // console.log({ttt:geometry})

        }
      }

      // return [
      //   new THREE.Vector2(0, 1),
      //   new THREE.Vector2(1, 1),
      //   new THREE.Vector2(1, 0),
      //   new THREE.Vector2(0, 0),
      // ];

      if (params === 'custom') {
        if (customFunction) {
          return this.createCustom(physics.physicsWorld); /* eslint-disable-line */
        }
        // must be custom type
        if (!calculateVertices || !calculateFaces) {
          throw new Error(
            'calculateVertices and calculateFaces Functions must be defined to calculate custom geometry',
          );
        }
        const vertices = calculateVertices();
        const faces = calculateFaces();

        geometry.vertices = vertices;
        geometry.faces = faces;
        geometry.computeVertexNormals();
        geometry.computeFaceNormals();
        geometry.computeBoundingBox();
        geometry.name = name;
        const faceVertexUvs = calculateUVs(geometry);
        geometry.faceVertexUvs[0] = faceVertexUvs;

        geometry.elementsNeedUpdate = true;
        geometry.verticesNeedUpdate = true;
        geometry.uvsNeedUpdate = true;
      }

      this.orientObject(geometry);
    }
  }

  initLoader(url, manager) {
    const loader = new GLTFLoader(manager).setPath(url.path);
    loader.load(url.file, (gltf) => {
      const mesh = gltf.scene.children[0];

      mesh.position.set(...this.position);
      mesh.rotation.set(...this.rotation);
      mesh.scale.set(...this.scale);
      mesh.name = this.name;
      mesh.castShadow = this.shadows.cast;
      mesh.receiveShadow = this.shadows.receive;
      this.scene.add(mesh);
    });
  }


  orientObject(geometry, loadedMaterial) {
    if (this.geoRotate) {
      geometry.rotateX(this.geoRotate[0]);
      geometry.rotateY(this.geoRotate[1]);
      geometry.rotateZ(this.geoRotate[2]);
    }
    this.mesh = new THREE.Mesh(geometry, loadedMaterial || this.material);

    this.mesh.position.set(...this.position);
    this.mesh.rotation.set(...this.rotation);
    this.mesh.geometry.scale(...this.scale);
    this.mesh.castShadow = this.shadows.cast;
    this.mesh.receiveShadow = this.shadows.receive;
    this.mesh.renderOrder = this.renderOrder;
    this.mesh.name = this.name;
    if (this.addObjectToScene) {
      this.setInitialState();
      this.scene.add(this.mesh);
    }

    return this.mesh;
  }

  getMesh() {
    return this.mesh;
  }

  setInitialState() {
    this.mesh.position.set(...this.position);
    this.mesh.rotation.set(...this.rotation);
  }

  createCustom(physicsWorld) {
    this.mesh = this.customFunction({
      pos: new THREE.Vector3(...this.position),
      quat: new THREE.Quaternion().setFromEuler(new THREE.Euler(...this.rotation, 'XYZ')),
      physicsWorld,
      scene: this.scene,
      material: this.material,
    });
    return this;
  }
}
