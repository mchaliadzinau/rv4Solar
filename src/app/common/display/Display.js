import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import { $, _, div, table, tr, td, h2 } from '/utils/pelems.mjs';

export default class Display extends Component {
    constructor(props) {
        super(props); // scene,camPos, width, height, withHelper // data,sun,mercury,venus
        this.setupCanvas = this.setupCanvas.bind(this);
    }
    
    setupCanvas(ref) {
        const {scene,camPos, width, height, withHelper} = {...this.props};
        const CLIP_FAR = 696000*1000000;
        console.log("canvasRef", ref);
        var camera = new THREE.PerspectiveCamera( 75,  width/height, 0.1, CLIP_FAR );
        if(withHelper) {
          const helper = new THREE.CameraHelper( camera );
          scene.add(helper);
        }
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( width, height );
        ref.appendChild( renderer.domElement );

        //   // second canvas and renderer of the same scene
        //   var camera2 = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, CLIP_FAR );
        //   var renderer2 = new THREE.WebGLRenderer();
        //   renderer2.setSize( WIDTH, HEIGHT );
        //   document.body.appendChild( renderer2.domElement );
        
        // Set camera position
        camera.position.z = camPos.z;
        camera.position.y = camPos.y;
        camera.position.x = camPos.x;
        
        this.props.onDisplayReady(scene, renderer, camera, ref)  /// TO DO refactor `parentElement` from here
    }

	render(props, state) {
        return div({ref: this.setupCanvas, class:'canvas-wrapper'});
    }
}