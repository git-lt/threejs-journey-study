import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import stats from '../common/stats'
import dat from 'dat.gui'
import { listenResize, dbClkfullScreen } from '../common/utils'

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
const colorTexture = textureLoader.load('/public/assets/textures/door/color.jpg');
// const colorTexture = textureLoader.load('/public/assets/textures/checkerboard-1024x1024.png');
// const colorTexture = textureLoader.load('/public/assets/textures/checkerboard-8x8.png');

const alphaTexture = textureLoader.load('/public/assets/textures/door/alpha.jpg');
const ambientOcclusionTexture = textureLoader.load('/public/assets/textures/door/ambientOcclusion.jpg');
const heightTexture = textureLoader.load('/public/assets/textures/door/height.jpg');
const metalnessTexture = textureLoader.load('/public/assets/textures/door/metalness.jpg');
const roughnessTexture = textureLoader.load('/public/assets/textures/door/roughness.jpg');
const normalTexture = textureLoader.load('/public/assets/textures/door/normal.jpg');


// ### 基础网格材质
// const material = new THREE.MeshBasicMaterial();
// material.map = colorTexture;
// 线框模式
// material.wireframe = true;
// 颜色混合
// material.color = new THREE.Color('#009688');
// 设置透明度
// material.transparent = true;
// material.opacity = .4;
// material.alphaMap = alphaTexture;
// 设置纹理贴图的 面 （正面和背面）默认只贴正面，正法向面
// 一般vr或3d看房，应该设置为 THREE.BackSide，贴里面
// material.side = THREE.DoubleSide; // 双面都贴


// ### 法线网格材质
// 一般用于 debug 法线
// const material = new THREE.MeshNormalMaterial()
// // 关闭平滑显示
// material.flatShading = true

// ### 材质捕捉(光照贴图)
// 不对灯光作出反应。它将会投射阴影到一个接受阴影的物体上(and shadow clipping works)，但不会产生自身阴影或是接受阴影
// const matcapTexure = textureLoader.load('/public/assets/textures/matcaps/1.png');
// const matcapTexure = textureLoader.load('/public/assets/textures/matcaps/2.png');
// const matcapTexure = textureLoader.load('/public/assets/textures/matcaps/3.png');
// const material = new THREE.MeshMatcapMaterial()
// material.matcap = matcapTexure;

// #### MeshDepthMaterial 深度网格材质(不受光照影响) 
// 近亮远暗
// const material = new THREE.MeshDepthMaterial();

// #### Lambert网格材质 漫反射材质
// 一种非光泽表面的材质，没有镜面高光。
// const material = new THREE.MeshLambertMaterial()

// #### 光泽材质
// 具有镜面高光的光泽表面的材质
// const material = new THREE.MeshPhongMaterial();
// // 光泽度
// material.shininess = 60
// // 光泽颜色
// material.specular = new THREE.Color('#00ff00')


// ### 卡通风格材质 MeshToonMaterial
// 5色灰阶纹理
// const gradientTexture = textureLoader.load('/public/assets/textures/gradients/5.jpg');
// const material = new THREE.MeshToonMaterial();
// gradientTexture.magFilter = THREE.NearestFilter
// material.gradientMap = gradientTexture;

// #### 标准网络材质 Mesh
// 基于物理渲染的（physically based rendering, PBR）。
// 它支持光效，并有一个更拟真的算法，支持了更多参数如粗糙度、金属性
// const material = new THREE.MeshStandardMaterial();
// // 金属度和粗糙度
// material.metalness = .8;
// material.roughness = .45;


const material = new THREE.MeshStandardMaterial();

material.map = colorTexture;
// 环境遮挡贴图
material.aoMap = ambientOcclusionTexture;
// 强度
material.aoMapIntensity = 1;
// 位移贴图 （凹凸贴图）
material.displacementMap = heightTexture;
material.displacementScale = .2
// 金属度贴图
material.metalnessMap = metalnessTexture;
// 粗糙度贴图
material.roughnessMap = roughnessTexture;
material.metalness = 0;
material.roughness = 1;
// 法线贴图 用于模拟光照效果
// 用于创建法线贴图的纹理。RGB值会影响每个像素片段的曲面法线，并更改颜色照亮的方式。法线贴图不会改变曲面的实际形状，只会改变光照。
material.normalMap = normalTexture;
material.normalScale.set(.5, .5);

// 透明度贴图
material.alphaMap = alphaTexture;
material.transparent = true;

// 环境贴图
// 在几何体上用于反射出周围环境的一种纹理贴图
// const envMapTexture = new THREE.CubeTextureLoader()
//   .setPath('/public/assets/textures/environmentMaps/0/')
//   .load(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])

// const material = new THREE.MeshStandardMaterial();
// material.envMap = envMapTexture;
// material.metalness = .7;
// material.roughness= .2;


const ambilentLight = new THREE.AmbientLight(0xffffff, .5)
scene.add(ambilentLight)
const pointLight = new THREE.PointLight('#ffffff', 1, 100);
pointLight.position.set(2, 3, 4)
scene.add(pointLight)

// Meshs
const cubeMesh = new THREE.Mesh(
  new THREE.SphereGeometry(0.5, 64, 64),
  material
)
cubeMesh.position.set(-1.5, 0, 0)

const planeMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 100, 100),
  material,
)
const toursMesh = new THREE.Mesh(
  // new THREE.TorusGeometry(.3, .2, 16, 32),
  new THREE.TorusGeometry(.3, .2, 64, 128),
  material
)
toursMesh.position.set(1.5, 0, 0)


cubeMesh.geometry.setAttribute('uv2', new THREE.BufferAttribute(cubeMesh.geometry.attributes.uv.array, 2))
planeMesh.geometry.setAttribute('uv2', new THREE.BufferAttribute(planeMesh.geometry.attributes.uv.array, 2))
toursMesh.geometry.setAttribute('uv2', new THREE.BufferAttribute(toursMesh.geometry.attributes.uv.array, 2))


scene.add(cubeMesh, planeMesh, toursMesh);

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


const gui = new dat.GUI();

gui.add(material, 'metalness').min(0).max(1).step(.0001);
gui.add(material, 'roughness').min(0).max(1).step(.0001);
gui.add(material, 'aoMapIntensity').min(0).max(1).step(.0001);
gui.add(material, 'displacementScale').min(0).max(1).step(.0001);
gui.add(material, 'wireframe')