import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import stats from '../common/stats'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger';
import { listenResize } from '../common/utils'

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Objects
const material = new THREE.MeshStandardMaterial();

// 从 THREEJS 生成一个球体和平面
const sphere = new THREE.Mesh(
  new THREE.SphereGeometry(1, 16, 16),
  material,
)
sphere.position.setY(1);
sphere.castShadow = true;
scene.add(sphere);

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15),
  material,
)
plane.rotateX(-Math.PI/2),
plane.receiveShadow = true;
scene.add(plane);

// Physices
// 创建物理世界，并设置重力
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const defaultMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    friction: .8,
    restitution: .7
  }
)
world.addContactMaterial(defaultContactMaterial);

// 从 CANNON 生成一个球体和平面
const sphereShape = new CANNON.Sphere(1);
const sphereBody = new CANNON.Body({
  mass: 1,
  position: new CANNON.Vec3(0, 4, 0),
  shape: sphereShape,
  material: defaultMaterial
})
world.addBody(sphereBody);

const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: floorShape,
  material: defaultMaterial
});
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(floorBody);

// Lights
// 环境光：无阴影，整体亮度
const ambientLight = new THREE.AmbientLight('#b9d5ff', .3);
scene.add(ambientLight);

// 平行光：可投射阴影 (用于模拟太阳光, 来自无穷远，照射无穷远)
const directionalLight = new THREE.DirectionalLight('#ffffff', .8);
directionalLight.position.set(5, 5, 6)
directionalLight.castShadow = true;
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper)

// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect, .1, 100);
camera.position.set(2, 4, 16)
scene.add(camera)

const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup)

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

// 屏幕自适应
listenResize(sizes, camera, renderer);


const gui = new dat.GUI();

const cannonMeshes: THREE.Mesh[] = [];

const guiConfig = {
  drop(){
    sphereBody.position = new CANNON.Vec3(0, 4, 0)
  },
  CannonDebugger: false,
}

const cannonDebugger = CannonDebugger(scene, world, {
  onInit(body, mesh) {
    mesh.visible = false;
    cannonMeshes.push(mesh);
  }
})

gui.add(guiConfig, 'CannonDebugger').onChange(value => {
  cannonMeshes.forEach(item => {
    item.visible = value;
  })
})


const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime  - previousTime;
  previousTime = elapsedTime;
  world.fixedStep();

  // 位置和旋转从 物理引擎生成对象中 复制到 threejs 的对象上
  // @ts-ignore
  sphere.position.copy(sphereBody.position);
  // @ts-ignore
  sphere.quaternion.copy(sphereBody.quaternion);

  cannonDebugger.update();
  controls.update();
  renderer.render(scene, camera)
  stats.end();
  requestAnimationFrame(tick)
}

tick();

