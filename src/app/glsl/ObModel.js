

// ObModelクラス
// → 3Dモデル用のクラス

// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから

// ObModelクラスの作成、確認
// world.jsのinitObの条件分岐

// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
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
    // ① HTML要素に指定されたglTFモデルを取得
    const models = await loader.getModelsByElement(el);
    // console.log(models); // Map(2) {'model1' => {…}, 'model2' => {…}}

    // ② ObModelをインスタンス化
    const o = new this({ el, type, models });
    return o;
  }

  constructor({ el, type, models }) {
    this.$ = { el };
    this.models = models;
    this.meshes = []; 

    this.scale = { width: 1, height: 1, depth: 1 };
    this.resizing = false;
    this.rect = this.originalRect = INode.getRect(el); // HTML要素の位置を取得
    this.scrollVelocity = 0;

    // glTFオブジェクトを取得
    // console.log(this.models); // {"model1" => Object}
    // const gltf = this.models.get("model1");
    // const gltf = this.models.values().next().value;
    // console.log(gltf); // {scene: Group, scenes: Array(1), animations: Array(0), cameras: Array(0), asset: {…}, …}

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

  // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
  // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
  // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから






  getWorldPosition(rect, canvasRect) {
    const x = rect.left + rect.width / 2 - canvasRect.width / 2;
    const y = -rect.top - rect.height / 2 + canvasRect.height / 2;
    return { x, y };
  }

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

  async resize() {
    this.scroll();
  }

  setScrollVelocity(velocity) {
    this.scrollVelocity = velocity;
  }
}

export { ObModel };