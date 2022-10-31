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
const directionalLight = new THREE.DirectionalLight('#ffffff', .8);
directionalLight.position.set(5, 5, 6)
directionalLight.castShadow = true;
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
camera.position.set(4, 4, 16)
scene.add(camera)

// 渲染器
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837')
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true;
controls.zoomSpeed = .3;
controls.autoRotate = true;
controls.target = new THREE.Vector3(0, 3, 0)

// 屏幕自适应
listenResize(sizes, camera, renderer);

// 平面
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15),
  new THREE.MeshStandardMaterial({ color: '#607d88' })
)
plane.rotateX(-Math.PI / 2)
plane.receiveShadow = true;
scene.add(plane);

const gltfLoader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/public/assets/draco/');
dracoLoader.preload();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(
  // glTF
  // '/public/assets/models/Duck/glTF/Duck.gltf',
  // glTF-Binary
  // '/public/assets/models/Duck/glTF-Binary/Duck.glb',
  // glTF-Draco
  '/public/assets/models/Duck/glTF-Draco/Duck.gltf',
  // '/public/assets/models/FlightHelmet/glTF/FlightHelmet.gltf',
  (gltf) => {
    console.log('loaded-success', gltf)
    // gltf.scene.scale.set(10, 10, 10);
    // scene.add(gltf.scene);

    const duck = gltf.scene.children[0];
    duck.children[1].castShadow = true;
    duck.position.set(0, -.1, 0)
    scene.add(duck);
  },
  progress => {
    console.log('progress', progress)
  },
  error => {
    console.log('error', error)
  }
)

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
