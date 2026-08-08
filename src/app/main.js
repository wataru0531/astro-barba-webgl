
// main.ts

// import Canvas from "./components/canvas"
import Scroll from "./components/scroll"
//@ts-ignore
import barba from "@barba/core"

import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"
//@ts-ignore
// import { Flip } from "gsap/Flip"
import gsap from "gsap"
// import Media from "./components/media"
import { SplitText } from "gsap/SplitText"
import TextAnimation from "./components/text-animation"
import FontFaceObserver from "fontfaceobserver";

import { INode, gui } from "./helper"

gsap.registerPlugin(
  ScrollTrigger, 
  ScrollSmoother, 
  // Flip, SplitText
)

// ✅ Not Equalの初期化
// ・デバックモード
// ・
// ・

// デバッグ
// 1 → 開発はデバッグをON。本番ではOFF
// 0 → 開発でも本番でもOFF
window.debug = enableDebugMode(1);
// console.log(window.debug) // true

function enableDebugMode(debug) {
  return debug && import.meta.env.DEV;
}

class App {
  // canvas: Canvas
  // scroll: Scroll
  // template: "home" | "detail"

  // mediaHomeState: Flip.FlipState
  // scrollBlocked: boolean = false
  // scrollTop: number
  // textAnimation: TextAnimation
  // fontLoaded: boolean = false

  // ✅ 初期化処理
  constructor() {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }

    this.$ = {};
    // ✅ Not Equalプロジェクトを入れる
    this.$.canvas = INode.getElement("#js-canvas");
    this.$.pageElement =
    this.template = this.getCurrentTemplate(); // ページのタイプ
    // console.log(this.template);

    this.scrollBlocked = false;
    this.fontLoaded = false;

    this.scroll = new Scroll()
    // this.canvas = new Canvas()
    // console.log(this.canvas);
    this.textAnimation = new TextAnimation()
  
    // let activeLinkImage;
    this.scrollTop = 0;

    window.addEventListener("resize", this.onResize.bind(this))

    this.render = this.render.bind(this)
    gsap.ticker.add(this.render)



    this.init(); // 初期化処理
  }

  // ✅　初期化処理
  async init() {
    if(window.debug) await gui.init();

    // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
    // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
    // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから

    this.loadFont(() => {
      this.textAnimation.init()
    });

    this.loadImages(() => {
      // this.canvas.createMedias()

      if (this.fontLoaded) {
        this.textAnimation.init()
        this.textAnimation.animateIn()
      } else {
        window.addEventListener("fontLoaded", () => {
          gsap.delayedCall(0, () => {
            gsap.delayedCall(0, () => {
              this.textAnimation.init()
              this.textAnimation.animateIn({ delay: 0.3 })
            })
          })
        })
      }
    })

    // ✅ Barba
    barba.init({
      prefetchIgnore: true,
      transitions: [
        {
          name: "default-transition",
          before: () => {
            this.scrollBlocked = true
            this.scroll.s?.paused(true)
          },
          leave: () => {
            // const medias = this.canvas.medias && this.canvas.medias

            // medias?.forEach((media) => {
            //   if (!media) return
            //   media.onResize(this.canvas.sizes)
            //   gsap.set(media.element, {
            //     visibility: "hidden",
            //     opacity: 0,
            //   })
            // })

            return new Promise((resolve) => {
              const tl = this.textAnimation.animateOut()

              // this.canvas.medias?.forEach((media) => {
              //   if (!media) return
              //   tl.fromTo(
              //     media.material.uniforms.uProgress,
              //     { value: 1 },
              //     {
              //       duration: 1,
              //       ease: "linear",
              //       value: 0,
              //     },
              //     0,
              //   )
              // })

              tl.call(() => {
                this.textAnimation.destroy()
                resolve()
              })
            })
          },
          beforeEnter: () => {
            // this.canvas.medias?.forEach((media) => {
            //   media?.destroy()
            //   media = null
            // })

            this.scrollBlocked = false

            this.scroll.reset()
            this.scroll.destroy()
          },
          after: () => {
            this.scroll.init()
            this.textAnimation.init()

            const template = this.getCurrentTemplate()
            this.setTemplate(template)

            this.loadImages(() => {
              // this.canvas.medias = []
              // this.canvas.createMedias()
              this.textAnimation.animateIn({ delay: 0.3 })
            })
          },
        },
        {
          name: "home-detail",
          from: {
            custom: () => { // trueならhome-detailが使われる
              const activeLink = document.querySelector('a[data-home-link-active="true"]')
              if (!activeLink) return false

              return true
            },
          },
          before: () => {
            this.scrollBlocked = true
            this.scroll.s?.paused(true)

            const tl = this.textAnimation.animateOut()

            // activeLinkImage = document.querySelector('a[data-home-link-active="true"] img');

            // this.canvas.medias?.forEach((media) => {
            //   if (!media) return
            //   media.scrollTrigger.kill()

            //   const currentProgress = media.material.uniforms.uProgress.value
            //   const totalDuration = 1.2

            //   if (media.element !== activeLinkImage) {
            //     const remainingDuration = totalDuration * currentProgress

            //     tl.to(
            //       media.material.uniforms.uProgress,
            //       {
            //         duration: remainingDuration,
            //         value: 0,
            //         ease: "linear",
            //       },
            //       0,
            //     )
            //   } else {
            //     const remainingDuration = totalDuration * (1 - currentProgress)

            //     tl.to(
            //       media.material.uniforms.uProgress,
            //       {
            //         value: 1,
            //         duration: remainingDuration,
            //         ease: "linear",
            //         onComplete: () => {
            //           media.element.style.opacity = "1"
            //           media.element.style.visibility = "visible"
            //           gsap.set(media.material.uniforms.uProgress, { value: 0 })
            //         },
            //       },
            //       0,
            //     )
            //   }
            // })

            return new Promise((resolve) => {
              tl.call(() => {
                resolve()
              })
            })
          },

          leave: () => {
            scrollTop = this.scroll.getScroll()

            const container = document.querySelector(".container");
            container.style.position = "fixed"
            container.style.top = `-${scrollTop}px`
            container.style.width = "100%"
            container.style.zIndex = "1000"

            // this.mediaHomeState = Flip.getState(activeLinkImage)
            this.textAnimation.destroy()
          },
          beforeEnter: () => {
            this.scroll.reset()
            this.scroll.destroy()
          },
          after: () => {
            this.scroll.init()
            this.textAnimation.init()

            const detailContainer = document.querySelector(".details-container");

            detailContainer.innerHTML = ""
            // detailContainer.append(activeLinkImage)

            const template = this.getCurrentTemplate()
            this.setTemplate(template)

            return new Promise((resolve) => {
              let activeMedia = null

              this.textAnimation.animateIn({ delay: 0.3 })

              // Flip.from(this.mediaHomeState, {
              //   absolute: true,
              //   duration: 1,
              //   ease: "power3.inOut",
              //   onComplete: () => {
              //     this.scrollBlocked = false
              //     this.canvas.medias?.forEach((media) => {
              //       if (!media) return
              //       if (media.element !== activeLinkImage) {
              //         media.destroy()
              //         media = null
              //       } else {
              //         activeMedia = media
              //       }
              //     })

              //     this.canvas.medias = [activeMedia]

              //     resolve()
              //   },
              // })
            })
          },
        },
      ],
    })

  }

  getCurrentTemplate() {
    return document.querySelector("[data-page-template]")?.getAttribute("data-page-template");
  }

  setTemplate(template) {
    this.template = template;
  }

  loadImages(callback) {
    const medias = document.querySelectorAll("img")
    let loadedImages = 0
    const totalImages = medias.length

    medias.forEach((img) => {
      if (img.complete) {
        loadedImages++
      } else {
        img.addEventListener("load", () => {
          loadedImages++
          if (loadedImages === totalImages) {
            this.onReady(callback)
          }
        })
      }
    })

    if (loadedImages === totalImages) {
      this.onReady(callback)
    }
  }

  onReady(callback) {
    if (callback) callback()
    ScrollTrigger.refresh()
  }

  loadFont(onLoaded) {
    const satoshi = new FontFaceObserver("Satoshi")

    satoshi.load().then(() => {
      onLoaded()
      this.fontLoaded = true
      window.dispatchEvent(new Event("fontLoaded"))
    })
  }

  onResize() {
    this.textAnimation?.onResize()
    this.canvas?.onResize()
  }

  render() {
    this.scrollTop = this.scroll?.getScroll() || 0
    this.canvas?.render(this.scrollTop, !this.scrollBlocked)
  }
}

export default new App()
