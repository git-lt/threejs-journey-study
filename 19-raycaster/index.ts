import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import stats from '../common/stats'
import * as dat from 'lil-gui'
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
const obj1 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshBasicMaterial({ color: '#B71c1c'})
)
const obj2 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshBasicMaterial({ color: '#B71c1c'})
)
const obj3 = new THREE.Mesh(
  new THREE.SphereGeometry(1, 32, 32),
  new THREE.MeshBasicMaterial({ color: '#B71c1c'})
)
obj1.position.setX(-4);
obj3.position.setX(4);
scene.add(obj1, obj2, obj3);


// Raycaster
const raycaster = new THREE.Raycaster();
const rayOrigin = new THREE.Vector3(-6, 0, 0);
const rayDirection = new THREE.Vector3(1, 0, 0).normalize();
raycaster.set(rayOrigin, rayDirection);

const rayHelper = new THREE.ArrowHelper(
  raycaster.ray.direction,
  raycaster.ray.origin,
  15,
  0x00ff00,
  1,
  .5
)
scene.add(rayHelper)

const intersect = raycaster.intersectObject(obj1);
const intersects = raycaster.intersectObjects([obj1, obj2, obj3]);
console.log(intersect)
console.log(intersects)


// Lights
// 环境光：无阴影，整体亮度
const ambientLight = new THREE.AmbientLight('#b9d5ff', .12);
scene.add(ambientLight);

// 平行光：可投射阴影 (用于模拟太阳光, 来自无穷远，照射无穷远)
const directionalLight = new THREE.DirectionalLight('#b9d5ff', .12);
directionalLight.position.set(1, .75, 0)
scene.add(directionalLight);

// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect, .1, 100);
camera.position.set(1, 2, 10)
scene.add(camera)

// 相机控制器
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed=.2;


// 渲染器
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837')


// 屏幕自适应
listenResize(sizes, camera, renderer);

const clock = new THREE.Clock();
const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();

  obj1.position.setY(Math.sin(elapsedTime * 2) * 2);
  obj2.position.setY(Math.sin(elapsedTime * 1.5) * 2);
  obj3.position.setY(Math.sin(elapsedTime * 3) * 2);


  const objs = [obj1, obj2, obj3];
  const intersects = raycaster.intersectObjects(objs)

  // 颜色还原
  objs.forEach((item) => {
    item.material.color.set('#B71C1C')
  })

  // 相交的物体变色
  intersects.forEach((item) => {
    item.object.material.color.set('#F9A825')
  })

  controls.update();
  renderer.render(scene, camera)

  stats.end();
  requestAnimationFrame(tick)
}

tick();

const gui = new dat.GUI();

gui.add(controls, 'autoRotate')
gui.add(controls, 'autoRotateSpeed', .1, 10, .01)