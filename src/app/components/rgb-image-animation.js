
// rgb-image-transition.js


import gsap from "gsap"
import { INode } from "../helper";
import world from "../glsl/world";


export default class RgbImageAnimation {
  // rgbにアニメーションさせるDOMを管理
  constructor() {
    this.elements = [];
    this.ready = true;

    this.animations = [];
    this.animationTweens = [];
  }

  // ✅ 
  // worldからoを取得
  // durationの登録など
  init() {
    this.elements = INode.qsAll(".rbg-image");
    // console.log(this.elements); // [img.rbg-split-image]

    this.elements.forEach((el) => {
      const inDuration = parseFloat(
        el.getAttribute("data-animation-in-duration") || "0.6",
      );

      const outDuration = parseFloat(
        el.getAttribute("data-animation-out-duration") || "0.3",
      );

      const inEase = el.getAttribute("data-animation-in-ease") || "power3.inOut";
      const outEase = el.getAttribute("data-animation-out-ease") || "power3.inOut";

      const inDelay = parseFloat(
        el.getAttribute("data-animation-in-delay") || "0",
      );

      this.animations.push({
        element: el,
        inDuration,
        outDuration,
        inEase,
        outEase,
        inDelay,
      });
    });
  }

  // ✅ uProgressを0 → 1にして画像を表示
  animateIn({ delay = 0 } = {}) {
    this.animations.forEach(({ element, inDuration, outDuration, inEase, outEase, inDelay }) => {
      // console.log(element);
      // console.log(typeof inDuration);
      const o = world.getObjByEl(element);
      // console.log(o);

      // 条件分岐、uProgressの値が0なら1に
      const tween = gsap.to(o.uniforms.uProgress, {
        value: 1,
        duration: inDuration,
        ease: inEase,
        // onUpdate: () => {
        //   console.log(o.uniforms.uProgress.value);
        // }
      });

      this.animationTweens.push(tween);
    })
  }

  // ✅ uProgressを1 → 0にして画像を非表示
  animateOut() {
    // ページ遷移時にアニメーションが終わるまで遷移ととめるためにタイムラインを使う
    // → このtlは親でクリアする。
    const tl = new gsap.timeline();

    this.animations.forEach(({ element, inDuration, outDuration, inEase, outEase, inDelay }) => {
      // console.log(element);
      console.log("animateOut!")
      // console.log(typeof inDuration);
      const o = world.getObjByEl(element);
      // console.log(o);
      if(!o) return;

      // 条件分岐、uProgressの値が0なら1に
      tl.to(o.uniforms.uProgress, {
        value: 0,
        duration: outDuration,
        ease: outEase,
        // onUpdate: () => {
        //   console.log(o.uniforms.uProgress.value);
        // }
      }, 0);
    });

    return tl;
  }

  // ✅ リサイズ処理 → viewport.addResizeActionに
  // onResize() {
  //   if(!this.ready) return;
  //   console.log("onResize");

  //   this.destroy();
  //   this.init();

  //   this.animateIn();
  // }

  // ✅ クリーンアップ処理
  destroy() {
    this.animationTweens.forEach(tween => {
      tween.kill();
    });

    this.animations = [];
    this.animationTweens = [];
  }
}
