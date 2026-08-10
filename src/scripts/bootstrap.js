// サイト全体で使うコード
// importされた時点で、各ファイルの関数以外のトップレベルのコードは実行される

import world from "./glsl/world";
import { viewport, gui, INode, utils } from "./helper";
import scroller from "./component/scroller";
import mouse from "../app/components/mouse.js";
import loader from "../app/components/loader.js";
import { menu } from "../app/components/menu.js";
import { registerScrollAnimations } from "./component/scroll-animation.js";

// ✅ デバック 1ならデバッグモード
window.debug = enableDebugMode(1);
// console.log(window.debug)

// ✅ デバックモード: 1、  非デバックモード: 0
function enableDebugMode(debug) {
  // console.log(debug)
  // meta.env.DEV...viteが提供する特殊な変数
  // → 開発環境では、true
  //   本番環境では、falseになる

  // 万が一本番環境でデバックモードで上げた場合は結果はfalseが返ってくる
  return debug && import.meta.env.DEV;
}

// ✅ 初期化
export async function init() {
  const canvas = INode.getElement("#canvas");

  const pageEl = INode.getElement("#page-container"); // ページタイプを取得
  // console.log(pageEl)
  const pageType = INode.getDS(pageEl, "page");
  // console.log(pageType); // home sub

  if (window.debug) await gui.init(); // GUIの初期化...本番環境では必要ないのでif文で囲う

  viewport.init(canvas, 2000, 1500, 4000); // ビューポートに関するデータを取得

  // scroller.init(true); // 慣性スクロール。trueで入れない

  loader.init(); // loaderで使うdomの取得

  // GPUパフォーマンス測定
  // ここではtierが2, 50fpsでない場合は各index.jsでメッシュの作成をスキップ
  await utils.definePerformanceMode(1, 20);

  // 数値のカウントアップ
  const loaderPercent = INode.getElement(".loader-percent");
  // console.log(loaderPercent)
  loader.addProgressAction((progress, total) => {
    loaderPercent.innerHTML = `${Math.round((progress / total) * 100)}%`; // round 四捨五入

    // console.log(progress, total)
  });

  await loader.loadAllAssets(); // テクスチャをキャッシュとしてwindowに保持

  const bgColor = "none";

  await world.init(canvas, viewport, bgColor); // Three.js関連ん￥の初期化

  addGui(world); // guiの初期化

  // 各ページで使うJSの初期化
  await import(`./pages/${pageType}.js`).then(({ default: init }) => {
    // import("./pages/home.js").then(d => {
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
      scroller,
    });
  });

  // svgのカスタムカーソル生成
  mouse.init(false, true); // デフォルトのカーソルを隠すかどうか、svgカーソルを挿入するかどうか

  // リサイズ処理時に関するコールバックを登録
  viewport.addResizeAction(() => {
    // canvasのサイズの更新、メッシュの位置やサイズの更新、カメラのprojectionMatrixの更新
    world.adjustWorldPosition(viewport);

    mouse.resize(); // マウスカーソルのsvgタグのサイズ更新
  });

  world.addRenderAction(() => {
    // renderに渡す。world.jsで実行
    mouse.render();
    world.raycast();
  });

  registerScrollAnimations(); // スクロールアニメーションの登録、実行

  menu.init(world, scroller); // ハンバーガーの初期化

  world.render();

  await loader.letsBegin(); // ローディングのアニメーション発火(カウンターの削除、コンテンツを表示)

  mouse.makeVisible(); // 初期表示時にカスタムカーソルを非表示。300ms毎に判定
}

// guiを初期化、展開
function addGui(_world) {
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
