import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper'
import stats from '../common/stats'
import * as dat from 'lil-gui'
import { listenResize } from '../common/utils'

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

const material = new THREE.MeshStandardMaterial();
material.metalness = 0;
material.roughness = .5;

// Objects
const shpere = new THREE.Mesh(
  new THREE.SphereGeometry(.5, 32, 32),
  material,
)
const cube = new THREE.Mesh(
  new THREE.BoxGeometry(.75, .75, .75),
  material,
)

const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 6),
  material
)
cube.position.set(.5, 0, -1)
shpere.position.set(.5, 0, .5)
plane.position.y = -.6;
plane.rotation.set(-Math.PI /2, 0, 0)

// 几何体上开启发射投影和接受投影
cube.castShadow = true;
cube.receiveShadow = true;
shpere.castShadow = true;
shpere.receiveShadow = true;
plane.receiveShadow = true;

scene.add(cube, shpere,  plane)

// Lights

// 环境光：无阴影，整体亮度
const ambientLight = new THREE.AmbientLight('#fff', .5);
scene.add(ambientLight);

// 平行光：可投射阴影 (用于模拟太阳光, 来自无穷远，照射无穷远)
const directionalLight = new THREE.DirectionalLight('#ffa', .5);
directionalLight.visible = false;
directionalLight.position.set(3, 1, 0)
scene.add(directionalLight);


// 设置阴影的分辨率，越大效果越好
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;

// 设置阴影的camera
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 7;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.bottom = -2;
directionalLight.shadow.camera.left = -2;

// 阴影模糊
directionalLight.shadow.radius = 20;

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
directionalLightHelper.visible = false;
scene.add(directionalLightHelper);
// 修复阴影裁切问题
// (因为阴影是通过camera来渲染的，每个阴影都有一个对应的camera，修改 shadow.camera 可以改变渲染结果)
const directionalLightCarmerHelper = new THREE.CameraHelper(directionalLight.shadow.camera);
directionalLightCarmerHelper.visible = false;
scene.add(directionalLightCarmerHelper);


// 点光源：可投射阴影，类似灯泡，可衰减
const pointLight = new THREE.PointLight(0xff9000, 1)
pointLight.visible = false;
pointLight.position.set(1, 1,1)
scene.add(pointLight);

const pointLightHelper =new THREE.PointLightHelper(pointLight, .5)
pointLightHelper.visible =false;
scene.add(pointLightHelper);
// 点光源 阴影相机是透视相机，始终朝下
const pointLightShadowCameraHelper = new THREE.CameraHelper(pointLight.shadow.camera);
pointLightShadowCameraHelper.visible =false;
scene.add(pointLightShadowCameraHelper)

// 聚光灯：锥体形状、可投射阴影，有衰减
const spotLight = new THREE.SpotLight(0x78ff00, .5, 10, Math.PI * .1, .5, 1);
spotLight.visible = false;
spotLight.position.set(0, 2, 3);
scene.add(spotLight)

// 聚光灯的相机 为透视相机
spotLight.shadow.mapSize.set(1024, 1024);
spotLight.shadow.camera.fov = 30;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 6;


const spotLightHelper =new THREE.SpotLightHelper(spotLight);
spotLightHelper.visible = false;
scene.add(spotLightHelper)

const spotLightShadowCameraHelper = new THREE.CameraHelper(spotLight.shadow.camera)
spotLightShadowCameraHelper.visible = false;
scene.add(spotLightShadowCameraHelper)

// 灯光上开启 发射投影
directionalLight.castShadow = true;
pointLight.castShadow = true;
spotLight.castShadow = true;


// 透视相机
const camera = new THREE.PerspectiveCamera(60, aspect, 1, 100);
camera.position.set(2, 2, 2)
scene.add(camera)

// 相机控制器
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

// 渲染器
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// 渲染器开启 shadowMap
renderer.shadowMap.enabled = true;
// 设置投影算法（不支持radius)
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// 屏幕自适应
listenResize(sizes, camera, renderer);

const clock = new THREE.Clock();
const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  shpere.rotation.y = .1 * elapsedTime;
  cube.rotation.y = .1 * elapsedTime;


  shpere.rotation.x = .15 * elapsedTime;
  cube.rotation.x = .15 * elapsedTime;

  controls.update();
  renderer.render(scene, camera)

  stats.end();
  requestAnimationFrame(tick)
}

tick();


const gui = new dat.GUI();
const meshFolder = gui.addFolder('几何体');
meshFolder.add(material, 'metalness', 0, 1, .001).name('金属度')
meshFolder.add(material, 'roughness', 0, 1, .001).name('粗糙度')
meshFolder.add(material, 'wireframe').name('线框模式')

const ambientLightFolder = gui.addFolder('环境光');
ambientLightFolder.add(ambientLight, 'visible').name('显示').listen();
ambientLightFolder.add(ambientLight, 'intensity', 0, 1, .0001).name('强度');

const directionalLightFoler = gui.addFolder('平行光');
directionalLightFoler.add(directionalLight, 'visible').name('显示').onChange((visible: boolean) => {
  directionalLight.visible = visible;
  directionalLightHelper.visible = visible;
  directionalLightCarmerHelper.visible = visible;
})
directionalLightFoler.add(directionalLight, 'intensity', 0, 1, .0001).name('强度');


const pointLightFolder = gui.addFolder('点光源');
pointLightFolder.add(pointLight, 'visible').name('显示').onChange((visible: boolean) => {
  pointLight.visible = visible;
  pointLightHelper.visible = visible;
  pointLightShadowCameraHelper.visible = visible;
})
pointLightFolder.add(pointLight, 'distance', 0, 100, .0001).name('距离');
pointLightFolder.add(pointLight, 'decay', 0, 10, .00001).name('衰减量');


const spotLightFolder = gui.addFolder('聚光灯');
spotLightFolder.add(spotLight, 'visible').name('显示').onChange((visible: boolean) => {
  spotLight.visible = visible;
  spotLightHelper.visible = visible;
  spotLightShadowCameraHelper.visible = visible;
})
spotLightFolder.add(spotLight, 'intensity', 0, 5, .001).name('强度');
spotLightFolder.add(spotLight, 'distance', 0, 20, .001).name('长度');
spotLightFolder.add(spotLight, 'angle', 0, Math.PI /2 , .001).name('散射角度');
spotLightFolder.add(spotLight, 'decay', 0, 10, .0001).name('衰减量');
