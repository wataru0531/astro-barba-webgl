/**************************************************************

gray

***************************************************************/

precision lowp float;

uniform vec2 uMouse;
uniform vec4 uResolution;
uniform float uHover;
uniform sampler2D tex1;
uniform sampler2D tex2;

varying vec2 vUv;
varying vec3 vColor;

// #pragma glslify: coverUv = require("../shader-util/coverUv");

// CSSのobject-fitのcoverのような関数
vec2 coverUv(vec2 uv, vec4 resolution){
  // uvのxに対してresolutionのzをかける
  // uvのyに対してresolutionのwをかける
  // + .5 ...uv座標の中心点をもとに戻す

  // 例: 真四角の立方体に長方形の画像の中央を表示
  // zは 0.5 、 wは 1のとき

  // (uv - .5) ... 画像を中央に位置させる
  // uv.xに .5、uv.yに 1 をかける
  // + .5 ... uv座標の中心点をもとに戻す
  return (uv - .5) * resolution.zw + .5;
}

void main(){
  vec2 uv = gl_PointCoord;

	// ✅ 今描画しているピクセルが、粒子の中心からどれだけ離れているかを計算
	float distanceToCenter = length(uv - 0.5); // 中央からの距離。おおよそ0.0〜0.7
																							// ⭐️ 実際には0ではなくかなり小さい数値らしい
	float alpha = (0.05 / distanceToCenter) - 0.1; // 中心が明るく、端が暗く
	// float alpha = clamp((0.05 / distanceToCenter) - 0.1, 0., 1.); // 0から1に丸める

	gl_FragColor = vec4(vColor, alpha);

	#include <tonemapping_fragment> // トーンマッピング。明るさの見え方を調整する。
	#include <colorspace_fragment>  // 色空間を変換し、画面で適切に見えるようにする。
}