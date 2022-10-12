import { PerspectiveCamera, WebGLRenderer } from 'three'

/**
 * 监听窗口大小，重置相机和渲染器
 */
export const listenResize = (
  sizes: {
    width: number,
    height: number,
  },
  camera: PerspectiveCamera,
  renderer: WebGLRenderer
) => {
  window.addEventListener('resize', () => {
    sizes.height = window.innerHeight;
    sizes.width = window.innerWidth;

    camera.aspect = sizes.width/sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,))
  })
}

/**
 * 双击全屏
 */
export const dbClkfullScreen = (canvas: HTMLElement) => {
  window.addEventListener('dblclick', () => {
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement;
    const exitFullscreenFn = document.exitFullscreen || document.webkitExitFullscreen;
    const requestFullscreenFn = canvas.requestFullscreen || canvas.webkitRequestFullscreen;
  
    fullscreenElement ? exitFullscreenFn.call(document) : requestFullscreenFn.call(canvas);
  })
  
}