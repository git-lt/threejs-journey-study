import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'
import stats from '../common/stats'
import * as dat from 'lil-gui'
import { listenResize } from '../common/utils'

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Texture
const textureLoader = new THREE.TextureLoader();
const backedShadow = textureLoader.load('/public/assets/textures/bakedShadow.jpg')

const material = new THREE.MeshStandardMaterial();
material.metalness = 0;
material.roughness = .5;

// Objects
const shpere = new THREE.Mesh(
  new THREE.SphereGeometry(.5, 32, 32),
  material,
)
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 6),
  // 阴影烘焙成纹理贴图，贴到地面上
  // 缺点：不能跟随物体移动，是静止的，不受灯光影响
  new THREE.MeshBasicMaterial({
    map: backedShadow,
  })
)

plane.rotation.set(-Math.PI /2, 0, 0)
plane.position.set(0, -.5, 0)

scene.add(shpere,  plane)

// Lights

// 环境光：无阴影，整体亮度
const ambientLight = new THREE.AmbientLight('#fff', .5);
scene.add(ambientLight);

// 平行光：可投射阴影 (用于模拟太阳光, 来自无穷远，照射无穷远)
const directionalLight = new THREE.DirectionalLight('#ffa', .5);
directionalLight.position.set(1, .75, 1)
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper);

// 灯光上开启 发射投影
directionalLight.castShadow = true;


// 透视相机
const camera = new THREE.PerspectiveCamera(60, aspect, 1, 100);
camera.position.set(2, 2, 2)
scene.add(camera)

// 相机控制器
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// 渲染器
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 屏幕自适应
listenResize(sizes, camera, renderer);

const tick = () => {
  stats.begin();

  controls.update();
  renderer.render(scene, camera)

  stats.end();
  requestAnimationFrame(tick)
}

tick();


const gui = new dat.GUI();
const meshFolder = gui.addFolder('几何体');
meshFolder.add(material, 'metalness', 0, 1, .001).name('金属度')
meshFolder.add(material, 'roughness', 0, 1, .001).name('粗糙度')
meshFolder.add(material, 'wireframe').name('线框模式')

const ambientLightFolder = gui.addFolder('环境光');
ambientLightFolder.add(ambientLight, 'visible').name('显示').listen();
ambientLightFolder.add(ambientLight, 'intensity', 0, 1, .0001).name('强度');

const directionalLightFoler = gui.addFolder('平行光');
directionalLightFoler.add(directionalLight, 'visible').name('显示').onChange((visible: boolean) => {
  directionalLight.visible = visible;
  directionalLightHelper.visible = visible;
})
directionalLightFoler.add(directionalLight, 'intensity', 0, 1, .0001).name('强度');