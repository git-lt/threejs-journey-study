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

const material = new THREE.MeshStandardMaterial()
material.metalness = 0;
material.roughness = .4;

const pointMaterial = new THREE.PointsMaterial({
  // 粒子大小
  size: .02,
  // 是否随景深衰减
  sizeAttenuation: true,
})

const shpereGeometry = new THREE.SphereGeometry(1, 32, 32);
const particles = new THREE.Points(shpereGeometry, pointMaterial);
scene.add(particles)

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
camera.position.set(4, 2, 4)
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

  pointMaterial.needsUpdate = true;
  controls.update();
  renderer.render(scene, camera)

  stats.end();
  requestAnimationFrame(tick)
}

tick();

const gui = new dat.GUI();

gui.add(controls, 'autoRotate')
gui.add(controls, 'autoRotateSpeed', .1, 10, .01)
gui.add(pointMaterial, 'size', .01, .1, .001)
gui.add(pointMaterial, 'sizeAttenuation')
