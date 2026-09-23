
// rgb-transition.js


import gsap from "gsap"
import { INode } from "../helper";
import world from "../glsl/world";


export default class RgbImageAnimation {
  // rgbにアニメーションさせるDOMを管理
  constructor() {
    this.elements = [];
    this.ready = true;

    this.animationTweens = [];
    this.animations = [];



    this.revealTweens = [];
    this.hideTweens = [];

    this.revealAnimations = [];
    this.hideAnimations = [];
  }

  // ✅ 
  // worldからoを取得
  // durationの登録など
  init() {
    this.elements = INode.qsAll(".rbg-split-image");
    // console.log(this.elements); // [img.rbg-split-image]

    this.elements.forEach((el) => {
      const inDuration = parseFloat(
        el.getAttribute("data-text-animation-in-duration") || "1.5",
      );

      const outDuration = parseFloat(
        el.getAttribute("data-text-animation-out-duration") || "1.5",
      );

      const inEase = el.getAttribute("data-text-animation-in-ease") || "power3.inOut";
      const outEase = el.getAttribute("data-text-animation-out-ease") || "power3.inOut";

      const inDelay = parseFloat(
        el.getAttribute("data-text-animation-in-delay") || "0",
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
      gsap.to(o.uniforms.uProgress, {
        value: 1,
        duration: inDuration,
        ease: inEase,
        onUpdate: () => {
          console.log(o.uniforms.uProgress.value);
        }
      });
    })
  }

  // ✅ uProgressを1 → 0にして画像を非表示
  animateOut() {
    this.animations.forEach(({ element, inDuration, outDuration, inEase, outEase, inDelay }) => {
      // console.log(element);
      // console.log(typeof inDuration);
      const o = world.getObjByEl(element);
      // console.log(o);

      // 条件分岐、uProgressの値が0なら1に
      gsap.to(o.uniforms.uProgress, {
        value: 0,
        duration: inDuration,
        ease: inEase,
        onUpdate: () => {
          console.log(o.uniforms.uProgress.value);
        }
      });
    })
  }

  // ✅ リサイズ処理 → viewport.addResizeActionに
  onResize() {
  
  }

  // ✅ クリーンアップ処理
  destroy() {
    
  }
}
