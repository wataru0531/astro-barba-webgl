
// text-animation.js

// ✅ TODO
// DOMは$で。
// Not equalのスクロールアニメーションもここで統一させる


import gsap from "gsap"
import { INode } from "../helper";


export default class TextAnimationFade {
  constructor() {
    this.elements = [];
    this.ready = true;

    this.animations = []
    this.animationTweens = [];
    
  }

  // ✅ スプリットかフェードかに分ける処理
  init() {
    this.elements = INode.qsAll("[data-text-animation][data-text-animation-fade]");
    // console.log(this.elements);

    this.elements.forEach((el) => {
      // console.log(el)
      const inDuration = parseFloat(
        el.getAttribute("data-text-animation-in-duration") || "0.6",
      )

      const outDuration = parseFloat(
        el.getAttribute("data-text-animation-out-duration") || "0.3",
      )

      const inDelay = parseFloat(
        el.getAttribute("data-text-animation-in-delay") || "0",
      )

      // スプリットではないアニメーション → フェードアニメーション
      gsap.set(el, { autoAlpha: 0, visibility: "hidden" })

      this.animations.push({
        element: el,
        inDuration,
        outDuration,
        inDelay,
      });
    })
  }

  // 
  animateIn({ delay = 0 } = {}) {
    this.animations.forEach(({ element, inDuration, inDelay }) => {
      const fadeTween = gsap.to(element, {
        autoAlpha: 1,
        scrollTrigger: {
          trigger: element,
          start: "top bottom",
          end: "bottom top",
          toggleActions: "play reset restart reset",
        },
        ease: "power2.out",
        duration: inDuration,
        delay: inDelay + delay,
      });

      this.animationTweens.push(fadeTween);
    });
  }

  // このtlは、あとからpause(0)、clearするからdestroyする必要はない
  animateOut() {
    const tl = gsap.timeline()

    // Fade animations
    this.animations.forEach(({ element, outDuration }) => {
      tl.to(element, {
        autoAlpha: 0,
        ease: "power2.out",
        duration: outDuration,
      }, 0);
    })

    return tl
  }

  // ✅ リサイズ処理 → viewport.addResizeActionに
  onResize() {
    // console.log("onResize init");
    if(!this.ready) return;

    this.destroy()
    this.init()

    this.animateIn()
  }

  // ✅ クリーンアップ処理
  destroy() {
    this.animationTweens.forEach((tween) => {
      tween.scrollTrigger?.kill()
      tween.kill()
    });

    this.animationTweens = [];
    this.animations = [];
  }
}
