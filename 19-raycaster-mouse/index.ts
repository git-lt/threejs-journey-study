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

// Lights
// 环境光：无阴影，整体亮度
const ambientLight = new THREE.AmbientLight('#b9d5ff', .5);
scene.add(ambientLight);

// 平行光：可投射阴影 (用于模拟太阳光, 来自无穷远，照射无穷远)
const directionalLight = new THREE.DirectionalLight('#b9d5ff', 1);
directionalLight.position.set(1, .75, 0)
scene.add(directionalLight);

// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect, .1, 100);
camera.position.set(-14, 10, 25)
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


const ballNumInRow = 5;

const cubeGroup = new THREE.Group();
const objectsToTest: THREE.Mesh[] = [];
// 生成 5x5 个小球，共5层，每层5行，每行5个
for(let k = 0; k<ballNumInRow; k++){
  // 5层
  const planeGroup = new THREE.Group();
  for(let j = 0; j < ballNumInRow; j++){
    // 5行
    const rowGroup = new THREE.Group();
    for(let i = 0; i<ballNumInRow; i++){
      // 5个
      const object = new THREE.Mesh(
        new THREE.SphereGeometry(1, 32, 32),
        new THREE.MeshStandardMaterial({ color: '#fff' })
      )
      object.position.setX(i * 2);
      object.name = 'ball';
      // 球加到行里
      rowGroup.add(object);
      objectsToTest.push(object);
    }
    // 设置行的偏移 z轴正方向
    rowGroup.position.setZ(j * 2);
    // 行加到层里
    planeGroup.add(rowGroup);
  }
  // 设置层的偏移 Y轴正方向
  planeGroup.position.setY(k * 2);
  // 层加到根组里
  cubeGroup.add(planeGroup)
}
// 位置居中
cubeGroup.position.set(-ballNumInRow/2 - 1.5, -ballNumInRow/2 - 1.5, -ballNumInRow/2 - 1.5)
scene.add(cubeGroup);

const cube = new THREE.Mesh(
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.MeshStandardMaterial()
)
cube.position.setY(-13);
scene.add(cube)

// Raycaster
const raycaster = new THREE.Raycaster();

const mouse: {
  x: number | null,
  y: number | null,
} = { x: null, y: null};

window.addEventListener('mousemove', event => {
  const { clientX, clientY } = event;
  mouse.x = (clientX / sizes.width) * 2 -1;
  mouse.y = -(clientY / sizes.height) * 2 + 1;
})

window.addEventListener('touchmove', event => {
  const { clientX, clientY } = event.touches[0];
  mouse.x = (clientX / sizes.width) * 2 -1;
  mouse.y = -(clientY / sizes.height) * 2 + 1;
})

const clock = new THREE.Clock();
const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();

  if(mouse.x && mouse.y){
    // 从相机发射射线到鼠标点
    raycaster.setFromCamera({x: mouse.x, y: mouse.y}, camera);
  }

  const intersects: THREE.Intersection<
  THREE.Mesh<THREE.SphereGeometry, THREE.MeshStandardMaterial>
  >[] = raycaster.intersectObjects(objectsToTest);

  const firstIntersctObj = intersects[0];
  if(firstIntersctObj?.object.material.color.equals(new THREE.Color('#fff'))){
    firstIntersctObj?.object.material.color.set(new THREE.Color(Math.random(), Math.random(), Math.random()))
  }


  controls.update();
  renderer.render(scene, camera)

  stats.end();
  requestAnimationFrame(tick)
}

tick();


const gui = new dat.GUI();

gui.add(controls, 'autoRotate')
gui.add(controls, 'autoRotateSpeed', .1, 10, .01)