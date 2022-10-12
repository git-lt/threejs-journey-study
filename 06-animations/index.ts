import './style.css'
import * as THREE from 'three'
import gsap from 'gsap'

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
scene.add(mesh);

const camera = new THREE.PerspectiveCamera(75, aspect);
camera.position.z = 3;
scene.add(camera)


// // 1s从x正向移动2m
// gsap.to(mesh.position, { duration: 1, delay: 1, x: 2})
// // 回到原点
// gsap.to(mesh.position, {
//   duration: 1, 
//   delay: 2,
//   x: 0,
//   onComplete: () => {
//     console.log('onComplete')
//   }
// })
// // 沿Y轴旋转 360 * (1/4) = 90 度
// // 旋转归 0 后，延迟1s, 再沿Y轴旋转90度
// gsap
//   .to(mesh.rotation, { duration: 1, delay: 1, y: Math.PI * .25})
//   .then(() => {
//     mesh.rotation.y = 0;
//     return gsap.to(mesh.rotation, { duration: 1, delay: 1, y: Math.PI * .25 })
//   })

const axesHelper = new THREE.AxesHelper(2);
scene.add(axesHelper);

const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);


const clock = new THREE.Clock();
let time = Date.now();

const tick = () => {
  // mesh.rotation.y += 0.01;
  // const currentTime = Date.now();
  // const deltaTime = currentTime - time;
  // time = currentTime;
  // mesh.rotation.y += 0.001 * deltaTime;

  const elapsedTime = clock.getElapsedTime();
  let colors = [0xff0000, 0x00ff00, 0x0000ff]
  // console.log(elapsedTime)
  // mesh.rotation.y = elapsedTime;
  // mesh.position.x = Math.cos(elapsedTime * 0.5);
  // mesh.position.y = Math.sin(elapsedTime)
  // mesh.position.z = Math.sin(elapsedTime * .5)

  // mesh.position.x += .01;
  // mesh.position.y += .01;
  // mesh.position.z += .01;

  // mesh.scale.x = Math.sin(elapsedTime);
  // mesh.scale.y = Math.sin(elapsedTime);
  // mesh.scale.z = Math.sin(elapsedTime);

  // mesh.material.color.set(colors[Math.floor(elapsedTime) % 3])
  // mesh.material.color.setHSL(elapsedTime % 1, 1, .5)

  renderer.render(scene, camera)
  requestAnimationFrame(tick)
}

tick();