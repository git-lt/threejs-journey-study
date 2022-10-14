import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import stats from '../common/stats'
import * as dat from 'lil-gui'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry'
import { listenResize, dbClkfullScreen } from '../common/utils'


const gui = new dat.GUI()
const defaultSceneColor = 0x512da8;
const defaultText = 'Hello world'
const debugObj ={
  sceneColor: defaultSceneColor,
  text: defaultText,
  fullScreen: false,
  removeMesh(){},
  addMesh(){},
  showTextBounding: false,
}

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

const fontLoader = new FontLoader();
fontLoader.load('/public/assets/fonts/Fira Code Medium_Regular.json', font => {

  const textureLoader = new THREE.TextureLoader();
  const matcapTexture = textureLoader.load('/public/assets/textures/matcaps/1.png')
  const material = new THREE.MeshMatcapMaterial()
  material.matcap  = matcapTexture;

  let text: THREE.Mesh<TextGeometry, THREE.MeshMatcapMaterial>;
  const createText = (textInfo = defaultText) => {
    const textGeometry = new TextGeometry(textInfo, {
      font,
      size: .6,
      height: .3,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: .03,
      bevelSize: .02,
      bevelOffset: 0,
      bevelSegments: 3,
    })
    textGeometry.center();
    text = new THREE.Mesh(textGeometry, material);
    scene.add(text);
  }

  createText();

  // const box = new THREE.BoxHelper(text, 0xffff00);
  // scene.add(box);

  // 居中 

  // textGeometry.computeBoundingBox();
  // if(textGeometry.boundingBox){
  //   textGeometry.translate(
  //     -textGeometry.boundingBox.max.x * 0.5,
  //     -textGeometry.boundingBox.max.y * 0.5,
  //     -textGeometry.boundingBox.max.z * 0.5,
  //   )
  // }
  
  // 加些点缀
  const donutGeometry = new THREE.TorusGeometry(.3, .2, 20, 45);
  const boxGeometry = new THREE.BoxGeometry(.6, .6, .6);

  let meshArr: THREE.Mesh<THREE.BoxGeometry | THREE.TorusGeometry, THREE.MeshMatcapMaterial>[] = [];

  const createMesh = () => {
    let mesh;
    for(let i =0; i< 100; i++){
      if(i % 10 <=2){
        mesh = new THREE.Mesh(boxGeometry, material)
      }else{
        mesh = new THREE.Mesh(donutGeometry, material)
      }
      mesh.position.set(
        (Math.random() - .5) * 10,
        (Math.random() - .5) * 10,
        (Math.random() - .5) * 10,
      )
      // 欧拉随机旋转
      mesh.setRotationFromEuler(
        new THREE.Euler(
          Math.PI * Math.random(),
          Math.PI * Math.random(),
          Math.PI * Math.random(),
        )
      )
      const randomScale = Math.random() * .5 + .5;
      mesh.scale.set(randomScale, randomScale, randomScale)
      meshArr.push(mesh);
    }

    scene.add(...meshArr);
  }

  const removeMesh = () => {
    scene.remove(...meshArr);
    meshArr = [];
  }

  createMesh();

  gui.add(debugObj, 'text').onChange((e:string) => {
    scene.remove(text);
    createText(e);
  })

  gui.addColor(debugObj, 'sceneColor').onChange(e =>{
    scene.background = new THREE.Color(e)
  })

  debugObj.addMesh = () => {
    createMesh();
  }
  gui.add(debugObj, 'addMesh');
  debugObj.removeMesh = () => {
    removeMesh();
  }
  gui.add(debugObj, 'removeMesh');
})


// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect, 0.05, 100);
camera.position.set(2, 2, 2)
scene.add(camera)

// 显示原点
// const axesHelper = new THREE.AxesHelper(2);
// scene.add(axesHelper);

// 相机控制器
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = .4;

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



gui.add(controls, 'autoRotate')
gui.add(controls, 'autoRotateSpeed').min(.1).max(20).step(.001);