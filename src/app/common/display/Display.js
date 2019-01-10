import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import { $, _, div, table, tr, td, h2 } from '/utils/pelems.mjs';

export default class Display extends Component {
    constructor(props) {
        super(props); // scene,camPos, width, height, withHelper // data,sun,mercury,venus
        this.setupCanvas = this.setupCanvas.bind(this);
    }
    
    setupCanvas(parentElement) {
        const canvasWrapper = parentElement.children[1];

        const {scene,camPos, width, height, withHelper} = {...this.props};
        const CLIP_FAR = 696000*1000000;
        console.log("canvasRef", canvasWrapper);
        var camera = new THREE.PerspectiveCamera( 75,  width/height, 0.1, CLIP_FAR );
        if(withHelper) {
          const helper = new THREE.CameraHelper( camera );
          scene.add(helper);
        }
        var renderer = new THREE.WebGLRenderer();
        renderer.setSize( width, height );
        canvasWrapper.appendChild( renderer.domElement );

        //   // second canvas and renderer of the same scene
        //   var camera2 = new THREE.PerspectiveCamera( 75, WIDTH/HEIGHT, 0.1, CLIP_FAR );
        //   var renderer2 = new THREE.WebGLRenderer();
        //   renderer2.setSize( WIDTH, HEIGHT );
        //   document.body.appendChild( renderer2.domElement );
        
        // Set camera position
        camera.position.z = camPos.z;
        camera.position.y = camPos.y;
        camera.position.x = camPos.x;
        
        this.props.onDisplayReady(scene, renderer, camera, parentElement)  /// TO DO refactor `parentElement` from here
    }

	render(props, state) {
        return div({ref: this.setupCanvas},
            div({id:'panel-bottom'},
                table({style:'float:left'},
                    tr(_,
                        td(_,'x'), 
                        td(_,'y'), 
                        td(_,'z'), 
                        td(_,'orientation')
                    ),
                    tr(_,
                        td({class:'cam-x'}), 
                        td({class:'cam-y'}), 
                        td({class:'cam-z'}), 
                        td({class:'cam-orientation'})
                    ),
                ),

                table({style:'float:right'},
                    tr(_,
                        td(_,
                            $('input')({class:'cam-control-speed', type:"number", placeholder:"Cam speed", pattern:"[0-9]{1,16}"})
                        ),
                        td(_,
                            'cam inertia:',
                            $('input')({class:'cam-control-inertia', type:"checkbox"})
                        )
                    )
                )
            ),
            div({class:'canvas-wrapper'})
        );
    }
}