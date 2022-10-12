import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// 场景
const scene = new THREE.Scene();

// 几何体
const mesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0x82AAFF })
  );
scene.add(mesh);

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


// 窗口变化时
window.addEventListener('resize', () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // 相机：更新比例
  camera.aspect = sizes.width/ sizes.height;
  camera.updateProjectionMatrix();

  // 渲染器重置大小 并设置像素比（分屏操作时，像素比可能会变化）
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
})

// 双击全屏或退出全屏
window.addEventListener('dblclick', () => {
  const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
  const exitFullscreenFn = document.exitFullscreen || document.webkitExitFullscreen;
  const requestFullscreenFn = canvas.requestFullscreen || canvas.webkitRequestFullscreen;

  fullscreenElement ? exitFullscreenFn.call(document) : requestFullscreenFn.call(canvas);
})

const tick = () => {
  controls.update();
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick();