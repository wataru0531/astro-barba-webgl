/**************************************************************

⭐️ particles-gltf テスト用のファイル

// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
// ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから

// ライトをあてていく → なぜ灰色のメッシュなのか
// Geometryの処理

***************************************************************/
import { 
  BufferGeometry,
  Float32BufferAttribute,
  Points,
  
} from "three";

import { ObModel } from "../ObModel";

//
import vertexShader   from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";


// ObModelクラスを継承したクラスを作成。
export default class extends ObModel{

  // ✅ モデル(scene)のmaterialをそのまま表示するかそうか。
  // → そのまま表示ならfalse。
  //   そのまま使わず、ShaderMaterialをあてて使うならtrue.
  useShaderMaterial() {
    return true;
  }

  // ✅ モデル(scene)が持つ独自のGeometryを使うかどうか。
  // → 使うなら、true
  useCustomGeometry() {
    return true;
  }

  // ✅ 3Dモデルのマテリアルに、独自のShaderMaterialを適用する。
  // Group → 複数の3Dオブジェクトをまとめる親
  // Object3D →	Three.jsの3Dオブジェクトの基本クラス
  // Bone →	3Dモデルの骨格
  // SkinnedMesh → Boneによって変形するMeshのこと。
  //               たとえば、背骨のBoneが動いたとしたらきつねの形状が変化する・
  //               この仕組みを実現するのがSkinnedMesh。
  applyShaderMaterial(_root) {
    // console.log(_root); // Group {isObject3D: true, uuid: '8c3a6c4d-e9e1-441a-99ab-db44dfce7a37', name: '', type: 'Group', parent: null, …}
    // → _rootは、gltf.scene のこと。

    // traverse → gltfオブジェクトモデルは階層構造になっていてさまざまなオブジェクトがある
    //            奥深くにメッシュがある可能性もある。
    // 　　　　　　その中からMeshだけを見つけて、独自のShaderMaterialに変更するために使う
    // 子・孫・ひ孫といった階層の深いところにあるオブジェクトまで再帰的に探索可能
    _root.traverse((child) => {
      // console.log(child);

      if (!child.isMesh) return; // ThreeのMesh以外はスキップ
      // console.log(child); // SkinnedMesh {isObject3D: true, uuid: 'c800e23c-545b-4296-9e2a-babfdbd942fe', name: 'fox', type: 'SkinnedMesh', parent: _Object3D, …}

      // 元のgeometryはそのまま使い、materialだけを独自のShaderMaterialに変更
      child.material = this.setupMaterial();
    });
  }

  // ✅ glTFのgeometryに独自のカスタマイズする処理
  applyCustomGeometry(_root){
    // console.log(_root); // Group {isObject3D: true, uuid: '323cb6b5-1a1f-42a1-8e25-e816fbf75527', name: '', type: 'Group', parent: null, …}

    // 拡大する
    // _root.scale.set(50, 50, 50);
    _root.scale.multiplyScalar(50);

    // particlesの初期設定
    this.particles = {};
    const particles = this.particles;
    particles.index = 0;

    //  glTFのMeshから頂点を取得
    const meshes = [];
    _root.traverse(child => {
      if(!child.isMesh) return;

      meshes.push(child);
    });
    // console.log(meshes); // (4) [Mesh, Mesh, Mesh, Mesh]

    const positions = meshes.map(child => child.geometry.attributes.position);
    // console.log(positions); // (4) [BufferAttribute, BufferAttribute, BufferAttribute, BufferAttribute]

    // 最大超点数を取得　→ メッシュの携帯を変化させるには同じ超点数に合わせる必要があるため
    particles.maxCount = 0;

    for(const position of positions) {
      if(position.count > particles.maxCount) {
        particles.maxCount = position.count;
      }
    }
    // console.log(particles.maxCount); // 10242

    // 超点数を統一していく
    particles.positions = [];

    for(const position of positions) {
      const originalArray = position.array;
      // console.log(originalArray); 
      // Float32Array(29928), Float32Array(23874), Float32Array(30726), Float32Array(28566)

      const newArray = new Float32Array(particles.maxCount * 3);
      for(let i = 0; i < particles.maxCount; i++) {
        const i3 = i * 3;

        if(i < position.count) {
          newArray[i3 + 0] = originalArray[i3 + 0];
          newArray[i3 + 1] = originalArray[i3 + 1];
          newArray[i3 + 2] = originalArray[i3 + 2];
        } else {
          const randomIndex = Math.floor(position.count * Math.random()) * 3;

          newArray[i3 + 0] = originalArray[randomIndex + 0];
          newArray[i3 + 1] = originalArray[randomIndex + 1];
          newArray[i3 + 2] = originalArray[randomIndex + 2];
        }
      }

      particles.positions.push(new Float32BufferAttribute(newArray, 3));
    }
    // console.log(particles.positions); // (4) [Float32BufferAttribute, Float32BufferAttribute, Float32BufferAttribute, Float32BufferAttribute]
    // → すべての頂点が 30726 に統一される

    // aSizeを生成していく
    const sizesArray = new Float32Array(particles.maxCount);
    for(let i = 0; i < particles.maxCount; i++) {
      sizesArray[i] = Math.random();
    }

    particles.geometry = new BufferGeometry();
    particles.geometry.setAttribute("position", particles.positions[particles.index]);
    particles.geometry.setAttribute("aPositionTarget", particles.positions[particles.positions.length - 1]);
    particles.geometry.setAttribute("aSize", new Float32BufferAttribute(sizesArray, 1));


    // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
    // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
    // ⭐️ここから⭐️ここから⭐️ここから⭐️ここから⭐️ここから
    // 確認、元のコードも確認する




    // ✅ Pointsを生成していく
    particles.material = this.setupMaterial();

    particles.points = new Points(
      particles.geometry,
      particles.material
    );

    particles.points.frustumCulled = false;
    // world.js の addObj() で追加できるようにする
    this.mesh = particles.points;


    // ✅ モーフィング関数
    particles.morph = (_index) => {
      particles.geometry.setAttribute(
        "position",
        particles.positions[particles.index]
      );

      particles.geometry.setAttribute(
        "aPositionTarget",
        particles.positions[_index]
      );

      gsap.fromTo(
        particles.material.uniforms.uProgress,
        { value: 0 },
        {
          value: 1,
          duration: 3,
          ease: "expo.out",
        }
      );

      particles.index = _index;
    };
  }

  setupVertex(){
    return vertexShader;
  }

  setupFragment(){
    return fragmentShader;
  }
}

