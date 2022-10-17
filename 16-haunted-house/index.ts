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

// Texture
const textureLoader = new THREE.TextureLoader();
const doorColorTexture = textureLoader.load('/public/assets/textures/door2/baseColor.jpg')
const doorAmbientOcclusionTexture = textureLoader.load(
  '/public/assets/textures/door2/ambientOcclusion.jpg',
)
const doorHeightTexture = textureLoader.load('/public/assets/textures/door2/height.png')
const doorNormalTexture = textureLoader.load('/public/assets/textures/door2/normal.jpg')
const doorMetalnessTexture = textureLoader.load('/public/assets/textures/door2/metalness.jpg')
const doorRoughnessTexture = textureLoader.load('/public/assets/textures/door2/roughness.jpg')
const brickColorTexture = textureLoader.load('/public/assets/textures/brick/baseColor.jpg')
const brickAmbientOcclusionTexture = textureLoader.load(
  '/public/assets/textures/brick/ambientOcclusion.jpg',
)
const brickHeightTexture = textureLoader.load('/public/assets/textures/brick/height.png')
const brickNormalTexture = textureLoader.load('/public/assets/textures/brick/normal.jpg')
const brickRoughnessTexture = textureLoader.load('/public/assets/textures/door2/roughness.jpg')

brickColorTexture.repeat.set(3, 3)
brickAmbientOcclusionTexture.repeat.set(3, 3)
brickHeightTexture.repeat.set(3, 3)
brickNormalTexture.repeat.set(3, 3)
brickRoughnessTexture.repeat.set(3, 3)

brickColorTexture.wrapS = THREE.RepeatWrapping
brickAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
brickHeightTexture.wrapS = THREE.RepeatWrapping
brickNormalTexture.wrapS = THREE.RepeatWrapping
brickRoughnessTexture.wrapS = THREE.RepeatWrapping

brickColorTexture.wrapT = THREE.RepeatWrapping
brickAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
brickHeightTexture.wrapT = THREE.RepeatWrapping
brickNormalTexture.wrapT = THREE.RepeatWrapping
brickRoughnessTexture.wrapT = THREE.RepeatWrapping

const floorColorTexture = textureLoader.load('/public/assets/textures/floor/baseColor.jpg')
const floorAmbientOcclusionTexture = textureLoader.load(
  '/public/assets/textures/floor/ambientOcclusion.jpg',
)
const floorHeightTexture = textureLoader.load('/public/assets/textures/floor/height.png')
const floorNormalTexture = textureLoader.load('/public/assets/textures/floor/normal.jpg')
const floorRoughnessTexture = textureLoader.load('/public/assets/textures/door2/roughness.jpg')
// 以8x8的大小纵横平铺
floorColorTexture.repeat.set(8, 8)
floorAmbientOcclusionTexture.repeat.set(8, 8)
floorHeightTexture.repeat.set(8, 8)
floorNormalTexture.repeat.set(8, 8)
floorRoughnessTexture.repeat.set(8, 8)
floorColorTexture.wrapS = THREE.RepeatWrapping;
floorAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
floorHeightTexture.wrapS = THREE.RepeatWrapping
floorNormalTexture.wrapS = THREE.RepeatWrapping
floorRoughnessTexture.wrapS = THREE.RepeatWrapping
floorColorTexture.wrapT = THREE.RepeatWrapping;
floorAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
floorHeightTexture.wrapT = THREE.RepeatWrapping
floorNormalTexture.wrapT = THREE.RepeatWrapping
floorRoughnessTexture.wrapT = THREE.RepeatWrapping

// Material
const material = new THREE.MeshStandardMaterial();
material.metalness = 0;
material.roughness = .3;

// Objects
// 地面
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20), 
  new THREE.MeshStandardMaterial({
    // 图片贴图
    map: floorColorTexture,
    // 环境贴图
    aoMap: floorAmbientOcclusionTexture,
    // 置换贴图(模拟起伏高度)
    displacementMap: floorHeightTexture,
    displacementScale: .01,
    // 法向贴图(模拟光线照射的表面质感)
    normalMap: floorNormalTexture,
    // 粗糙度贴图
    roughnessMap: floorRoughnessTexture,
  })
  )
plane.rotation.set(-Math.PI/2, 0, 0);
plane.position.set(0, 0, 0);
scene.add(plane);

const house = new THREE.Group();

// 墙面
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(4, 2.5, 4),
  new THREE.MeshStandardMaterial({
    map: brickColorTexture,
    aoMap: brickAmbientOcclusionTexture,
    displacementMap: brickHeightTexture,
    displacementScale: .001,
    normalMap: brickNormalTexture,
    roughnessMap: brickRoughnessTexture
  })
)
walls.position.y = 1.25;
walls.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2)
)
house.add(walls)

// 房顶
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.25, 1, 4),
  new THREE.MeshStandardMaterial({ color: '#b35f45' }),
)
roof.rotation.y = Math.PI /4
roof.position.y = 2.5 + 0.5;
house.add(roof);

// 大门
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(3.2, 2.4, 100, 100),
  new THREE.MeshStandardMaterial({ 
    map: doorColorTexture,
    transparent: true,
    aoMap: doorAmbientOcclusionTexture,
    displacementMap: doorHeightTexture,
    displacementScale: .08,
    normalMap: doorNormalTexture,
    metalnessMap: doorMetalnessTexture,
    roughnessMap: doorRoughnessTexture,
  })
)
door.geometry.setAttribute(
  'uv2',
  new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2),
)
door.position.y = 1;
door.position.z = 2 + .001;
house.add(door)

// 灌木丛
const bushGeometry = new THREE.SphereGeometry(1, 16, 16);
const bushMaterial = new THREE.MeshStandardMaterial({ color: '#8 9c854'})

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial);
const bush2 = new THREE.Mesh(bushGeometry, bushMaterial);
const bush3 = new THREE.Mesh(bushGeometry, bushMaterial);
const bush4 = new THREE.Mesh(bushGeometry, bushMaterial);

bush1.scale.set(.5, .5, .5)
bush1.position.set(.8, .2, 2.2)
bush2.scale.set(.25, .25, .25)
bush2.position.set(1.4, .1, 2.1)
bush3.scale.set(.4, .4, .4)
bush3.position.set(-.8, .1, 2.2)
bush4.scale.set(.15, .15, .15)
bush4.position.set(-1, .05, 2.6)
house.add(bush1, bush2, bush3, bush4);

scene.add(house)

// 墓碑群
const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxGeometry(.5, .8, .2);
const graveMaterial = new THREE.MeshStandardMaterial({ color: '#b2b6b1'})

for(let i =0; i< 50; i++){
  const grave = new THREE.Mesh(graveGeometry, graveMaterial);
  const angle = Math.random() * Math.PI * 2;
  const radius = 3 + Math.random() * 6;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;
  grave.position.set(x, .3, z)
  grave.rotation.z = (Math.random() - .5) * .4;
  grave.rotation.y = (Math.random() - .5) * .4;
  grave.castShadow = true;
  graves.add(grave);
}

// 幽灵光
const ghost1 = new THREE.PointLight('#f0f', 2, 3)
const ghost2 = new THREE.PointLight('#0ff', 2, 3)
const ghost3 = new THREE.PointLight('#ff0', 2, 3)
scene.add(ghost1)
scene.add(ghost2)
scene.add(ghost3)

// Lights
// 环境光：无阴影，整体亮度
const ambientLight = new THREE.AmbientLight('#b9d5ff', .12);
scene.add(ambientLight);

// 平行光：可投射阴影 (用于模拟太阳光, 来自无穷远，照射无穷远)
const directionalLight = new THREE.DirectionalLight('#b9d5ff', .12);
directionalLight.position.set(1, .75, 0)
scene.add(directionalLight);

// 灯光上开启 发射投影
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 256;
directionalLight.shadow.mapSize.height = 256;
directionalLight.shadow.camera.far = 15;


const doorLight = new THREE.PointLight('#ff7d46');
doorLight.position.set(0, 2.2, 2.7);
doorLight.shadow.mapSize.width = 256;
doorLight.shadow.mapSize.height = 256;
doorLight.shadow.camera.far = 15;
house.add(doorLight)

// 雾
const fog = new THREE.Fog('#262837', 1, 15)
scene.fog = fog;


// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect, .1, 100);
camera.position.set(4, 2, 4)
scene.add(camera)

// 相机控制器
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed=.2;
controls.maxDistance = 20;
controls.zoomSpeed = .3;
controls.maxPolarAngle = 87 * (Math.PI / 180);

// 声音
const listener = new THREE.AudioListener()
camera.add(listener)

const sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
audioLoader.load('/public/assets/sounds/ghost.mp3', buffer => {
  sound.setBuffer(buffer);
  sound.setLoop(true)
  sound.setVolume(.5)
  sound.play();
})

const ghostSound = new THREE.PositionalAudio(listener);
const ghostSoundLoader = new THREE.AudioLoader();
ghostSoundLoader.load('/public/assets/sounds/horror-ghost-14.wav', buffer => {
  ghostSound.setBuffer(buffer);
  ghostSound.setRefDistance(20)
  ghostSound.setLoop(true)
  ghostSound.setVolume(.6)
  ghostSound.play()
})
ghost2.add(ghostSound);


// 渲染器
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837')

renderer.shadowMap.enabled = true;
ghost1.castShadow = true;
ghost2.castShadow = true;
ghost3.castShadow = true;
ghost1.shadow.mapSize.width = 256;
ghost1.shadow.mapSize.height = 256;
ghost1.shadow.camera.far = 7;
ghost2.shadow.mapSize.width = 256;
ghost2.shadow.mapSize.height = 256;
ghost2.shadow.camera.far = 7;
ghost3.shadow.mapSize.width = 256;
ghost3.shadow.mapSize.height = 256;
ghost3.shadow.camera.far = 7;


walls.castShadow = true;
bush1.castShadow = true;
bush2.castShadow = true;
bush3.castShadow = true;
bush4.castShadow = true;

plane.receiveShadow = true;


// 屏幕自适应
listenResize(sizes, camera, renderer);

const clock = new THREE.Clock();
const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();

  const ghost1Angle = elapsedTime * .5;
  const ghost2Angle = elapsedTime * .32;
  const ghost3Angle = elapsedTime * .18;

  ghost1.position.x = Math.cos(ghost1Angle) * 4
  ghost1.position.z = Math.sin(ghost1Angle) * 4
  ghost1.position.y = Math.sin(elapsedTime * 3)

  ghost2.position.x = Math.cos(ghost2Angle) * 5
  ghost2.position.z = Math.sin(ghost2Angle) * 5
  ghost2.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)

  ghost3.position.x = Math.cos(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.32))
  ghost3.position.z = Math.sin(ghost3Angle) * (7 + Math.sin(elapsedTime * 0.5))
  ghost3.position.y = Math.sin(elapsedTime * 4) + Math.sin(elapsedTime * 2.5)
  


  controls.update();
  renderer.render(scene, camera)

  stats.end();
  requestAnimationFrame(tick)
}

tick();

const gui = new dat.GUI();
gui.add(controls, 'autoRotate')
gui.add(controls, 'autoRotateSpeed', .1, 10, .01);

const guiObj = {
  soundOff(){
    sound.pause();
    ghostSound.pause();
  },
  soundOn(){
    sound.play();
    ghostSound.play()
  }
}
gui.add(guiObj, 'soundOff').name('打开声音');
gui.add(guiObj, 'soundOn').name('关闭声音')