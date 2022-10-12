import './style.css'
import * as THREE from 'three'

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;
const scene = new THREE.Scene();

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x82AAFF });
const mesh = new THREE.Mesh(geometry, material);
// scene.add(mesh);

// mesh.position.x = 0.7;
// mesh.position.y = -0.6;
// mesh.position.z = 1;


const camera = new THREE.PerspectiveCamera(75, aspect);
camera.position.z = 5;
scene.add(camera)

// 移动、缩放、旋转
// mesh.position.set(1, -.6, 1)
// mesh.scale.x = 2;
// mesh.scale.y = 0.25;
// mesh.rotation.x = Math.PI * .25;
// mesh.rotation.z = Math.PI * .25;
// camera.lookAt(new THREE.Vector3(0, -1, 0))

const group = new THREE.Group();

group.scale.y = 2;
group.rotation.y = .2;
scene.add(group)

const cube1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xF78B6C })
)
cube1.position.x = -1.5;
group.add(cube1)

const cube2 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xF78B6C })
)
cube2.position.x = 0
group.add(cube2)

const cube3 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ color: 0xF78B6C })
)
cube3.position.x = 1.5
group.add(cube3)


const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);

const tick = () => {
  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick();