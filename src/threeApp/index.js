// Global imports
import * as THREE from 'three';
import React, { PureComponent } from 'react';
import { func } from 'prop-types';

// Config
import { Config } from './sceneConfig/general';

// Components
import { Renderer } from './components/Renderer';
import { Camera } from './components/Camera';
import { Light } from './components/Light';
import { Controls } from './components/Controls';
import { Mesh } from './components/Mesh';

// Helpers
import { promisifyLoader } from './helpers/helpers';
import { createSkyBoxFrom4x3 } from './helpers/skyBoxHelper';

// Assets & Materials
import { createMaterial } from './materials';
import { assetsIndex } from './sceneConfig/assets';
import { materialsIndex } from './sceneConfig/materials';

// Lights
import { lightsIndex } from './sceneConfig/lights';

// Objects
import { objectsIndex } from './sceneConfig/objects';
import { computeTrackParams } from './custom/geometries/trackParams';
import { racingLine } from './custom/geometries/racingLine';
import { createApexes } from './custom/geometries/apex';

// Managers
import { Interaction } from './managers/Interaction';
import { DatGUI } from './managers/DatGUI';

// Stats
import { Stats } from './helpers/statsModule';

// -- End of imports

export class Main extends PureComponent {
  componentDidMount() {
    this.initialize();
  }

  initialize() {
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(Config.fog.color, Config.fog.near);

    this.renderer = new Renderer(this.scene, this.container);
    this.camera = new Camera(this.renderer.threeRenderer, this.container);
    this.controls = new Controls(this.camera.threeCamera, this.renderer, this.container);
    this.interaction = new Interaction(this.renderer, this.scene, this.camera, this.controls);
    this.clock = new THREE.Clock();
    this.frameCount = 0;
    this.lights = this.createLights();
    this.manager = new THREE.LoadingManager();
    this.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      this.showStatus(`Loading file: ${itemsLoaded} of ${itemsTotal} files.`);
    };
    this.trackParams = computeTrackParams()

    if (Config.showStats) {
      this.stats = new Stats();
      this.container.appendChild(this.stats.dom);
    }
    if (Config.isDev) {
      const axesHelper = new THREE.AxesHelper(150);
      this.scene.add(axesHelper);
    }

    const texturesAndFiles = this.loadAssets();
    this.createMaterials(texturesAndFiles);
    this.appInitialized = true;
  }

  loadAssets() {
    const imageLoader = new THREE.ImageLoader(this.manager);
    imageLoader.options = { preMultiplyAlpha: 'preMultiplyAlpha' };
    const ImagePromiseLoader = promisifyLoader(imageLoader);
    const imagePromises = Object.values(assetsIndex.images).map((file) => {
      return ImagePromiseLoader.load(file.path);
    });

    const TexturePromiseLoader = promisifyLoader(new THREE.TextureLoader(this.manager));
    const texturesPromises = Object.values(assetsIndex.textures).map((texture) => {
      return TexturePromiseLoader.load(texture.path);
    });
    this.texturesAndFiles = { imagePromises, texturesPromises };

    this.manager.onError = (url) => {
      console.log(`There was an error loading ${url}`);
    };
    this.manager.onLoad = () => {
      this.showStatus('ALL OBJECTS LOADED');
      this.props.setIsLoading(false);
      if (Config.isDev) this.gui = new DatGUI(this);
      this.animate();
    };
    return this.texturesAndFiles;
  }

  createLights() {
    return lightsIndex.map((light) => new Light(light, this.scene));
  }

  createMaterials(filesAndTextures) {
    const { imagePromises, texturesPromises } = filesAndTextures;
    Promise.all([...imagePromises, ...texturesPromises])
      .then((r) => {
        const assets = r.reduce((agg, asset, idx) => {
          const fileNames = [
            ...Object.keys(assetsIndex.images),
            ...Object.keys(assetsIndex.textures),
          ];
          return {
            ...agg,
            [fileNames[idx]]: asset,
          };
        }, {});

        const materials = materialsIndex.reduce((agg, materialParams) => ({
          ...agg,
          [materialParams.name]: createMaterial(materialParams, assets),
        }), {});

        return this.createWorld(materials, assets);
      }).catch((err) => {
        console.error('ERROR loading image', err);
      });
  }

  createObjects = (materials) => {
    this.objects = objectsIndex(this.trackParams).map((obj) => {
      const params = {
        ...obj,
        type: obj.type,
        params: obj.params,
        position: obj.position,
        rotation: obj.rotation,
        material: Array.isArray(obj.material)
          ? obj.material.map((m) => materials[m])
          : materials[obj.material],
        scene: this.scene,
        shadows: obj.shadows,
        manager: this.manager,
      };

      return new Mesh(params).getMesh();
    });

    this.instancedMeshes = this.scene.children.filter((o) => o.userData.type === 'instancedMesh');

    const helper = new THREE.GridHelper(10, 2, 0xffffff, 0xffffff);
    this.scene.add(helper);
  }

  createWorld(materials, assets) {
    this.createObjects(materials);

    racingLine(this.scene, this.camera, this.trackParams);
    createApexes(this.scene, this.trackParams);

    // calculate global envmap and skybox
    createSkyBoxFrom4x3({
      scene: this.scene,
      boxDimension: 8000,
      image: assets.Skybox,
      tileSize: 256,
      manager: this.manager,
    });
  }

  animate() {
    if (this.frameCount >= 10) this.frameCount = 0;
    this.frameCount++;

    if (Config.showStats) this.stats.update();

    this.renderer.render(this.scene, this.camera.threeCamera);

    this.interaction.keyboard.update();
    if (!Config.useFollowCam) this.controls.update();

    requestAnimationFrame(this.animate.bind(this)); // Bind the main class instead of window object
  }

  showStatus = (message) => {
    this.props.setStatus(message);
  }

  render() {
    return <section ref={(ref) => { this.container = ref; }} style={{ width: '100%' }} />;
  }
}

Main.propTypes = {
  setIsLoading: func,
  setStatus: func,
};
