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

/**
 * Galaxy
 */
const parameters = {
  count: 10000,
  size: .02,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: .2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#1b3984',
}

let geometry: THREE.BufferGeometry;
let material: THREE.PointsMaterial;
let points: THREE.Points<THREE.BufferGeometry, THREE.PointsMaterial>;

const generatorGalaxy = () => {
  if(points){
    geometry.dispose();
    material.dispose();
    scene.remove(points)
  }

  const colorInside = new THREE.Color(parameters.insideColor)
  const colorOutside = new THREE.Color(parameters.outsideColor)

  // Geometry
  geometry = new THREE.BufferGeometry();

  const position = new Float32Array(parameters.count * 3)
  const colors = new Float32Array(parameters.count * 3);
  
  for(let i = 0; i< parameters.count * 3; i++){
    const i3 = i * 3;
    // position[i3] = (Math.random() - .5) * 3
    // position[i3 + 1] = (Math.random() - .5) * 3
    // position[i3 + 2] = (Math.random() - .5) * 3

    // 生成在x轴上
    // const radius = Math.random() * parameters.radius;
    // position[i3] = radius
    // position[i3 + 1] = 0
    // position[i3 + 2] = 0

    // 生成在多个分支上
    const radius = Math.random() * parameters.radius;
    const branchesAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;
    // 偏转角度
    const spinAngle = radius * parameters.spin;
    // 随机扩散
    
    const randomX =Math.random() ** parameters.randomnessPower
      * (Math.random() < 0.5 ? 1 : -1)
      * parameters.randomness
      * radius
    const randomY =Math.random() ** parameters.randomnessPower
      * (Math.random() < 0.5 ? 1 : -1)
      * parameters.randomness
      * radius
    const randomZ =Math.random() ** parameters.randomnessPower
      * (Math.random() < 0.5 ? 1 : -1)
      * parameters.randomness
      * radius

    position[i3] = Math.cos(branchesAngle + spinAngle) * radius + randomX;
    position[i3 + 1] = 0 + randomY
    position[i3 + 2] = Math.sin(branchesAngle + spinAngle) * radius + randomZ

    // 设置每个顶点的颜色
    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parameters.radius);
    colors[i3] = mixedColor.r;
    colors[i3+1] = mixedColor.g;
    colors[i3+2] = mixedColor.b;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(position, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  // Material
  material = new THREE.PointsMaterial({
    size: parameters.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })

  points = new THREE.Points(geometry, material);
  scene.add(points);
}

generatorGalaxy();


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
camera.position.set(1, 1.8, 2)
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

  controls.update();
  renderer.render(scene, camera)

  stats.end();
  requestAnimationFrame(tick)
}

tick();

const gui = new dat.GUI();

gui.add(controls, 'autoRotate')
gui.add(controls, 'autoRotateSpeed', .1, 10, .01)