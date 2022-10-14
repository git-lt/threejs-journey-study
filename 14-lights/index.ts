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
const tours = new THREE.Mesh(
  new THREE.TorusGeometry(.3, .2, 32, 64),
  material,
)
const cylinder = new THREE.Mesh(
  new THREE.CylinderGeometry(.3, .3,  1, 32, 2),
  material
) 
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(8, 6),
  material
)
cube.position.set(.5, 0, 0)
shpere.position.set(-1.5, 0, 0)
tours.position.set(1.6, 0, 0)
cylinder.position.set(0, 0, 1);
plane.position.y = -.6;
plane.rotation.set(-Math.PI /2, 0, 0)

scene.add(cube, shpere, tours, cylinder, plane)

// Lights

// 环境光：无阴影，整体亮度
const ambientLight = new THREE.AmbientLight('#fff', .5);
scene.add(ambientLight);

// 平行光：可投射阴影 (用于模拟太阳光, 来自无穷远，照射无穷远)
const directionalLight = new THREE.DirectionalLight('#ffa', .5);
directionalLight.position.set(3, 1, 0)
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper);


// 半球光：天空到地面的渐变光，无阴影 (和平行光类似)
const hemisphereLight = new THREE.HemisphereLight('#b703ff', '#ffd6f8', 0.6);
scene.add(hemisphereLight);

const hemisphereLightHelper = new THREE.HemisphereLightHelper(hemisphereLight, .5, '#00ff00');
scene.add(hemisphereLightHelper);

// 点光源：可投影，类似灯泡，可衰减
const pointLight = new THREE.PointLight(0xff9000, 1)
pointLight.position.set(1, 1,1)
scene.add(pointLight);

const pointLightHelper =new THREE.PointLightHelper(pointLight, .5)
scene.add(pointLightHelper);

// 平面光: 不支持投影，只支持 MeshStandardMaterial 和 MeshPhysicalMaterial 两种材质。
// 用于模拟窗户或条状灯
const rectAreaLight = new THREE.RectAreaLight(0x4e00ff, 10, 1, 1)
rectAreaLight.position.set(-1.5, 1, 1.5);
rectAreaLight.lookAt(new THREE.Vector3())
scene.add(rectAreaLight)

const rectAreaLightHelper = new RectAreaLightHelper(rectAreaLight);
scene.add(rectAreaLightHelper)

// 聚光灯：锥体形状、可投射阴影，有衰减
const spotLight = new THREE.SpotLight(0x78ff00, .5, 10, Math.PI * .1, .25, 1);
spotLight.position.set(0, 2, 3);
scene.add(spotLight)

const spotLightHelper =new THREE.SpotLightHelper(spotLight);
scene.add(spotLightHelper)


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

// 屏幕自适应
listenResize(sizes, camera, renderer);

const clock = new THREE.Clock();
const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  shpere.rotation.y = .1 * elapsedTime;
  cube.rotation.y = .1 * elapsedTime;
  cylinder.rotation.y = .1 * elapsedTime;
  tours.rotation.y = .1 * elapsedTime;


  shpere.rotation.x = .15 * elapsedTime;
  cube.rotation.x = .15 * elapsedTime;
  cylinder.rotation.x = .15 * elapsedTime;
  tours.rotation.x = .15 * elapsedTime;

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
// directionalLightFoler.add(directionalLight, 'visible').listen();
directionalLightFoler.add(directionalLight, 'visible').name('显示').listen();
directionalLightFoler.add(directionalLight, 'intensity', 0, 1, .0001).name('强度');

const hemisphereLightFolder = gui.addFolder('半球光');
hemisphereLightFolder.add(hemisphereLight, 'visible').name('显示').listen();
hemisphereLightFolder.add(hemisphereLight, 'intensity', 0, 1, .0001).name('强度');

const pointLightFolder = gui.addFolder('点光源');
pointLightFolder.add(pointLight, 'visible').name('显示').listen();
pointLightFolder.add(pointLight, 'distance', 0, 100, .0001).name('距离');
pointLightFolder.add(pointLight, 'decay', 0, 10, .00001).name('衰减量');

const rectAreaLightFolder = gui.addFolder('平面光');
rectAreaLightFolder.add(rectAreaLight, 'visible').name('显示').listen();
rectAreaLightFolder.add(rectAreaLight, 'intensity', 0, 80, .0001).name('强度');
rectAreaLightFolder.add(rectAreaLight, 'width', 0, 5, .0001).name('宽度');
rectAreaLightFolder.add(rectAreaLight, 'height', 0, 5, .0001).name('高度');

const spotLightFolder = gui.addFolder('聚光灯');
spotLightFolder.add(spotLight, 'visible').name('显示').listen();
spotLightFolder.add(spotLight, 'intensity', 0, 5, .001).name('强度');
spotLightFolder.add(spotLight, 'distance', 0, 20, .001).name('长度');
spotLightFolder.add(spotLight, 'angle', 0, Math.PI /2 , .001).name('散射角度');
spotLightFolder.add(spotLight, 'decay', 0, 10, .0001).name('衰减量');

const guiObj = {
  turnOffAllLights() {
    ambientLight.visible = false
    directionalLight.visible = false
    // directionalLightHelper.visible = false
    hemisphereLight.visible = false
    // hemisphereLightHelper.visible = false
    pointLight.visible = false
    // pointLightHelper.visible = false
    rectAreaLight.visible = false
    // rectAreaLightHelper.visible = false
    spotLight.visible = false
    // spotLightHelper.visible = false
  },
  turnOnAllLights() {
    ambientLight.visible = true
    directionalLight.visible = true
    directionalLightHelper.visible = true
    hemisphereLight.visible = true
    hemisphereLightHelper.visible = true
    pointLight.visible = true
    pointLightHelper.visible = true
    rectAreaLight.visible = true
    rectAreaLightHelper.visible = true
    spotLight.visible = true
    spotLightHelper.visible = true
  },
}

gui.add(guiObj, 'turnOffAllLights').name('关闭所有灯光')
gui.add(guiObj, 'turnOnAllLights').name('打开所有灯光')