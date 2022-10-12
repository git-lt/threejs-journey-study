import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;
const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x82AAFF });
const mesh = new THREE.Mesh(
  // 立方体
  // new THREE.BoxGeometry(1, 1, 1, 5, 5, 5),
  // 球体
  // new THREE.SphereGeometry(0.5, 32, 32),
  // 圆环扭结几何体
  // new THREE.TorusKnotGeometry(0.3, 0.1, 100, 16),
  // new THREE.IcosahedronGeometry(0.5, 1),
  // 四面几何体
  // new THREE.TetrahedronGeometry(0.5, 1),
  // 八面几何体
  // new THREE.OctahedronGeometry(0.5, 1),
  // 十二面几何体
  // new THREE.DodecahedronGeometry(0.5, 1),
  // 圆锥几何体
  // new THREE.ConeGeometry(0.5, 1, 32),
  // 柱体
  // new THREE.CylinderGeometry(0.5, 0.5, 1, 32),
  // 平面
  // new THREE.PlaneGeometry(1, 1, 100, 100),
  // 圆形平面
  // new THREE.CircleGeometry(0.5, 32),

  // 圆环
  new THREE.TorusGeometry(0.7, 0.2, 16, 100),
  material
  );
scene.add(mesh);

// 透视相机
const camera = new THREE.PerspectiveCamera(50, aspect, 1, 100);
camera.position.set(3, 3, 3)
scene.add(camera)



// 正交相机
// const camera = new THREE.OrthographicCamera(-1 * aspect, 1*aspect, 1, -1, 1, 100)
// camera.position.set(2, 2, 2)
// scene.add(camera)
// camera.lookAt(mesh.position)

const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);


const captureMouse = (element) => {
  const mouse = { x: 0, y: 0, event: null}
  const { offsetLeft, offsetTop } = element;

  element.addEventListener('mousemove', e => {
    let x = e.pageX;
    let y = e.pageY;
    x -= offsetLeft;
    y -= offsetTop;

    mouse.x = x;
    mouse.y = y;
    mouse.event = e;
  })

  return mouse;
}

// const mouse =  captureMouse(canvas);

const controls = new OrbitControls(camera, canvas);
// 开启惯性运动
controls.enableDamping = true;

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);

const clock = new THREE.Clock();
const tick = () => {
  const delta = clock.getDelta();
  // mesh.rotation.y += 1 * delta;

  // camera.lookAt(mesh.position)
  // camera.position.x = (mouse.x / canvas.clientWidth - 0.5) * 4;
  // camera.position.y = -(mouse.y / canvas.clientHeight - 0.5) * 4;

  controls.update();
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick();