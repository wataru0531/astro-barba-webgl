/**************************************************************

⭐️ particles-gltf テスト用のファイル

***************************************************************/
import { ObModel } from "../ObModel";

//
import vertexShader   from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";


// ObModelクラスを継承したクラスを作成。
export default class extends ObModel{

  // 3Dモデルをそのまま表示するならfalse。
  // そのまま使わず、ShaderMaterialをあてて使うならtrue.
  useShaderMaterial() {
    return true;
  }

  // ✅ 3Dモデルのマテリアルに、ShaderMaterialを適用する。
  // Group → 複数の3Dオブジェクトをまとめる親
  // Object3D →	Three.jsの3Dオブジェクトの基本クラス
  // Bone →	3Dモデルの骨格
  // SkinnedMesh → Boneによって変形するMeshのこと。
  //               たとえば、背骨のBoneが動いたとしたらきつねの形状が変化する・
  //               この仕組みを実現するのがSkinnedMesh。
  applyShaderMaterial(root) {
    // console.log(root); // Group {isObject3D: true, uuid: '8c3a6c4d-e9e1-441a-99ab-db44dfce7a37', name: '', type: 'Group', parent: null, …}
    // → rootは、gltf.scene のこと。

    // traverse → gltfオブジェクトモデルは階層構造になっていてさまざまなオブジェクトがある
    //            奥深くにメッシュがある可能性もある。
    // 　　　　　　その中からMeshだけを見つけて、独自のShaderMaterialに変更するために使う
    // 子・孫・ひ孫といった階層の深いところにあるオブジェクトまで再帰的に探索可能
    root.traverse((child) => {
      // console.log(child);

      if (!child.isMesh) return; // ThreeのMesh以外はスキップ
      // console.log(child); // SkinnedMesh {isObject3D: true, uuid: 'c800e23c-545b-4296-9e2a-babfdbd942fe', name: 'fox', type: 'SkinnedMesh', parent: _Object3D, …}

      // 元のgeometryはそのまま使い、materialだけを独自のShaderMaterialに変更
      child.material = this.setupMaterial();
    });
  }

  setupVertex(){
    return vertexShader;
  }

  setupFragment(){
    return fragmentShader;
  }
}

