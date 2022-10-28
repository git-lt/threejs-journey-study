import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import stats from '../common/stats'
import * as dat from 'lil-gui'
import * as CANNON from 'cannon-es'
import CannonDebugger from 'cannon-es-debugger';
import { listenResize } from '../common/utils'

// Gui
const gui = new dat.GUI()
const guiObj = {
  CannonDebugger: false,
  createSphere() {},
  createBox() {},
  reset() {},
}
let cannonDebuggerVisible = false

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
camera.position.set(2, 4, 16)
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

/**
 * Objects
 */
const material = new THREE.MeshStandardMaterial();

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15),
  new THREE.MeshStandardMaterial({ color: '#607D8B'})
)
plane.rotateX(-Math.PI / 2)
plane.receiveShadow = true;
scene.add(plane);

// 音效
const hitSound = new Audio('/public/assets/sounds/hit.mp3');
const playHitSound = (collision: { contact: CANNON.ContactEquation }) => {
  const impactStrength = collision.contact.getImpactVelocityAlongNormal();
  // 撞击强度大于1.5时，播放音效
  if(impactStrength > 1.5){
    // 随机音量
    hitSound.volume = Math.random();
    hitSound.currentTime = 0;
    hitSound.play();
  }
}

// 所有随机生成物体的集合
const objectsToUpdate: Array<{
  mesh: THREE.Mesh,
  body: CANNON.Body
}> = [];

// 球体
const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
// 创建球体
const createSphere = (radius: number, position: THREE.Vector3) => {
  const mesh = new THREE.Mesh(sphereGeometry, material);
  mesh.castShadow = true;
  mesh.scale.set(radius, radius, radius);
  mesh.position.copy(position);
  scene.add(mesh);

  const shape = new CANNON.Sphere(radius);
  const body = new CANNON.Body({
    mass: 1,
    shape,
    material: defaultMaterial,
  })
  // @ts-ignore
  body.position.copy(position);
  world.addBody(body);
  objectsToUpdate.push({ mesh, body});
  
  // 撞击里播放音频
  body.addEventListener('collide', playHitSound);
}

guiObj.createSphere = () => {
  // 在5的高度，随机创建随机大小的球体
  createSphere(
    Math.random(),
    new THREE.Vector3((Math.random() - .5) * 8, 5, (Math.random() -.5) * 8)
  )
}

const boxGeometry = new THREE.BoxGeometry();
const createBox = (width: number, height: number, depth: number, position: THREE.Vector3) => {
  const mesh = new THREE.Mesh(boxGeometry, material);
  mesh.castShadow = true;
  mesh.scale.set(width, height, depth)
  mesh.position.copy(position)
  scene.add(mesh)

  const shape = new CANNON.Box(new CANNON.Vec3(width*.5, height*.5, depth*.5));
  const body = new CANNON.Body({
    mass:1,
    shape,
    material: defaultMaterial
  })
  
  // @ts-ignore
  body.position.copy(position)
  world.addBody(body)
  objectsToUpdate.push({ mesh, body })
  body.addEventListener('collide', playHitSound);
}
guiObj.createBox = () => {
  createBox(
    Math.random(),
    Math.random(),
    Math.random(),
    new THREE.Vector3((Math.random() - .5) * 8, 5, (Math.random() - .5) * 8)
  )
}

// 从物理世界和场景中删除所有物体
guiObj.reset = () => {
  objectsToUpdate.forEach(obj => {
    obj.body.removeEventListener('collide', playHitSound)
    world.removeBody(obj.body);
    scene.remove(obj.mesh);
  })
  // 清空
  objectsToUpdate.splice(0, objectsToUpdate.length);
}


/**
 * Physics
 */
const world = new CANNON.World();
// 设置重力
world.gravity.set(0, -9.82, 0)
// 使用更快的 剪枝算法 来检测碰撞
world.broadphase = new CANNON.SAPBroadphase(world);
// 当物体运动极慢里，不参与碰撞检测
world.allowSleep = true;

const defaultMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(
  defaultMaterial,
  defaultMaterial,
  {
    // 摩擦力
    friction: .3,
    // 弹力
    restitution: .6,
  }
)
world.addContactMaterial(defaultContactMaterial);

// 地面
const floorShape = new CANNON.Plane();
const floorBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: floorShape,
  material: defaultMaterial,
})
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(floorBody);


const cannonDebugger = CannonDebugger(scene, world, {
  onInit(body, mesh){
    console.log('cannonDebuggerVisible')
    console.log(cannonDebuggerVisible)
    mesh.visible = cannonDebuggerVisible;
  }
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
  world.fixedStep();
  cannonDebugger.update();
  
  objectsToUpdate.forEach(obj => {
    // @ts-ignore
    obj.mesh.position.copy(obj.body.position);
    // @ts-ignore
    obj.mesh.quaternion.copy(obj.body.quaternion);
  })

  
  controls.update();
  renderer.render(scene, camera)
  stats.end();
  requestAnimationFrame(tick)
}

tick();

gui.add(guiObj, 'reset')
gui.add(controls, 'autoRotate')
gui.add(material, 'wireframe')
gui.add(guiObj, 'createSphere')
gui.add(guiObj, 'createBox')
gui.add(guiObj, 'CannonDebugger').onChange((v: boolean) => {
  cannonDebuggerVisible = v;
  // cannonDebugger.update();
})
