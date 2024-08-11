import anime from "animejs";
import * as THREE from "three";
import { TweenLite, Power4 } from "gsap";

class IndexSprite {
  constructor(stage, path, isDevice, listRoot, itemRoot) {
    this.stage = stage;
    this.isDevice = isDevice;
    this.ratio = 1;
    this.stage.name = "index";
    this.path = path;
    this.listRoot = listRoot;
    this.itemRoot = itemRoot;
    this.coef = 0;
    this.coefScroll = 1;
    this.strength = 0.5;
    this.isLoaded = false;
    this.uniforms = {
      uTexture: {
        //texture data
        value: null
      },
      uOffset: {
        //distortion strength
        value: new THREE.Vector2(0.0, 0.0)
      },
      uAlpha: {
        //opacity
        value: 0
      }
    };
    this.vs = `
      uniform vec2 uOffset;
      varying vec2 vUv;

      #define M_PI 3.1415926535897932384626433832795

      vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
        position.x = position.x + (sin(uv.y * M_PI) * offset.x);
        position.y = position.y + (sin(uv.x * M_PI) * offset.y);
        return position;
      }

      void main() {
        vUv = uv;
        vec3 newPosition = deformationCurve(position, uv, uOffset);
        gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
      }
    `;
    this.fs = `
      uniform sampler2D uTexture;
      uniform float uAlpha;
      uniform vec2 uOffset;

      varying vec2 vUv;

      vec3 rgbShift(sampler2D texture, vec2 uv, vec2 offset) {
        float r = texture2D(uTexture,vUv + uOffset).r;
        vec2 gb = texture2D(uTexture,vUv).gb;
        return vec3(r,gb);
      }

      void main() {
        vec3 color = rgbShift(uTexture,vUv,uOffset);
        gl_FragColor = vec4(color,uAlpha);
      }
    `;
    this.init();
  }

  init() {
    this._handleOrientation = this.handleOrientation.bind(this);
    this.width = document.documentElement.clientWidth;
    this.height = document.documentElement.clientHeight;

    //-------------------------------------------------------------------------------------
    // 3D Scene canvas
    //-------------------------------------------------------------------------------------

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      40,
      this.width / this.height,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 3);

    this.position = new THREE.Vector3(0, 0, 0);
    this.scale = new THREE.Vector3(1, 1, 1);
    this.speed = 0;
    this.mouse = { x: 0, y: 0 };

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setSize(this.width, this.height);
    this.stage.appendChild(this.renderer.domElement);

    this.planeHeight = this.visibleHeightAtZDepth(0, this.camera);
    this.planeWidth = this.visibleWidthAtZDepth(0, this.camera);

    this.listItems = this.getListItems({ selector: this.listRoot });
    this.addPlane({ items: this.listItems }).then(() => {
      this.isLoaded = true;
    });
    if (!this.listItems) {
      console.warn(
        "Could not find any listItems using the supplied root props. Please make sure they are correct."
      );
      return;
    }
    this.createEventsListeners({ items: this.listItems });

    this.mesh = this.createMesh();
    this.scene.add(this.mesh);

    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", this.onMouseMove.bind(this));
      window.addEventListener("resize", this.onWindowResize.bind(this), false);
    }
  }

  visibleHeightAtZDepth(depth, camera) {
    const cameraOffset = camera.position.z;
    if (depth < cameraOffset) depth -= cameraOffset;
    else depth += cameraOffset;

    const vFOV = (camera.fov * Math.PI) / 180;
    return 2 * Math.tan(vFOV / 2) * Math.abs(depth);
  }

  visibleWidthAtZDepth(depth, camera) {
    const height = this.visibleHeightAtZDepth(depth, camera);
    return height * camera.aspect;
  }

  getListItems({ selector }) {
    this.listWrapper = document.querySelector(selector);
    const listItems = this.listWrapper
      ? [...this.listWrapper.querySelectorAll(this.itemRoot)]
      : [];

    return listItems.map((item, index) => ({
      element: item,
      img: item.querySelector("img") || null,
      index: index
    }));
  }

  getGeometry() {
    const {
      radius = 0.5,
      segments = 64,
      width = 1,
      height = 1,
      segmentsWidth = 32,
      segmentsHeight = 32
    } = {};

    return new THREE.CircleBufferGeometry(radius, segments);
    // return new THREE.PlaneBufferGeometry(width, height, segmentsWidth, segmentsHeight);
  }

  loadTexture(loader, url, index) {
    return new Promise((resolve, reject) => {
      if (!url) {
        resolve({ texture: null, index });
        return;
      }
      loader.load(
        url,
        texture => {
          resolve({ texture, index });
        },
        undefined,
        error => {
          console.error("An error happened.", error);
          reject(error);
        }
      );
    });
  }

  createMesh() {
    this.uniforms = {
      uTexture: {
        //texture data
        value: null
      },
      texture: {
        type: "t",
        value: this.texture
      },
      uOffset: {
        value: new THREE.Vector2(0.0, 0.0)
      },
      uAlpha: {
        value: 0
      }
    };
    this.geometry = this.getGeometry();
    return new THREE.Mesh(
      this.geometry,
      new THREE.ShaderMaterial({
        uniforms: this.uniforms,
        vertexShader: this.vs,
        fragmentShader: this.fs
      })
    );
  }

  addPlane({ items }) {
    let promises = [];

    const THREEtextureLoader = new THREE.TextureLoader();
    items.forEach((item, index) => {
      promises.push(
        this.loadTexture(
          THREEtextureLoader,
          item.img ? item.img.src : null,
          index
        )
      );
    });

    return new Promise((resolve, reject) => {
      Promise.all(promises).then(promises => {
        promises.forEach((promise, index) => {
          items[index].texture = promise.texture;
        });
        resolve();
      });
    });
  }

  _onMouseLeave(event) {
    this.isMouseOver = false;
    this.onMouseLeave(event);
  }

  _onMouseMove(event) {
    this.mouse.x = (event.clientX / this.width) * 2 - 1;
    this.mouse.y = -(event.clientY / this.height) * 2 + 1;

    this.onMouseMove(event);
  }

  _onMouseOver(index, event) {
    this.onMouseOver(index, event);
  }

  onMouseLeave(event) {
    TweenLite.to(this.uniforms.uAlpha, 0.5, {
      value: 0,
      ease: Power4.easeOut
    });
    // this.stage.style.display = "none";
    this.canvahide();
  }

  onMouseMove(event) {
    let x = ((this.mouse.x + 1) * ((2 * Math.tan(((this.camera.fov * Math.PI) / 180) / 2) * (this.camera.position.z)) * (this.width / this.height))) / 2 + (-((2 * Math.tan(((this.camera.fov * Math.PI) / 180) / 2) * (this.camera.position.z)) * (this.width / this.height)) / 2);
    let y = ((this.mouse.y + 1) * (2 * Math.tan(((this.camera.fov * Math.PI) / 180) / 2) * (this.camera.position.z))) / 2 + (-((2 * Math.tan(((this.camera.fov * Math.PI) / 180) / 2) * (this.camera.position.z))) / 2);
    this.position = new THREE.Vector3(x, y, 0);
    TweenLite.to(this.mesh.position, 1, {
      x: x,
      y: y,
      ease: Power4.easeOut,
      onUpdate: this.onPositionUpdate.bind(this)
    });
  }

  onMouseOver(index, e) {
    if (!this.isLoaded) return;
    this.onMouseEnter();
    if (this.currentItem && this.currentItem.index === index) return;
    this.onTargetChange(index);
  }

  onMouseEnter() {
    if (!this.currentItem || !this.isMouseOver) {
      this.isMouseOver = true;
      // this.stage.style.display = "block";
      this.canvashow();
      // show plane
      TweenLite.to(this.uniforms.uAlpha, 0.5, {
        value: 1,
        ease: Power4.easeOut
      });
    }
  }

  onPositionUpdate() {
    let offset = this.mesh.position
      .clone()
      .sub(this.position)
      .multiplyScalar(-this.strength);
    this.uniforms.uOffset.value = offset;
  }

  onTargetChange(index) {
    this.currentItem = this.listItems[index];
    if (!this.currentItem.texture) return;

    this.uniforms.uTexture.value = this.currentItem.texture;

    let imageRatio =
      this.currentItem.img.naturalWidth / this.currentItem.img.naturalHeight;

    this.scale = new THREE.Vector3(imageRatio, 1, 1);
    this.mesh.scale.copy(this.scale);
  }

  createEventsListeners({ items }) {
    items.forEach((item, index) => {
      item.element.addEventListener(
        "mouseover",
        this._onMouseOver.bind(this, index),
        false
      );
    });

    this.listWrapper.addEventListener(
      "mousemove",
      this._onMouseMove.bind(this),
      false
    );

    this.listWrapper.addEventListener(
      "mouseleave",
      this._onMouseLeave.bind(this),
      false
    );
  }

  onWindowResize() {
    if (typeof window !== `undefined`) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(this.width, this.height);
      location.reload();
    }
  }

  animate() {
    this.renderer && this.renderer.render(this.scene, this.camera);
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
  }

  handleOrientation(event) {
    var x = event.beta - 35,
      y = event.gamma;
    this.orientationX = y / 180;
    this.orientationY = x / 180;
  }

  tick(scrollTop, mouseX, mouseY, easeSlowX, easeSlowY) {
    if (!this.stage.style.display) return;
    const posX = this.isDevice
      ? this.orientationX || 0.1
      : easeSlowX / this.width - 0.5;
    const posY = this.isDevice
      ? this.orientationY || 0.1
      : easeSlowY / this.height - 0.5;
    this.coefScroll = 1 - scrollTop / (this.height / 2 + this.logoH / 2);
    if (!this.isDevice) this.stage.style.top = -scrollTop + "px";
  }

  canvashow() {
    anime({
      targets: this.stage,
      opacity: [0, 1],
      alpha: 1,
      easing: "easeOutQuint",
      duration: 250
    });
  }

  canvahide() {
    anime({
      targets: this.stage,
      opacity: [1, 0],
      alpha: 0,
      easing: "easeOutQuint",
      duration: 250
    });
  }

  show() {
    if (this.isDevice)
      window.addEventListener("deviceorientation", this._handleOrientation, {
        passive: true
      });
    anime({
      targets: this.renderer.domElement,
      opacity: [0, 1],
      alpha: 1,
      easing: "easeOutQuad",
      duration: 500,
      begin: () => {
        this.stage.style.display = "block";
      },
      update: () => {}
    });
  }

  hide() {
    if (this.isDevice)
      window.removeEventListener("deviceorientation", this._handleOrientation);
    anime({
      targets: this.renderer.domElement,
      opacity: [1, 0],
      alpha: 0,
      easing: "easeOutQuad",
      duration: 800,
      complete: () => {
        this.stage.style.display = "none";
      }
    });
  }

  resize(w, h) {
    if (w && w) {
      this.width = w;
      this.height = h;
    }
    this.ratio = Math.min(
      this.isDevice ? this.height / 1100 : this.width / 1360,
      1
    );
  }

  destroy() {
    this.stage.innerHTML = "";
  }
}

export default IndexSprite;