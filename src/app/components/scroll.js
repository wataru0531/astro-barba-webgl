
// scroll.ts

// import gsap from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// gsap.registerPlugin(ScrollSmoother)

export default class Scroll {
  // scroll: number
  // s: globalThis.ScrollSmoother | null

  constructor() {
    window.scrollTo(0, 0)
    this.init()
  }

  init() {
    this.scroll = 0

    // ScrollSmoother初期化
    // pause(true) で停止
    this.s = ScrollSmoother.create({
      smooth: 1,
      normalizeScroll: true,
      wrapper: document.getElementById("app"),
      content: document.getElementById("smooth-content"),
    })

    ScrollTrigger.refresh()
  }

  reset(immediate) {
    if (immediate) this.s?.scrollTo(0, false, "top top")
    else this.s?.scrollTop(0)
  }

  destroy() {
    this.s?.kill()
    this.s = null
  }

  getScroll() {
    this.scroll = this.s?.scrollTop() || 0
    // console.log(this.scroll);

    return this.scroll
  }
}
