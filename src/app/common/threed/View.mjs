import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import { $, _, div, table, tr, td, h2 } from '/utils/pelems.mjs';

class View extends Component {
    constructor(props) {
        super(props);
        this.renderer = new THREE.WebGLRenderer();
        this.renderHandler = this.renderHandler.bind(this);
        this.setupCanvas = this.setupCanvas.bind(this);
    }

    // implement onupdate with render = null
    
    renderHandler(scene,camera, sceneData) {
        this.renderer.render(scene,camera);
        console.log(sceneData);
    }

    setupCanvas(ref) {
        const {sceneId, cameraId, width, height} = {...this.props};
        this.renderer.setSize( width, height );
        ref.appendChild( this.renderer.domElement );
        this.props.onUpdate(sceneId, cameraId, this.renderHandler)
    }

	render(props, state) {
        const {width, height} = {...props};
        return div({ref: this.setupCanvas, class: 'canvas-wrapper', width, height});
    }
}

export default $(View);