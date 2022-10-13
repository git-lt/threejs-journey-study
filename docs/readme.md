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