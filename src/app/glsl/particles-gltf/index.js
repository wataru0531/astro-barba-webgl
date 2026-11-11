/**************************************************************

⭐️ particles-gltf テスト用のファイル

// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから

// メッシュの確認から

***************************************************************/
import { 
  BufferGeometry,
  Color,
  Float32BufferAttribute,
  Points,
  ShaderMaterial,
  Vector2,
  
} from "three";

import { ObModel } from "../ObModel";

//
import vertexShader   from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { Uniform } from "three";
import { AdditiveBlending } from "three";


// ObModelクラスを継承したクラスを作成。
export default class extends ObModel{

  beforeCreateMesh() {
    this.colorA = "#ff7300";
    this.colorB = "#0091ff";
  }

  // ✅ モデル(scene)のmaterialをそのまま表示するかそうか。
  // → そのまま表示ならfalse。
  //   そのまま使わず、ShaderMaterialをあてて使うならtrue.
  useShaderMaterial() {
    return true;
  }

  // ✅ モデル(scene)が持つ独自のGeometryを使うかどうか。
  // → 使うなら、true
  useCustomGeometry() {
    return true;
  }

  // ✅ 3Dモデルのマテリアルに、独自のShaderMaterialを適用する。
  // Group → 複数の3Dオブジェクトをまとめる親
  // Object3D →	Three.jsの3Dオブジェクトの基本クラス
  // Bone →	3Dモデルの骨格
  // SkinnedMesh → Boneによって変形するMeshのこと。
  //               たとえば、背骨のBoneが動いたとしたらきつねの形状が変化する・
  //               この仕組みを実現するのがSkinnedMesh。
  applyShaderMaterial(_root) {
    // console.log(_root); // Group {isObject3D: true, uuid: '8c3a6c4d-e9e1-441a-99ab-db44dfce7a37', name: '', type: 'Group', parent: null, …}
    // → _rootは、gltf.scene のこと。

    // traverse → gltfオブジェクトモデルは階層構造になっていてさまざまなオブジェクトがある
    //            奥深くにメッシュがある可能性もある。
    // 　　　　　　その中からMeshだけを見つけて、独自のShaderMaterialに変更するために使う
    // 子・孫・ひ孫といった階層の深いところにあるオブジェクトまで再帰的に探索可能
    _root.traverse((child) => {
      // console.log(child);
      if (!child.isMesh) return; // ThreeのMesh以外はスキップ
      // console.log(child); // SkinnedMesh {isObject3D: true, uuid: 'c800e23c-545b-4296-9e2a-babfdbd942fe', name: 'fox', type: 'SkinnedMesh', parent: _Object3D, …}

      // 元のgeometryはそのまま使い、materialだけを独自のShaderMaterialに変更
      child.material = this.setupMaterial();
    });
  }

  // ✅ glTFのgeometryに独自のカスタマイズする処理
  applyCustomGeometry(_root){
    // console.log(_root); // Group {isObject3D: true, uuid: '323cb6b5-1a1f-42a1-8e25-e816fbf75527', name: '', type: 'Group', parent: null, …}

    // 拡大する
    // _root.scale.set(50, 50, 50);
    // _root.scale.multiplyScalar(50);

    // particlesの初期設定
    // this.particles = {}; // ✅ geometry、materialなどパーティクルのデータを格納していく
    // const particles = this.particles;
    const particles = {};
    particles.index = 0;

    //  glTFのMeshから頂点を取得
    const meshes = [];
    _root.traverse(child => {
      if(!child.isMesh) return;

      meshes.push(child);
    });
    // console.log(meshes); // (4) [Mesh, Mesh, Mesh, Mesh]

    const positions = meshes.map(child => child.geometry.attributes.position);
    // console.log(positions); // (4) [BufferAttribute, BufferAttribute, BufferAttribute, BufferAttribute]

    // 最大超点数を取得　→ メッシュの携帯を変化させるには同じ超点数に合わせる必要があるため
    particles.maxCount = 0;

    for(const position of positions) {
      if(position.count > particles.maxCount) {
        particles.maxCount = position.count;
      }
    }
    // console.log(particles.maxCount); // 10242

    // 超点数を統一していく
    particles.positions = [];

    for(const position of positions) {
      const originalArray = position.array;
      // console.log(originalArray); 
      // Float32Array(29928), Float32Array(23874), Float32Array(30726), Float32Array(28566)

      const newArray = new Float32Array(particles.maxCount * 3);
      for(let i = 0; i < particles.maxCount; i++) {
        const i3 = i * 3;

        if(i < position.count) {
          newArray[i3 + 0] = originalArray[i3 + 0];
          newArray[i3 + 1] = originalArray[i3 + 1];
          newArray[i3 + 2] = originalArray[i3 + 2];
        } else {
          const randomIndex = Math.floor(position.count * Math.random()) * 3;

          newArray[i3 + 0] = originalArray[randomIndex + 0];
          newArray[i3 + 1] = originalArray[randomIndex + 1];
          newArray[i3 + 2] = originalArray[randomIndex + 2];
        }
      }

      particles.positions.push(new Float32BufferAttribute(newArray, 3));
    }
    // console.log(particles.positions); // (4) [Float32BufferAttribute, Float32BufferAttribute, Float32BufferAttribute, Float32BufferAttribute]
    // → すべての頂点が 30726 に統一される

    // aSizeを生成していく → 0 〜 1 の範囲
    const sizesArray = new Float32Array(particles.maxCount);
    for(let i = 0; i < particles.maxCount; i++) {
      sizesArray[i] = Math.random();
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", particles.positions[particles.index]); // モーフィングの最初のインデックス
    geometry.setAttribute("aPositionTarget", particles.positions[particles.positions.length - 1]); // ✅ 移動先の座標(ターゲット)。最後のモーフィングの頂点
    geometry.setAttribute("aSize", new Float32BufferAttribute(sizesArray, 1)); // ランダムな 0 〜 1の少数

    return {
      geometry,
      positions: particles.positions,
      maxCount: particles.maxCount,
    }
  }

  // ✅ Pointsを生成するための処理
  createParticles(_root) {
    // GLTFモデルからGeometryなどを取得
    const { geometry, positions, maxCount } = this.applyCustomGeometry(_root);
    // console.log(geometry);

    // パーティクル用Materialを生成
    const material = this.setupMaterial();
    // console.log(material);

    // Pointsを生成
    const points = new Points(geometry, material);
    // console.log(points); // Points {isObject3D: true, uuid: '3e8b743c-aee9-470a-9407-ddecd21832e4', name: '', type: 'Points', parent: null, …}

    points.frustumCulled = false;

    // 必要に応じて保持しておく
    this.particlePositions = positions;
    this.particleMaxCount = maxCount;

    // 最終的にシーンに追加
    this.meshes.push(points);
  }

  // ✅ メッシュを生成
  createMeshes() {
    for(const [key, gltf] of this.models) {
      const root = gltf.scene;
      root.__marker = this.type;
      root.__modelKey = key;

      this.createParticles(root);
    }
  }

  setupVertex(){
    return vertexShader;
  }

  setupFragment(){
    return fragmentShader;
  }

  setupUniforms() {
    return {
      ...super.setupUniforms(), // ObModelの内容を継承。Obモデルのと同じuniforms

      uSize: new Uniform(25), // 全体的な粒子サイズをコントロールするスケール係数
      // uSize: new Uniform(0.4), // 全体的な粒子サイズをコントロールするスケール係数
      uPointResolution: new Uniform(
        new Vector2(
          this.viewport.width * this.viewport.devicePixelRatio,
          this.viewport.height * this.viewport.devicePixelRatio,
        ),
      ),
      uColorA: new Uniform(new Color(this.colorA)),
      uColorB: new Uniform(new Color(this.colorB)),
    }
  }

  // 必要なものだけ継承する
  setupMaterial() {
    return new ShaderMaterial({
      vertexShader: this.vertexShader,
      fragmentShader: this.fragmentShader,
      uniforms: this.uniforms,
      blending: AdditiveBlending, // 他のMeshや背景色と重なった場合は色を上書きせずに現実のように色を混ぜ合わせる。
      depthWrite: false,

      transparent: true,
      // alphaTest: true,
      onBeforeCompile: this.onBeforeCompile,
    });
  }

  // setupMesh() {}

  // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
  // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
  // デバック関数を作成
  // 元のコードの処理のコードを把握
  // トップページ専用のJSからmorph関数を書く
  debug(_foler) {

  }
}

