/**************************************************************

⭐️ particles-gltf テスト用のファイル

// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから

// ライトをあてていく

***************************************************************/
import { ObModel } from "../ObModel";

//
import vertexShader   from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";


// ObModelクラスを継承したクラスを作成。
export default class extends ObModel{

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

  // ✅ 3Dモデルのマテリアルに、ShaderMaterialを適用する。
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

  // ✅ glTFのGeometryをカスタマイズする処理
  applyCustomGeometry(_root){
    // console.log(_root); // Group {isObject3D: true, uuid: '323cb6b5-1a1f-42a1-8e25-e816fbf75527', name: '', type: 'Group', parent: null, …}

    // 拡大する
    // _root.scale.set(50, 50, 50);
    _root.scale.multiplyScalar(50);

    _root.traverse(child => {
      if(!child.isMesh) return;
      // console.log(child); // SkinnedMesh {isObject3D: true, uuid: '3d60a5c8-7d86-419e-a994-faf48ccbcd19', name: 'fox', type: 'SkinnedMesh', parent: _Object3D, …}
      console.log(child.geometry); // _BufferGeometry {isBufferGeometry: true, uuid: '1bd90b20-b80f-4f43-a863-ffadf25c7eb1', name: '', type: 'BufferGeometry', index: null, …}

      // TODO Geometryを独自に生成する処理を書いていく


    });


  }

  setupVertex(){
    return vertexShader;
  }

  setupFragment(){
    return fragmentShader;
  }
}

