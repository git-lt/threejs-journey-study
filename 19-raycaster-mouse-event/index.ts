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
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837')

// 屏幕自适应
listenResize(sizes, camera, renderer);


const mouse: {
  x: number | null,
  y: number | null,
} = { x: null, y: null }

window.addEventListener('mousemove', event => {
  const { clientX, clientY } = event;
  mouse.x = (clientX/sizes.width) * 2 - 1;
  mouse.y = -(clientY/sizes.height) * 2 + 1;
})

let currentIntersect: THREE.Intersection<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>> | null = null;

window.addEventListener('click', event => {
  const { clientX, clientY } = event;
  mouse.x = (clientX/sizes.width) * 2 - 1;
  mouse.y = -(clientY/sizes.height) * 2 + 1;

  if(currentIntersect){
    switch(currentIntersect.object){
      case obj1:
        console.log('clicked obj1');
        break;
      case obj2:
        console.log('clicked obj2');
        break;
      case obj3:
        console.log('clicked obj3');
        break;
      default: 
        break;
    }
  }
})


const clock = new THREE.Clock();
const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();

  if(mouse.x && mouse.y){
    raycaster.setFromCamera({x: mouse.x, y: mouse.y}, camera);
  }

  const objList = [obj1, obj2, obj3 ];
  const intersects: THREE.Intersection<
  THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>
  >[] = raycaster.intersectObjects(objList)

  if(intersects.length){
    if(!currentIntersect){
      console.log('mouse enter');
    }
    [currentIntersect] = intersects;
  }else{
    if(currentIntersect){
      console.log('mouse leave')
    }
    currentIntersect = null;
  }

  objList.forEach(item => {
    item.material.color.set('#B71C1C')
  })

  intersects.forEach(item => {
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