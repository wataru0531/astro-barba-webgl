

// ObModelクラス
// → 3Dモデル用のクラス
//   テクスチャも渡す

// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
// world.os.push(_o); をすることで、Barbaが破綻している。
// 3Dモデルのシーン挿入までの確認
// ObModelの確認
// 各3Dモデルの各ファイルでの独自の実装

import { PlaneGeometry, ShaderMaterial, Mesh, Vector2 } from "three";

import loader from "../components/loader";
import { utils, viewport, INode } from "../helper";
import gsap from "gsap";


class ObModel {
  static async init({ el, type }) {
    const texes = await loader.getTexByElement(el);
    // console.log(texes); // Map(1) {'tex1' => _Texture}
    const models = await loader.getModelsByElement(el); // HTML要素に指定されたglTFモデルを取得
    // console.log(models); // Map(2) {'model1' => {…}, 'model2' => {…}}

    // ② ObModelをインスタンス化
    const o = new this({ el, type, texes, models });
    return o;
  }

  constructor({ el, type, texes, models }) {
    this.$ = { el };
    this.texes = texes ?? [];
    this.models = models;
    this.meshes = []; 

    this.scale = { width: 1, height: 1, depth: 1 };
    this.resizing = false;
    this.rect = this.originalRect = INode.getRect(el); // HTML要素の位置を取得
    this.scrollVelocity = 0;

    // if (!this.rect.width || !this.rect.height) {
    //   // 幅・高さがない場合はエラーログ
    //   if (window.debug) {
    //     console.log("要素に幅と高さの設定がないため、meshの作成をスキップ", this.$.el);
    //   }
    //   return {};
    // }

    for(const [ key, gltf ] of this.models) {
      const mesh = gltf.scene;
      // console.log(key); // model1 model2
      mesh.__marker = type;
      mesh.__modelKey = key;

      this.meshes.push(mesh);
    }
    // console.log(this.meshes); // (2) [Group, Group]
    // → 複数のシーンが入る。

    // if(!gltf) {
    //   this.mesh = null;
    //   return;
    // }

    // ④ glTFのsceneをmeshとして保持
    // this.mesh = gltf.scene;

    // どのWebGLオブジェクトか識別する
    // this.mesh.__marker = type;

    // ⑤ 初期位置を設定
    const { x, y } = this.getWorldPosition(
      this.rect,
      viewport
    );

    // this.mesh.position.set(x, y, 0);
    try {
      this.beforeCreateMesh();
      this.defines = this.setupDefines();
      this.uniforms = this.setupUniforms();
      this.uniforms = this.setupTexes(this.uniforms);
      this.uniforms = this.setupResolution(this.uniforms);

    } catch(e) {

    }
  }

  beforeCreateMesh() {}

  setupDefines() {
    return {
      PI: Math.PI,
    }
  }

  setupUniforms() {
    return {
      uTick: { value: 0 },
      uMouse: { value: new Vector2( 0.5, 0.5) },
      uAlpha: { value: 0 },
      uHover: { value: 0 },
      uProgress: { value: 0 },
    }
  }

  setupTexes(_uniforms) {
    this.texes.forEach((tex, key) => {
      _uniforms[key] = { value: tex };
    });

    return _uniforms;
  }

  setupGeometry() {
    return new PlaneGeometry(this.rect.width, this.rect.height, 1, 1);
  }

  setupMaterial() {
    return new ShaderMaterial({
      defines: this.defines,
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: this.uniforms,
      transparent: true,
      alphaTest: .5, // 透明度をどれだけ厳密に見るか(.5以下の透明度は無視)
      // onBeforeCompile
      // → シェーダーのコンパイル直前に呼び出されるコールバック関数
      //   引数のshaderはThreeが自動で付与。onAfterRenderなどのコールバックもある。
      onBeforeCompile: this.onBeforeCompile, // WebGL1.0への対応。
    });
  }

  // WebGL1.0への対応
  onBeforeCompile(shader) {
    // console.log(shader); // { isWebGL2: true, shaderID: undefined, shaderName: 'ShaderMaterial', vertexShader: '#define GLSLIFY 1\nvarying vec2 vUv;\nvoid main(){\nv…ctionMatrix*modelViewMatrix*vec4(position,1.);\n}\n', fragmentShader: '#define GLSLIFY 1\nvec3 mod289(vec3 x){\nreturn x-fl…=vec4(rgb,t1.a*uProgress);\ngl_FragColor=color;\n}\n', …}

    if (shader.isWebGL2) return; // WebGL 2.0の場合、変更は不要

    // WebGL1.0の場合はtexture関数が見つからないため、texture2Dに置換
    shader.vertexShader = shader.vertexShader.replace(/texture\(/g, "texture2D(");
    shader.fragmentShader = shader.fragmentShader.replace(/texture\(/g, "texture2D(");
  }

  setupVertex() {
    throw new Error("このメソッドはオーバーライドして使用してください。");
  }

  setupFragment() {
    throw new Error("このメソッドはオーバーライドして使用してください。");
  }

  // html要素とテクスチャのアスペクト比を比較して、、修正する値を返す
  // tex1のみ取得できればアスペクト比を計算できるためtex1のみ取得
  setupResolution(uniforms) {
    // テクスチャを使ってない場合はもともとのuniformsを返して終了
    if (!this.texes.get("tex1")) return uniforms;

    // source.data ... TextureLoaderでテクスチャとしたもとのデータ
    // 　　　　　　　　 　実際のソースデータを指す。
    //                 これは通常、HTMLImageElementやHTMLVideoElementなどのDOM要素
    // console.log(this.texes); // Map(3) {'tex1' => Texture, 'tex2' => Texture, 'texDisp' => Texture}
    // console.log(this.texes.get("tex1")); // Texture {isTexture: true, uuid: '2591e714-e8fb-4fa1-8a3a-719085d5d2f2', name: '', source: Source, mipmaps: Array(0), …}
    const media = this.texes.get("tex1").source.data;
    // console.log(media)

    const mediaRect = {}; // 画像、動画自体のサイズ
    // console.log(mediaRect)

    if (media instanceof HTMLImageElement) {
      // 画像
      mediaRect.width = media.naturalWidth;
      mediaRect.height = media.naturalHeight;
    } else if (media instanceof HTMLVideoElement) {
      // 動画
      mediaRect.width = media.videoWidth;
      mediaRect.height = media.videoHeight;
    }
    // console.log(mediaRect); // {width: 1024, height: 682}

    // アスペクト比を算出 this.rect → htmlのタグのサイズ、mediaRect → 画像・動画自体のサイズ
    const resolution = utils.getResolutionUniforms(this.rect, mediaRect);

    uniforms.uResolution = { value: resolution };
    // console.log(uniforms.uResolution); // value : Vector4 {x: 600, y: 400, z: 0.75, w: 1}

    return uniforms;
  }

  setupMesh() {
    return new Mesh(this.geometry, this.material);
  }

  disableOriginalElem() {
    this.$.el.draggable = false;
    this.$.el.style.opacity = 0;
  }

  // async resize(_duration = 1) {
  //   // メッシュの位置とサイズの更新
  //   this.resizing = true;
  //   const { mesh, originalRect } = this; // originalRect 元々のサイズ
  //   // console.log(this);

  //   this.setupResolution(this.uniforms); // テクスチャのアスペクト更新

  //   const nextRect = INode.getRect(this.$.el); // 新しく取得したHTML要素
  //   // console.log(rect)
  //   const { x, y } = this.getWorldPosition(nextRect, viewport);
  //   // console.log(y)

  //   // gsapが完了したらthis.rectを更新する
  //   // → 連続でresizeが発火し続けた場合などに、アニメーションが終わる前に
  //   //   this.rectを更新されたりして、位置や大きさが意図しないものとなってしまう。
  //   const p1 = new Promise((onComplete) => {
  //     // 位置の変更
  //     gsap.to(mesh.position, {
  //       // 位置
  //       x: x,
  //       y: y,
  //       // 何度も発火すると前のアニメーションと重複してしまうの
  //       // → 前に走っていたアニメーションはキャンセルする
  //       overwrite: true,
  //       duration: _duration,
  //       onComplete,
  //     });
  //   });

  //   // サイズ ... 古いオブジェクトの大きさで割ることで、新しいオブジェクトの比を割り出せる。z軸は今回は1にしておく。
  //   const p2 = new Promise((onComplete) => {
  //     gsap.to(this.scale, {
  //       width: nextRect.width / originalRect.width,
  //       height: nextRect.height / originalRect.height,
  //       depth: 1,
  //       overwrite: true,
  //       duration: _duration,

  //       onUpdate: () => {
  //         mesh.scale.set(this.scale.width, this.scale.height, this.scale.depth);
  //       },
  //       onComplete,
  //     });
  //   });

  //   await Promise.all([p1, p2]);

  //   this.rect = nextRect; // oを更新
  //   this.resizing = false;
  // }

  getWorldPosition(rect, canvasRect) {
    const x = rect.left + rect.width / 2 - canvasRect.width / 2;
    const y = -rect.top - rect.height / 2 + canvasRect.height / 2;
    return { x, y };
  }

  scroll() {
    if(this.fixed) return;

    const { $: { el }, mesh } = this;
    const rect = INode.getRect(el);
    const { x, y } = this.getWorldPosition(rect, viewport);

    mesh.position.x = x;
    mesh.position.y = y;
  }

  setScrollVelocity(_scrollVelocity) {
    this.scrollVelocity = _scrollVelocity;
    // console.log(this.scrollVelocity);
  }

  // ⭐️これから⭐️これから⭐️これから⭐️これから⭐️これから⭐️これから
  // ⭐️これから⭐️これから⭐️これから⭐️これから⭐️これから⭐️これから
  // ⭐️これから⭐️これから⭐️これから⭐️これから⭐️これから⭐️これから


  // world側から呼び出されるメソッド
  render(tick) {}

  async afterInit() {}

  scroll() {
    if (!this.mesh) return;

    const rect = INode.getRect(this.$.el);
    const { x, y } = this.getWorldPosition(rect, viewport);

    this.mesh.position.x = x;
    this.mesh.position.y = y;
  }

  setScrollVelocity(velocity) {
    this.scrollVelocity = velocity;
  }
}

export { ObModel };