
// main.ts

// ⭐️ TODO 
// 画像関係の初期化
// テクスチャ、画像などすべてを読み込まないと画像をクリックできないようにする
// → headタグの処理にする
// デザインを固める + コードの確認
// WebGLコードの編集
// ページ遷移時にWebGLの初期化を行わないと、表示されない
// astro.config.jsの編集。本番環境の設定など
// ✅ ローディング画面
// 各コンポーネントの初期化順
// 各コンポーネントのクラス化
// メニューの実装
// ScrollTriggerの統一(コンポーネントごとに初期化されている可能性あり)
// leave時に、getScrollすると後続の処理が止まる問題


// import Canvas from "./components/canvas"
import Scroll from "./components/scroll"
import Media from "./components/media"

//@ts-ignore
import barba from "@barba/core"

import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollSmoother } from "gsap/ScrollSmoother"

//@ts-ignore
// import { Flip } from "gsap/Flip"
import gsap from "gsap"
// import Media from "./components/media"
import { SplitText } from "gsap/SplitText"
import TextAnimation from "./components/text-animation";
import FontFaceObserver from "fontfaceobserver";

import { INode, gui, viewport } from "./helper"
import loader from "./components/loader";
import mouse from "./components/mouse"
import world from "./glsl/world"
import { menu } from "./components/menu"
import { registerScrollAnimations } from "./components/scroll-animation"

gsap.registerPlugin(
  ScrollTrigger, 
  ScrollSmoother, 
  // Flip, SplitText
)


// デバッグ
// 1 → 開発はデバッグをON。本番ではOFF
// 0 → 開発でも本番でもOFF
window.debug = enableDebugMode(1);
// console.log(window.debug) // true

function enableDebugMode(debug) {
  return debug && import.meta.env.DEV;
}

class App {
  // ✅ 初期化処理 → 保持しておきたいインスタンスなどはここ
  constructor() {
    if (typeof history !== "undefined" && "scrollRestoration" in history) {
      history.scrollRestoration = "manual"
    }

    this.$ = {}; // DOM
    this.$.canvas = INode.getElement("#js-canvas");



    // Mediaの初期化 → 画像部分のクリック処理も
    this.medias = [];
    this.$.images = INode.qsAll(".grid__item img");
    // console.log(this.$.images);
    this.$.images.forEach(image => {
      // console.log(image)
      const media = new Media(image);

      this.medias.push(media);
    });
    // console.log(this.medias);

    // this.medias?.forEach(image => { // ScrollTriggerの監視下に置く
    //   image?.observe();
    // })

    this.activeLinkImage = null;




    this.scrollBlocked = false;
    this.fontLoaded = false;
    this.bgColor = ""; // シーンの背景色

    this.pageType = this.getCurrentTemplate(); // ページのタイプ
    // console.log(this.pageType);

    this.scroll = new Scroll()
    this.textAnimation = null;
  
    this.scrollTop = 0;

    // → viewport.addResizeActionに持っていく
    // window.addEventListener("resize", this.onResize.bind(this))
    // this.render = this.render.bind(this)

    this.init(); // 初期化処理
  }

  // ✅　初期化処理
  async init() {
    if(window.debug) await gui.init();

    viewport.init(this.$.canvas);

    await loader.loadAllAssets(); // url => テクスチャ の状態でtextureCacheに保持
    // console.log(textureCache);

    await world.init(this.$.canvas, viewport, this.bgColor);

    this.addGui(world);

    // 各ページで使うJSの初期化
    // console.log(this.pageType);
    await import(`./pages/${this.pageType}.js`).then(({ default: init }) => {
      // await import(`./pages/${this.pageType}.js`).then(d => {
      // console.log(d); // Module {Symbol(Symbol.toStringTag): 'Module'}default: (...)Symbol(Symbol.toStringTag): "Module"get default: ƒ ()set default: ƒ ()

      // ・default → default exportされているものが渡ってくる。
      // ・init    → デフォルトエクスポートされた関数をinitという名前の変数に格納
      //             defaultは予約後のため使えない

      return init({
        world,
        mouse,
        menu,
        loader,
        viewport,
        scroller: this.scroll,
      });
    });

    mouse.init();
    
    // リサイズ処理時に関するコールバックを登録
    viewport.addResizeAction(() => {
      // canvasのサイズの更新、メッシュの位置やサイズの更新、カメラのprojectionMatrixの更新
      world.adjustWorldPosition(viewport);

      mouse.resize(); // マウスカーソルのsvgのサイズ更新

      this.textAnimation?.onResize();
    });

    world.addRenderAction(() => {
      // renderに渡す。world.jsで実行
      mouse.render();
      world.raycast();

      this.scrollTop = this.scroll?.getScroll() || 0; // ⭐️ 要確認
    });

    // ・スクロール系のアニメーションの確認
    registerScrollAnimations(); // スクロールアニメーションの登録、実行

    // menu.init(world, scroller); // ✅ メニューの初期化。

    world.render();

    // await loader.letsBegin(); // ローディングのアニメーション発火(カウンターの削除、コンテンツを表示)

    // フォントのロード後に処理したい処理を渡す
    this.loadFont(() => {
      // console.log("init")
      this.textAnimation.init();
      ScrollTrigger.refresh(); // DOMのサイズや位置が変わった後に呼ぶ
                               // → initでテキストを分割させるのでinitの次で発火させる  

      this.textAnimation.animateIn()
    });


    // ⭐️ loadImagesはやめて、loadFontのみで行く
    // this.loadImages(() => {
    //   // this.canvas.createMedias()

    //   if(this.fontLoaded) {
    //     this.textAnimation.init()
    //     this.textAnimation.animateIn()
    //   } else {
    //     // fontLoadedをここで登録 → dispatchで発火させる
    //     window.addEventListener("fontLoaded", () => { 
    //       gsap.delayedCall(0, () => {
    //         gsap.delayedCall(0, () => {
    //           this.textAnimation.init()
    //           this.textAnimation.animateIn({ delay: 0.3 })
    //         });
    //       });
    //     });
    //   }
    // });

    // ✅ Barba
    // | フック           | タイミング       | 主な用途          |
    // | ------------- | ----------- | ------------- |
    // | `before`      | 遷移処理の最初     | 全体の準備         |
    // | `beforeLeave` | 現在ページを離れる直前 | 現在ページの状態保存など  |
    // | `leave`       | 現在ページを離れる処理 | **離脱アニメーション** |
    // | `afterLeave`  | 現在ページを離れた後  | 古いページの後処理     |
    // 
    // -------  ここでページが差し代わる  -------
    // 
    // | `beforeEnter` | 新ページが入る直前   | **新ページの準備**   |
    // | `enter`       | 新ページが入る処理   | **表示アニメーション** |
    // | `afterEnter`  | 新ページが入った後   | 新ページの初期化      |
    // | `after`       | 遷移全体が完了した後  | 全体の後処理        |

    // グローバルフック
    // barba.hooks.before(...)
    // barba.hooks.beforeLeave(...)
    // などなど...

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
            // console.log("leave");
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
            // console.log("beforeEnter");
            // this.canvas.medias?.forEach((media) => {
            //   media?.destroy()
            //   media = null
            // })

            this.scrollBlocked = false

            this.scroll.reset()
            this.scroll.destroy()
          },
          after: () => {
            // console.log("after")
            this.scroll.init()
            this.textAnimation.init()

            const pageType = this.getCurrentTemplate()
            this.setPageType(pageType)

            // TODO → 変更
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
              // console.log(activeLink);
              if (!activeLink) return false
              return true;
            },
          },
          before: () => {
            // console.log("before");
            this.scrollBlocked = true;
            this.scroll.s?.paused(true);

            const tl = this.textAnimation.animateOut();

            this.activeLinkImage = document.querySelector('a[data-home-link-active="true"] img');
            // console.log(this.activeLinkImage);

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

          leave: (data) => {
            // console.log("leave", data)
            // console.log(this.scroll);
            // scrollTop = this.scroll.getScroll(); 👉 これを呼び出したら実行が止まる
            // console.log(scrollTop);

            // const container = document.querySelector(".container");
            // console.log(container)

            // container.style.position = "fixed"
            // container.style.top = `-${scrollTop}px`
            // container.style.width = "100%"
            // container.style.zIndex = "1000"

            // this.mediaHomeState = Flip.getState(activeLinkImage)
            // console.log(this.textAnimation);
            this.textAnimation.destroy();
            // console.log("leave done");

          },

          // ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから
          //  ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから
          //  ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから ⭐️ここから
          // 変数を外にだすなどしてリファクタリング
          // details-homeの部分も編集、追加
          beforeEnter: (data) => {
            // console.log("beforeEnter");
            // console.log(data);
            const parser = new DOMParser();
            const nextDocument = parser.parseFromString(data.next.html, "text/html");

            // console.log(nextDocument); // #document(127.0.0.1)

            document.title = nextDocument.title;

            const metaSelectors = [
              'meta[name="description"]',
              'meta[property="og:title"]',
              'meta[property="og:description"]',
              'meta[property="og:type"]',
              'meta[property="og:url"]',
              'meta[property="og:image"]',
              'meta[property="og:image:alt"]',
              'meta[name="twitter:card"]',
              'meta[name="twitter:description"]',
              'meta[name="twitter:image"]',
            ];

            metaSelectors.forEach(selector => {
              const nextMeta = nextDocument.head.querySelector(selector);
              const currentMeta = document.head.querySelector(selector);

              if(nextMeta && currentMeta) {
                currentMeta.setAttribute("content", nextMeta.getAttribute("content") || "");
              }
            })




            this.scroll.reset()
            this.scroll.destroy()
          },
          after: (data) => {
            // console.log("after");
            this.scroll.init();
            this.textAnimation.init();

            // const detailContainer = document.querySelector(".details-container");

            // detailContainer.innerHTML = ""
            // detailContainer.append(activeLinkImage)

            const pageType = this.getCurrentTemplate()
            this.setPageType(pageType);

            return new Promise((resolve) => {
              let activeMedia = null

              this.textAnimation.animateIn({ 
                delay: 0.3,

                onComplete: () => {
                  this.scrollBlocked = false;
                  this.medias.forEach(media => {
                    // console.log(media);
                    if(!media) return;
                    if(media.element !== this.activeLinkImage) {
                      media.destroy();
                      media = null;
                    } else {
                      activeMedia = media;
                    }

                    this.medias = [activeMedia];

                    resolve();
                  })
                }
              });

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
    });

    mouse.makeVisible(); // 初期表示時にカスタムカーソルを非表示。300ms毎に判定。
                         //  → 全ての処理が終わったら発火させる
  }

  // ✅ ページのタイプを取得
  getCurrentTemplate() {
    return document.querySelector("[data-page-type]")?.getAttribute("data-page-type");
  }

  // ✅ ページのタイプを更新
  setPageType(pageType) {
    this.pageType = pageType;
  }

  // ※ テクスチャの読み込みはloadAllAssetsを使うのでこれは使わない
  loadImages(_callback) {
    const medias = document.querySelectorAll("img")
    let loadedImages = 0
    const totalImages = medias.length

    medias.forEach((img) => {
      // console.log(img)
      if(img.complete) {
        loadedImages++
      } else {
        img.addEventListener("load", () => {
          loadedImages++
          if (loadedImages === totalImages) {
            this.onReady(_callback)
          }
        })
      }
    })

    if (loadedImages === totalImages) {
      this.onReady(_callback)
    }
  }

  //　
  onReady(callback) {
    if (callback) callback()
    ScrollTrigger.refresh()
  }

  // ✅ フォントのロードが終わればコールバックを発火
  loadFont(_callback) {
    const inter = new FontFaceObserver("Inter")

    // ※ Interが使われるのを検知するので、「FontFaceObserverが待っているフォント」
    //   と「実際にSplitTextするテキストが使っているフォント」を一致させる
    inter.load().then(async () => {
      this.fontLoaded = true;
      
      // await document.fonts.ready;
      this.textAnimation = new TextAnimation();

      _callback();
      window.dispatchEvent(new Event("fontLoaded")); // 発火させる
    })
  }

  // guiを初期化、展開
  addGui(_world) {
    if (window.debug) {
      gui.add(_world.addOrbitControlGUI); // OrbitControlの制御

      // 全てのメッシュにguiを追加
      gui.add((gui) => {
        // lilGUIがわたってくる
        gui.close();

        _world.os.forEach((o) => {
          if (!o.debug) return; // oがデバッグ関数をもったなかったら処理中断

          const type = INode.getDS(o.$.el, "webgl"); // type → フォルダ名
          // console.log(type)
          const folder = gui.addFolder(type); // フォルダ追加
          // console.log(folder)
          folder.close(); // 非表示。各ファイルで上書きできる
          o.debug(folder); // フォルダーのインスタンスを渡す
        });
      });
    }
  }

}

export default new App()
