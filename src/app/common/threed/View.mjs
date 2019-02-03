import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import { $, _, div, table, tr, td, h2 } from '/utils/pelems.mjs';

const KEY_FRAME_MIN_INTERVAL = 0.05;
class View extends Component {
    constructor(props) {
        super(props);
        this.renderer = new THREE.WebGLRenderer();
        this.renderHandler = this.renderHandler.bind(this);
        this.setupCanvas = this.setupCanvas.bind(this);
        this.renderWrapper = this.renderWrapper.bind(this);

        this.state = {
            lastKeyFrame: 0
        };
    }

    // implement onupdate with render = null
    
    renderHandler(scene,camera, clock, sceneState) {
        this.renderer.render(scene,camera);
        // console.log(sceneState);
        if(clock.elapsedTime - this.state.lastKeyFrame > KEY_FRAME_MIN_INTERVAL) {
            this.setState({lastKeyFrame: clock.elapsedTime})
        }
    }

    setupCanvas(ref) {
        const {sceneId, cameraId, width, height} = {...this.props};
        this.renderer.setSize( width, height );
        ref.appendChild( this.renderer.domElement );
        this.props.onUpdate(sceneId, cameraId, this.renderHandler, width, height, this.renderer.domElement)
    }

    renderWrapper(props) {
        const {width, height} = {...props};
        return div({ref: this.setupCanvas, class: 'canvas-wrapper', width, height});
    }

	render(props, state) {
        if(props.render) {
            return props.render( this.renderWrapper(props) );
        } else {
            return this.renderWrapper(props);
        }
    }
}

export default $(View);