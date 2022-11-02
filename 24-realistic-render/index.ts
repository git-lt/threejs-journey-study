import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import stats from '../common/stats'
import * as dat from 'lil-gui'
import { listenResize } from '../common/utils'

// Gui
const gui = new dat.GUI()

const debugGui = {
  envMapIntensity: 1.5,
}

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Lights
// 环境光：无阴影，整体亮度
const ambientLight = new THREE.AmbientLight('#b9d5ff', .3);
scene.add(ambientLight);

// 平行光：可投射阴影 (用于模拟太阳光, 来自无穷远，照射无穷远)
const directionalLight = new THREE.DirectionalLight('#ffffff', 2.8);
directionalLight.position.set(.25, 3, -2.25)
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.left = -10
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper)

// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect, .1, 100);
camera.position.set(8, 2, -4)
scene.add(camera)

// 渲染器
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837')
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.5;

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true;
controls.zoomSpeed = .3;
controls.autoRotate = true;
controls.target = new THREE.Vector3(0, 3, 0)

// 屏幕自适应
listenResize(sizes, camera, renderer);

// 平面
// const plane = new THREE.Mesh(
//   new THREE.PlaneGeometry(15, 15),
//   new THREE.MeshStandardMaterial({ color: '#607d88' })
// )
// plane.rotateX(-Math.PI / 2)
// plane.receiveShadow = true;
// scene.add(plane);

/**
 * Loaders
 */
const gltfLoader = new GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader();
const dracoLoader = new DRACOLoader();

/**
 * 环境贴图
 */
const environmentMap = cubeTextureLoader.load([
  '/public/assets/textures/environmentMaps/3/px.jpg',
  '/public/assets/textures/environmentMaps/3/nx.jpg',
  '/public/assets/textures/environmentMaps/3/py.jpg',
  '/public/assets/textures/environmentMaps/3/ny.jpg',
  '/public/assets/textures/environmentMaps/3/pz.jpg',
  '/public/assets/textures/environmentMaps/3/nz.jpg',
])
environmentMap.encoding = THREE.sRGBEncoding;
scene.background = environmentMap;

/**
 * Models
 */
// dracoLoader.setDecoderPath('/public/assets/draco/');
// dracoLoader.preload();
// gltfLoader.setDRACOLoader(dracoLoader);
// gltfLoader.load('/public/assets/myModels/hamburger.glb', gltf => {
//   console.log(gltf);
//   gltf.scene.scale.set(.4, .4, .4);
//   scene.add(gltf.scene);
// })

const updateAllMaterials = () => {
  scene.traverse(child => {
    if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial){
      child.material.envMap = environmentMap;
      child.material.envMapIntensity = debugGui.envMapIntensity;
      child.castShadow = true;
      child.receiveShadow = true;
    }
  })
}

gltfLoader.load('/public/assets/models/FlightHelmet/glTF/FlightHelmet.gltf', gltf => {
  gltf.scene.scale.set(8, 8, 8);
  gltf.scene.position.set(0, -3.4, 0)
  gltf.scene.rotation.set(0, Math.PI * .5, 0)
  scene.add(gltf.scene);

  updateAllMaterials();
})


/**
 * TICK
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime  - previousTime;
  previousTime = elapsedTime;

  
  controls.update();
  renderer.render(scene, camera)
  stats.end();
  requestAnimationFrame(tick)
}

tick();

gui.add(controls, 'autoRotate')
gui.add(debugGui, 'envMapIntensity', 0, 10, .001).onChange(updateAllMaterials);
gui.add(directionalLight, 'intensity', 0, 10, .001).name('光照强度');
gui.add(directionalLight.position, 'x', -5, 5, .001).name('灯光X位置')
gui.add(directionalLight.position, 'y', -5, 5, .001).name('灯光Y位置')
gui.add(directionalLight.position, 'z', -5, 5, .001).name('灯光Z位置')
gui.add(renderer, 'toneMapping', {
  No:THREE.NoToneMapping,
  Linear: THREE.LinearToneMapping,
  Reinhard: THREE.ReinhardToneMapping,
  Cineon: THREE.CineonToneMapping,
  ACESFilmic: THREE.ACESFilmicToneMapping,
})
gui.add(renderer, 'toneMappingExposure', 0, 10, .001)

