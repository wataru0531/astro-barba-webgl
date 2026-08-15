/**************************************************************

plane → テスト表示用のメッシュ

***************************************************************/
import { Ob } from "../Ob";

import vertexShader   from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";

import { BoxGeometry } from "three";

// console.log(vertexShader);
// console.log(fragmentShader);

export default class extends Ob{
  setupGeometry(){
    return new BoxGeometry(this.rect.width, this.rect.width, this.rect.width);
  }


  setupVertex(){
    return vertexShader;
  }

  setupFragment(){
    return fragmentShader;
  }
}

