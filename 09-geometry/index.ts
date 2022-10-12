import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import stats from '../common/stats'
import { listenResize, dbClkfullScreen } from '../common/utils'

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Object
const geometry = new THREE.BufferGeometry();

// 创建一个三角形
// const vertices = new Float32Array([
//   0, 0, 0,
//   1, 0, 0,
//   0, 1, 0,
// ])

// geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))

// const material = new THREE.MeshBasicMaterial({
//   color: 0x607d8b,
// })


// 随机创建多个三角形
const triangleVertices:number[] = [];
for(let i = 0; i < 300; i++){
  triangleVertices.push(Math.random() - 0.5);
}

const vertices = new Float32Array(triangleVertices);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

const material = new THREE.MeshBasicMaterial({
  color: 0x607d8b,
  wireframe: true,
})

const triangle = new THREE.Mesh(geometry, material)
scene.add(triangle)



// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect);
camera.position.set(2, 2, 2)
scene.add(camera)

// 显示原点
const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

// 相机控制器
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// 渲染器
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 屏幕自适应
dbClkfullScreen(canvas);
listenResize(sizes, camera, renderer);

const tick = () => {
  stats.begin();

  controls.update();
  renderer.render(scene, camera)

  stats.end();
  requestAnimationFrame(tick)
}

tick();