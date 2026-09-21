/**************************************************************

gray

***************************************************************/

varying vec2 vUv;

uniform vec2 uMouse;
uniform vec4 uResolution;
uniform float uHover;
uniform sampler2D tex1;
uniform float uProgress;

// #pragma glslify: coverUv = require("../shader-util/coverUv");

uniform float uAlpha;
uniform vec2 uRgbOffset;


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

vec3 rgbShift(sampler2D textureImage, vec2 uv, vec2 offset) {
  // uvのx → 変化なし
  // uvのy → 変化あり

  // 白い部分 → 下にスクロールした場合は、黒い部分の値を引くことになる。
  //           そのrを取得して付与
  // → 青くなるのは白い部分の(1, 1, 1, 1)から、offsetの値を少し引くので青く見える(下スクロール時)
  // float r = texture(textureImage, uv + offset).r;

  // vec2 gb = texture(textureImage, uv).gb; // 通常のgbの値をとる

  float r = texture(textureImage, uv + offset).r;
  float g = texture(textureImage, uv).g;
  float b = texture(textureImage, uv).b;

  // return vec3(r, gb);
  return vec3(r, g, b);
}



void main(){
  // uMouseにはホバーした部分の値が渡る
  // 第1パラメータを、第2パラメータの値が超えたら1を返す。
  // vec2 mouse = step(uMouse, vUv);

  // vec2 uv = coverUv(vUv, uResolution);

  // vec4 tex1 = texture(tex1, uv);
  // vec4 tex2 = texture(tex2, uv);

  // vec4 color = mix(tex1, tex2, step(.5, uv.x));

  // gl_FragColor = tex2;

  // 上から順番に消す
  if(vUv.y > 1.0 - uProgress) discard;

  vec2 uv = coverUv(vUv, uResolution);
  vec3 color = rgbShift(tex1, uv, uRgbOffset);

  gl_FragColor = vec4(color, uAlpha);
  // gl_FragColor = vec4(.5, 1., 1., 1.); // 紫

}