
// text-animation.js

// ✅ TODO
// DOMは$で。
// Not equalのスクロールアニメーションもここで統一させる

import gsap from "gsap"
import { SplitText } from "gsap/SplitText"


export default class TextAnimation {
  constructor() {
    this.splitTweens = [];
    this.fadeTweens = [];

    this.splitAnimations = []
    this.fadeAnimations = []

    this.elements = [];
    this.ready = true;
  }

  // ✅ スプリットかフェードかに分ける処理
  init() {
    this.elements = [...document.querySelectorAll("[data-text-animation]")];

    this.elements.forEach((el) => {
      const inDuration = parseFloat(
        el.getAttribute("data-text-animation-in-duration") || "0.6",
      )

      const outDuration = parseFloat(
        el.getAttribute("data-text-animation-out-duration") || "0.3",
      )

      const inDelay = parseFloat(
        el.getAttribute("data-text-animation-in-delay") || "0",
      )

      // 分割
      if (el.hasAttribute("data-text-animation-split")) {
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

        gsap.set(el, { autoAlpha: 1, visibility: "visible" }) // 見えるようにしておく

        this.splitAnimations.push({
          element: el,
          split,
          inDuration,
          outDuration,
          inStagger,
          outStagger,
          inDelay,
        })
      } else {
        // スプリットではないアニメーション → フェードアニメーション
        gsap.set(el, { autoAlpha: 0, visibility: "hidden" })

        this.fadeAnimations.push({
          element: el,
          inDuration,
          outDuration,
          inDelay,
        })
      }
    })
  }

  animateIn({ delay = 0 } = {}) {
    // console.log(delay)
    // Split text animations

    // console.log(this.splitAnimations);
    // console.log(this.fadeAnimations);

    this.splitAnimations.forEach(
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
        
        this.splitTweens.push(tweenWithScroll)
      },
    )

    // Fade animations
    this.fadeAnimations.forEach(({ element, inDuration, inDelay }) => {
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

      this.fadeTweens.push(fadeTween);
    });

    return gsap.timeline()
  }

  animateOut() {
    const tl = gsap.timeline()

    // Split animations
    this.splitAnimations.forEach(({ split, outDuration, outStagger }) => {
      tl.to(split.lines, {
          yPercent: 100,
          stagger: outStagger,
          ease: "power2.out",
          duration: outDuration,
        },
        0,
      )
    })

    // Fade animations
    this.fadeAnimations.forEach(({ element, outDuration }) => {
      tl.to(
        element,
        {
          autoAlpha: 0,
          ease: "power2.out",
          duration: outDuration,
        },
        0,
      )
    })
    // console.log(tl);
    // console.log(this.splitAnimations);
    // console.log(this.fadeAnimations);
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
    this.splitTweens.forEach((tween) => {
      tween.scrollTrigger?.kill()
      tween.kill()
    })

    this.fadeTweens.forEach((tween) => {
      tween.scrollTrigger?.kill()
      tween.kill()
    })

    this.splitAnimations.forEach(({ split }) => {
      split.revert(); // SplitTextが加工する前の状態(元のDOM構造)に戻す
    });

    this.splitTweens = [];
    this.fadeTweens = [];

    this.splitAnimations = [];
    this.fadeAnimations = [];
  }
}
