import * as THREE from '/@/three.mjs';
import { setupOverlay } from './init-overlay.js';

export const setupDisplay = (scene,camPos, width, height, withHelper) => {
  const CLIP_FAR = 696000*1000000;
  const parentElement = document.getElementById('canvas-wrapper');
  var camera = new THREE.PerspectiveCamera( 75,  width/height, 0.1, CLIP_FAR );
  if(withHelper) {
    const helper = new THREE.CameraHelper( camera );
    scene.add(helper);
  }
  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( width, height );
  parentElement.appendChild( renderer.domElement );

//   // second canvas and renderer of the same scene
//   var camera2 = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, CLIP_FAR );
//   var renderer2 = new THREE.WebGLRenderer();
//   renderer2.setSize( WIDTH, HEIGHT );
//   document.body.appendChild( renderer2.domElement );
  
  // Set camera position
  camera.position.z = camPos.z;
  camera.position.y = camPos.y;
  camera.position.x = camPos.x;
  
  const overlay = setupOverlay(
    renderer, camera, parentElement,
    // ()=>{console.log('click on overlay!')}
  )

  return {
    camera, renderer, panel:overlay.panel, 
    updateLabelsPos:overlay.updateLabelsPos, 
    updateCameraStats: overlay.updateCameraStats
  };
}