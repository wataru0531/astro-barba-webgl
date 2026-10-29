/**************************************************************

⭐️ particles-gltf テスト用のファイル

***************************************************************/
import { ObModel } from "../ObModel";

//
import vertexShader   from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";


// Obクラスを継承したクラスを作成。クラス名はつけなくてもいい
export default class extends ObModel{

  // 3Dモデルをそのまま表示するならfalse。
  // ShaderMaterialをあてて使うならtrue.
  useShaderMaterial() {
    return true;
  }

  // 
  applyShaderMaterial(root) {
    root.traverse((child) => {
      // Mesh以外はスキップ
      if (!child.isMesh) return;

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

