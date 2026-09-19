/**************************************************************



***************************************************************/



uniform vec2 uDistortionOffset;
uniform float uScale;

varying vec2 vUv;



// 
vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {

  // ----------------------------
  // 1. 中央を基準に縮小
  // ----------------------------
  position.x *= 1.0 - uScale;
  position.y *= 1.0 - uScale;

  // position.x *= 0.8;
  // position.y *= 0.8;

  // ----------------------------
  // 2. 波打ち
  // ----------------------------
  position.x = position.x + (sin(uv.y * PI) * offset.x);
  position.y = position.y + (sin(uv.x * PI) * offset.y);

  return position;
}

void main(){
  vUv = uv;

  vec3 newPosition = deformationCurve(position, uv, uDistortionOffset);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
