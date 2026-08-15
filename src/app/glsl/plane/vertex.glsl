/**************************************************************

gray

***************************************************************/


varying vec2 vUv;
varying vec3 pos;

void main(){
  vUv = uv;
  pos = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
}
