import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import stats from '../common/stats'
import { listenResize, dbClkfullScreen } from '../common/utils'

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// LoadingManager
const loadingManager = new THREE.LoadingManager();
loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
  console.log(`Started loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`)
}
loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
  console.log(`Loading file: ${url}.\nLoaded ${itemsLoaded} of ${itemsTotal} files.`)
}
loadingManager.onLoad = () => {
  console.log('Loading complete!')
}
loadingManager.onError = (url) => {
  console.log(`There was an error loading ${url}`)
}

// Texture
const textureLoader = new THREE.TextureLoader(loadingManager);
// const colorTexture = textureLoader.load('/public/assets/textures/door/color.jpg');
// const colorTexture = textureLoader.load('/public/assets/textures/checkerboard-1024x1024.png');
const colorTexture = textureLoader.load('/public/assets/textures/checkerboard-8x8.png');

// const alphaTexture = textureLoader.load('/public/assets/textures/door/alpha.jpg');
// const ambientOcclusionTexture = textureLoader.load('/public/assets/textures/door/ambientOcclusion.jpg');
// const heightTexture = textureLoader.load('/public/assets/textures/door/height.jpg');
// const metalnessTexture = textureLoader.load('/public/assets/textures/door/metalness.jpg');

// colorTexture.offset.x = 1;
// colorTexture.offset.y = 1;
// colorTexture.wrapS = THREE.RepeatWrapping;

// 重复平铺
// colorTexture.wrapT = THREE.RepeatWrapping;
// 不重复，纹理边缘拉伸到网格边缘
// colorTexture.wrapT = THREE.ClampToEdgeWrapping;
// 重复平铺，每次都镜像
// colorTexture.wrapT = THREE.MirroredRepeatWrapping;

// colorTexture.offset.x = .5;
// colorTexture.offset.y = 0;
// colorTexture.wrapS = THREE.RepeatWrapping;
// colorTexture.wrapT = THREE.RepeatWrapping;
// colorTexture.center = new THREE.Vector2(.5, .5);
// colorTexture.rotation = Math.PI / 4;

colorTexture.generateMipmaps = false;

// 缩小滤镜 规则设置：清晰锐利
// LinearMipmapNearestFilter 近清晰，远模糊
// colorTexture.minFilter = THREE.NearestFilter;
// LinearFilter 默认值
// colorTexture.minFilter = THREE.LinearFilter;

// 放大滤镜
colorTexture.magFilter = THREE.NearestFilter;

const cubeMesh = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshBasicMaterial({ map: colorTexture })
)
scene.add(cubeMesh);

// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect);
camera.position.set(2, 2, 2)
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