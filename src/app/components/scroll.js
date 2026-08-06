
// scroll.ts

import { ScrollSmoother } from "gsap/ScrollSmoother"
import { ScrollTrigger } from "gsap/ScrollTrigger"

export default class Scroll {
  // scroll: number
  // s: globalThis.ScrollSmoother | null

  constructor() {
    window.scrollTo(0, 0)
    this.init()
  }

  init() {
    this.scroll = 0

    // Initialize smoother with explicit content to ensure proper sync
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

    return this.scroll
  }
}
