/**************************************************************

テンプレ

***************************************************************/
import gsap from "gsap"
import { Ob } from "../Ob";

import {
  DoubleSide,
  PlaneGeometry,
  Vector2,

} from "three";

//
import vertexShader   from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import { utils } from "../../helper";



// Obクラスを継承したクラスを作成。クラス名はつけなくてもいい
export default class extends Ob{

  // このようにすることで、基本的にはObクラスの処理を使いながら
  // 個別の処理をここで設定することができる

  setupUniforms() {
    const uniforms = super.setupUniforms();

    uniforms.uRgbOffset = { value: new Vector2(0.0, 0.0) };
    uniforms.uDistortionOffset = { value: new Vector2(0.0, 0.0) };
    uniforms.uScale = { value: 0.0 };
    uniforms.uAlpha = { value: 1.0 };
    uniforms.uProgress = { value: 0 };

    return uniforms;
  }

  setupGeometry() {
    return new PlaneGeometry(this.rect.width, this.rect.height, 100, 100);
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
    
    const speed = Math.abs(this.scrollVelocity);
    const targetScale = Math.min(speed * 0.001, 0.01);

    // Distortion 歪み
    // console.log(this.scrollVelocity * 0.0005);
    // this.uniforms.uOffset.value.set(0, 50);
    this.uniforms.uDistortionOffset.value.set(0, -this.scrollVelocity * 0.05);
    
    // RGB
    this.uniforms.uRgbOffset.value.set(0, -this.scrollVelocity * 0.0005);

    // 縮小
    this.uniforms.uScale.value = utils.lerp(
      this.uniforms.uScale.value,
      targetScale,
      0.08
    );
  }

  debug(_folder){
    _folder.add(this.uniforms.uProgress, "value", 0, 1, 0.1).name('progress').listen();
    
    const datData = { next: !!this.uniforms.uProgress.value }
    // console.log(datData); // {next: false}
    
    _folder.add(datData, "next").onChange(() => {
      gsap.to(this.uniforms.uProgress, {
        value: +datData.next,
        duration: 1.5,
        ease: "power3.inOut"
      })
    })

  }
}

