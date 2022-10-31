import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import stats from '../common/stats'
import * as dat from 'lil-gui'
import { listenResize } from '../common/utils'

// Gui
const gui = new dat.GUI()

const sizes ={
  width: window.innerWidth,
  height: window.innerHeight
}
const aspect = sizes.width/sizes.height;

// Canvas
const canvas = document.querySelector('canvas.webgl') as HTMLCanvasElement;

// Scene
const scene = new THREE.Scene();

// Lights
// 环境光：无阴影，整体亮度
const ambientLight = new THREE.AmbientLight('#b9d5ff', .3);
scene.add(ambientLight);

// 平行光：可投射阴影 (用于模拟太阳光, 来自无穷远，照射无穷远)
const directionalLight = new THREE.DirectionalLight('#ffffff', .8);
directionalLight.position.set(5, 5, 6)
directionalLight.castShadow = true;
directionalLight.shadow.camera.near = 1;
directionalLight.shadow.camera.far = 20;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.bottom = -10;
directionalLight.shadow.camera.left = -10
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
scene.add(directionalLightHelper)

// 透视相机
const camera = new THREE.PerspectiveCamera(75, aspect, .1, 100);
camera.position.set(4, 4, 16)
scene.add(camera)

// 渲染器
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor('#262837')
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true;
controls.zoomSpeed = .3;
controls.autoRotate = true;
controls.target = new THREE.Vector3(0, 3, 0)

// 屏幕自适应
listenResize(sizes, camera, renderer);

// 平面
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(15, 15),
  new THREE.MeshStandardMaterial({ color: '#607d88' })
)
plane.rotateX(-Math.PI / 2)
plane.receiveShadow = true;
scene.add(plane);

/**
 * Models
 */
 let surveyWeight = 0
 let walkWeight = 0
 let runWeight = 0
let model: THREE.Group;
let mixer: THREE.AnimationMixer;
let skeleton: THREE.SkeletonHelper;
let actionSurvey: THREE.AnimationAction;
let actionWalk: THREE.AnimationAction;
let actionRun: THREE.AnimationAction;

const gltfLoader = new GLTFLoader();
gltfLoader.load(
  '/public/assets/models/Fox/glTF/Fox.gltf',
  gltf => {
    model = gltf.scene;
    model.scale.set(.03, .03, .03);
    scene.add(model)

    model.traverse((obj:any) => {
      if(obj.isMesh){
        obj.castShadow = true;
      }
    })

    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = false;
    scene.add(skeleton)

    mixer = new THREE.AnimationMixer(gltf.scene);
    actionSurvey = mixer.clipAction(gltf.animations[0]);
    actionWalk = mixer.clipAction(gltf.animations[1])
    actionRun = mixer.clipAction(gltf.animations[1])
    actionWalk.setEffectiveWeight(0);
    actionRun.setEffectiveWeight(0);
    actionSurvey.play();
    actionWalk.play();
    actionRun.play();

    createGUIPanel()
  }
)

const createGUIPanel = () => {
  gui.add(directionalLightHelper, 'visible').name('lightHelper visible');
  gui.add(controls, 'autoRotate')
  gui.add(model, 'visible').name('model visible')
  gui.add(skeleton, 'visible').name('skeleton visible');

  // 动作过滤
  const executeCrossFade = (
    startAction: THREE.AnimationAction | null,
    endAction: THREE.AnimationAction | null,
    duration = 1
  ) => {
    if(!startAction || !endAction) return;

    endAction.enabled = true;
    endAction.time = 0;
    endAction.setEffectiveTimeScale(1);
    endAction.setEffectiveWeight(1);
    startAction.crossFadeTo(endAction, duration, true);
  }

  const guiObj = {
    surveyToWalk: () => {
      executeCrossFade(actionSurvey, actionWalk)
    },
    walkToRun: () => {
      executeCrossFade(actionWalk, actionRun)
    },
    runtToWalk: () => {
      executeCrossFade(actionRun, actionWalk)
    },
    walkToSurvey: () => {
      executeCrossFade(actionWalk, actionSurvey)
    }
  }

  const animationFolder = gui.addFolder('Animation');
  animationFolder.add(guiObj, 'surveyToWalk')
  animationFolder.add(guiObj, 'walkToRun')
  animationFolder.add(guiObj, 'runtToWalk')
  animationFolder.add(guiObj, 'walkToSurvey')
}


/**
 * TICK
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
  stats.begin();
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime  - previousTime;
  previousTime = elapsedTime;

  if(mixer){
    mixer.update(deltaTime);

    if(actionSurvey){
      surveyWeight = actionSurvey.getEffectiveWeight();
    }
    if(actionWalk){
      walkWeight = actionWalk.getEffectiveWeight();
    }
    if(actionRun){
      runWeight = actionRun.getEffectiveWeight()
    }

    const animationFolder = gui.children[5] as dat.GUI;
    
    (animationFolder.children[0] as dat.Controller).disable(surveyWeight !== 1);
    (animationFolder.children[1] as dat.Controller).disable(walkWeight !== 1);
    (animationFolder.children[2] as dat.Controller).disable(runWeight !== 1);
    (animationFolder.children[3] as dat.Controller).disable(walkWeight !== 1);
  }

  
  controls.update();
  renderer.render(scene, camera)
  stats.end();
  requestAnimationFrame(tick)
}

tick();

gui.add(controls, 'autoRotate')
