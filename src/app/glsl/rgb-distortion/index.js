/**************************************************************

テンプレ

***************************************************************/
import { Ob } from "../Ob";

import {
  DoubleSide,
  Vector2,

} from "three";

//
import vertexShader   from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import world from "../world";



// Obクラスを継承したクラスを作成。クラス名はつけなくてもいい
export default class extends Ob{

  // このようにすることで、基本的にはObクラスの処理を使いながら
  // 個別の処理をここで設定することができる

  setupUniforms() {
    const uniforms = super.setupUniforms();

    uniforms.uOffset = { value: new Vector2(.0, .0) };
    uniforms.uScale = { value: 0.0 };
    uniforms.uAlpha = { value: 1.0 };

    return uniforms;
  }

  setupMaterial() {
    const material = super.setupMaterial();
    material.side = DoubleSide;

    return material;
  }

  setupVertex(){
    return vertexShader;
  }

  setupFragment(){
    return fragmentShader;
  }

  render(tick) {
    super.render(tick);
    // console.log(tick);
    
    const velocity = this.scrollVelocity;
    console.log(velocity);

  }
}

