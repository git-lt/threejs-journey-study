import './style.css'
import * as THREE from 'three'
import stats from '../common/stats'
import * as dat from 'lil-gui'
import { listenResize } from '../common/utils'
import gasp from 'gsap'

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

// 竖屏
const isPortrait = sizes.width < sizes.height;

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

const parameters = {
  color: '#FFF59D'
}

const textureLoader = new THREE.TextureLoader();
const gradientTexture = textureLoader.load('https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5a9dbb4287414cf99f3c5ecae9864914~tplv-k3u1fbpfcp-zoom-1.image')
gradientTexture.magFilter = THREE.NearestFilter;

const material = new THREE.MeshToonMaterial({
  color: parameters.color,
  gradientMap: gradientTexture
});

const mesh1 = new THREE.Mesh(new THREE.TorusGeometry(1, .4, 16, 60), material);
const mesh2 = new THREE.Mesh(new THREE.ConeGeometry(1, 2, 32), material);
const mesh3 = new THREE.Mesh(new THREE.TorusKnotGeometry(.8, .35, 100, 16), material);

scene.add(mesh1, mesh2, mesh3)

const objectsDistance = 4;

const sectionMeshes: THREE.Mesh[] = [ mesh1, mesh2, mesh3 ];

// 垂直散开
sectionMeshes.forEach((item, index) => {
  item.position.setX(index % 2 === 0 ? 2 : -2);
  item.position.setY(-objectsDistance * index)
})

// Particles
// 粒子
const particlesCount = 200;
const positions = new Float32Array(particlesCount * 3);
for(let i = 0; i<particlesCount; i++){
  // positions[i*3+0] = Math.random();
  // positions[i*3+1] = Math.random();
  // positions[i*3+2] = Math.random();

  positions[i*3+0] = (Math.random() - .5) * 10;
  positions[i*3+1] = objectsDistance * .5 - Math.random() * objectsDistance * sectionMeshes.length;
  positions[i*3+2] =  (Math.random() - .5) * 10;
}

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
const particlesMaterial = new THREE.PointsMaterial({
  size: .05,
  color: parameters.color,
  sizeAttenuation: true,
})

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles)


// Lights
// 环境光：无阴影，整体亮度
const ambientLight = new THREE.AmbientLight('#b9d5ff', .28);
scene.add(ambientLight);

// 平行光：可投射阴影 (用于模拟太阳光, 来自无穷远，照射无穷远)
const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.position.set(1, 1, 0)
scene.add(directionalLight);

// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect, .1, 100);
camera.position.set(0, 0, 4)
scene.add(camera)

const cameraGroup = new THREE.Group();
cameraGroup.add(camera);
scene.add(cameraGroup)

// 渲染器
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837')

// 屏幕自适应
listenResize(sizes, camera, renderer);

let { scrollY } = window;
let currentSection = 0
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height);
  if(newSection !== currentSection){
    currentSection = newSection;
    console.log('changed', currentSection)
    // 执行当前 section 中的物体动画 
    gasp.to(sectionMeshes[currentSection].rotation, {
      duration: 1.5,
      ease: 'power2.inOut',
      x: '+=6',
      y: '+=3',
    })
  }
})

const mouse: {
  x: number | null,
  y: number | null,
} = { x: null, y: null }



const listenGyro = () => {
  // 设备陀螺仪检测代替 mousemove
  window.addEventListener('deviceorientation', event => {
    const { beta, gamma }  = event;
    if(beta !== null && gamma !== null){
      const x = (gamma || 0) / 20;
      const y = (Math.min(beta || 0, 89) - 45) / 30;
      mouse.x = x;
      mouse.y = -y;
    }
  })
}

// 如果是竖屏(手机)
if(isPortrait){
  // 苹果手机需要提示用户手动授权，才能开启陀螺仪
  // @ts-ignore;
  if(typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'){
    const permissionDialog = document.querySelector('#premissionDialog') as HTMLDivElement;
    permissionDialog.style.visibility = 'visible';

    const allowBtn = document.querySelector('#allow') as HTMLButtonElement;
    const cancelBtn = document.querySelector('#cancel') as HTMLButtonElement;

    allowBtn.addEventListener('click', () => {
      // @ts-ignore
      DeviceMotionEvent.requestPermission()
      .then((premissionState: string) => {
        if(premissionState === 'granted'){
          listenGyro()
        }else{

        }
        permissionDialog.style.visibility = 'hidden'
      })
      .catch((err:any) => {
        permissionDialog.style.visibility = 'hidden';
      })
    })
  }else{
    // 其它系统直接监听
    listenGyro();
  }
}else{
  // PC用户监听 mousemove 事件
  window.addEventListener('mousemove', event => {
    const { clientX, clientY } = event;
    mouse.x =(clientX / sizes.width) * 2 -1;
    mouse.y = - (clientY / sizes.height) * 2 + 1;
  })
}

const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime  - previousTime;
  previousTime = elapsedTime;

  // 物体转动
  sectionMeshes.forEach(mesh => {
    mesh.rotation.set(deltaTime * .1 + mesh.rotation.x, deltaTime * .12+ mesh.rotation.y, 0)
  })

  // 相机跟随滚动条移动
  camera.position.setY(-(scrollY/sizes.height) * objectsDistance)

  // 视差效果
  if(mouse.x && mouse.y){
    const parallaxX = mouse.x * .5;
    const parallaxY = mouse.y * .5;
    cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
    cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime;
  }

  renderer.render(scene, camera)

  stats.end();
  requestAnimationFrame(tick)
}

tick();


const gui = new dat.GUI();
gui.addColor(parameters, 'color').onChange(() => {
  material.color.set(parameters.color);
  particlesMaterial.color.set(parameters.color);
}).name('主题色')
