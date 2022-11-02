## 纹理绘制方式

更改中心点
colorTexture.center = new THREE.Vector2(0.5, 0.5)

设置偏移
colorTexture.offset.x = 0.5

设置重复次数
colorTexture.repeat.x = 2

设置旋转
colorTexture.rotation = Math.PI / 4

重复平铺
colorTexture.wrapT = THREE.RepeatWrapping;

不重复，纹理边缘拉伸到网格边缘
colorTexture.wrapT = THREE.ClampToEdgeWrapping;

重复平铺，每次都镜像
colorTexture.wrapT = THREE.MirroredRepeatWrapping;

## 缩放滤镜设置

// 缩小滤镜 规则设置：清晰锐利
// LinearMipmapNearestFilter 近清晰，远模糊
// colorTexture.minFilter = THREE.NearestFilter;
// LinearFilter 默认值
// colorTexture.minFilter = THREE.LinearFilter;

// 放大滤镜
colorTexture.magFilter = THREE.NearestFilter;

使用 colorTexture.generateMipmaps = false 这个属性会禁止生成 Mipmaps，缩小过滤和放大过滤都会默认为 NearestFilter。


## 图片格式

jpg 较大的失真压缩，但体积更小
png 较小的失真压缩，但体积更大


颜色类 THREE.Color

```js
//empty constructor - will default white
const color1 = new THREE.Color();

//Hexadecimal color (recommended)
const color2 = new THREE.Color( 0xff0000 );

//RGB string
const color3 = new THREE.Color("rgb(255, 0, 0)");
const color4 = new THREE.Color("rgb(100%, 0%, 0%)");

//X11 color name - all 140 color names are supported.
//Note the lack of CamelCase in the name
const color5 = new THREE.Color( 'skyblue' );

//HSL string
const color6 = new THREE.Color("hsl(0, 100%, 50%)");

//Separate RGB values between 0 and 1
const color7 = new THREE.Color( 1, 0, 0 );
```


MeshStandardMaterial 的扩展，提供了更高级的基于物理的渲染属性：


Clearcoat: 有些类似于车漆，碳纤，被水打湿的表面的材质需要在面上再增加一个透明的，具有一定反光特性的面。而且这个面说不定有一定的起伏与粗糙度。Clearcoat 可以在不需要重新创建一个透明的面的情况下做到类似的效果。


基于物理的透明度:.opacity属性有一些限制:在透明度比较高的时候，反射也随之减少。使用基于物理的透光性.transmission属性可以让一些很薄的透明表面，例如玻璃，变得更真实一些。


高级光线反射: 为非金属材质提供了更多更灵活的光线反射。


## Light

灯光会非常消耗性能，应尽量减少灯光使用

可投射阴影的灯光

- 平行光：DirectionalLight
- 点光源：PointLight
- 聚光灯：SpotLight

影响整体的灯光

- 环境光：AmbientLight
- 半球光：HemisphereLight
- 平行光：DirectionalLight

### Baking 烘焙光照
原理是将光照烘焙到贴图纹理(Texture)中，这个过程可以在 3D 建模软件中实现。但不足的是，不能移动光线，因为根本没有光，都是再贴图纹理中


### 真实的物理效果

1. 设置环境贴图
2. 开启阴影
3. 渲染器开启正确的光照模式 `renderer.physicallyCorrectLights = true`
4. 渲染器输入编码设置 `renderer.outputEncoding = THREE.sRGBEncoding`
5. 环境纹理编码设置 `environmentMap.encoding = THREE.sRGBEncoding`
6. 设置色调映射模式 `renderer.toneMapping = THREE.ReinhardToneMapping`
7. 设置色调映射曝光级别 `renderer.toneMappingExposure = 2.5`
8. 开启抗锯齿 


开启阴影

渲染器

```js
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
```

灯光

```js
directionLight.castShadow = true
directionLight.shadow.camera.far = 15
directionLight.shadow.mapSize.set(1024, 1024)
directionLight.shadow.normalBias = 0.05
```

物体

```js
mesh.castShadow = true
mesh.receiveShadow = true
```


开启抗锯齿 

```js
// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
})
```

给材质设置环境贴图

```js
scene.traverse((child) => {
  if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
    console.log(child)
    child.material.envMap = environmentMap
    child.material.envMapIntensity = debugObject.envMapIntensity
  }
})
```




