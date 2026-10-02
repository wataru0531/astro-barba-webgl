
// text-animation.js

// ✅ TODO
// DOMは$で。
// Not equalのスクロールアニメーションもここで統一させる

import gsap from "gsap"
import { SplitText } from "gsap/SplitText"
import { INode } from "../helper";


export default class TextAnimationSplit {
  constructor() {
    this.elements = [];
    this.ready = true;

    this.animations = []
    this.animationTweens = [];    
  }

  // ✅ スプリットかフェードかに分ける処理
  init() {
    this.elements = INode.qsAll("[data-text-animation][data-text-animation-split]");
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

      const split = SplitText.create(el, {
        type: "lines",
        mask: "lines",
      })

      const inStagger = parseFloat(
        el.getAttribute("data-text-animation-in-stagger") || "0.06",
      )

      const outStagger = parseFloat(
        el.getAttribute("data-text-animation-out-stagger") || "0.06",
      )

      split.lines.forEach((line) => { // 下に下げる
        gsap.set(line, { yPercent: 100 })
      })

      gsap.set(el, { 
        autoAlpha: 1,  // opacity + visibility
        // visibility: "visible" 
      }) // 見えるようにしておく

      this.animations.push({
        element: el,
        split,
        inDuration,
        outDuration,
        inStagger,
        outStagger,
        inDelay,
      })
    })
  }

  // 
  animateIn({ delay = 0 } = {}) {
    this.animations.forEach(
      ({ element, split, inDuration, inStagger, inDelay }) => {
        const tweenWithScroll = gsap.to(split.lines, {
          yPercent: 0,
          stagger: inStagger,
          scrollTrigger: {
            trigger: element,
            start: "top bottom",
            end: "bottom top",
            toggleActions: "play reset restart reset",
          },
          ease: "expo",
          duration: inDuration,
          delay: inDelay + delay,
        });
        
        this.animationTweens.push(tweenWithScroll)
      },
    )

    // return gsap.timeline();
  }

  // このtlは、あとからpause(0)、clearするからdestroyする必要はない
  animateOut() {
    const tl = gsap.timeline()

    // Split animations
    this.animations.forEach(({ split, outDuration, outStagger }) => {
      tl.to(split.lines, {
          yPercent: 100,
          stagger: outStagger,
          ease: "power2.out",
          duration: outDuration,
        },
        0,
      );
    });

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
    })

    this.animations.forEach(({ split }) => {
      split.revert(); // SplitTextが加工する前の状態(元のDOM構造)に戻す
    });

    this.animationTweens = [];
    this.animations = [];
  }
}
