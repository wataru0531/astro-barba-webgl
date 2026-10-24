

// ModelObクラス
// → 3Dモデル用のクラス

// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
// ObModelクラスの確認
// world.jsのinitObの条件分岐


import { PlaneGeometry, ShaderMaterial, Mesh, Vector2 } from "three";

import loader from "../components/loader";
import { utils, viewport, INode } from "../helper";
import gsap from "gsap";

class ModelOb {
  static async init({ el, type }) {
    // ① HTML要素に指定されたglTFモデルを取得
    const models = await loader.getModelByElement(el);

    // ② ModelObをインスタンス化
    return new this({ el, type, models });
  }

  constructor({ el, type, models }) {
    this.$ = { el };
    this.models = models;

    // HTML要素の位置を取得
    this.rect = this.originalRect = INode.getRect(el);

    // ③ glTFオブジェクトを取得
    const gltf = this.models.get("model1");

    if (!gltf) {
      this.mesh = null;
      return;
    }

    // ④ glTFのsceneをmeshとして保持
    this.mesh = gltf.scene;

    // どのWebGLオブジェクトか識別する
    this.mesh.__marker = type;

    // ⑤ 初期位置を設定
    const { x, y } = this.getWorldPosition(
      this.rect,
      viewport
    );

    this.mesh.position.set(x, y, 0);
  }

  getWorldPosition(rect, canvasRect) {
    const x =
      rect.left + rect.width / 2 - canvasRect.width / 2;

    const y =
      -rect.top - rect.height / 2 + canvasRect.height / 2;

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

export default ModelOb;