import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import stats from '../common/stats'
import { listenResize, dbClkfullScreen } from '../common/utils'

import gsap from 'gsap'
import * as dat from 'dat.gui'

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Object
const box = new THREE.BoxGeometry(1, 1, 1);
const defaultColor =  0x607d8b;
const material = new THREE.MeshBasicMaterial({
  color:  0x607d8b,
})
const cubeMesh = new THREE.Mesh(box, material);
scene.add(cubeMesh);


// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect);
camera.position.set(0, 0, 3)
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

/**
 * Debug
 */
const gui = new dat.GUI({
  // closed: true,
  // width: 400
})

gui.add(cubeMesh.position, 'x').min(-3).max(3).step(0.01)
gui.add(cubeMesh.position, 'y').min(-3).max(3).step(0.01)
gui.add(cubeMesh.position, 'z').min(-3).max(3).step(0.01)
gui.add(cubeMesh, 'visible')
gui.add(cubeMesh.material, 'wireframe')

const debugObj = {
  color: defaultColor,
  spin(){
    gsap.to(cubeMesh.rotation, {
      duration: 1,
      y: cubeMesh.rotation.y + Math.PI * 2
    })
  }
}

gui.addColor(debugObj, 'color').onChange((e) => {
  cubeMesh.material.color.set(e);
})

// 添加自定义的 方法
gui.add(debugObj, 'spin');