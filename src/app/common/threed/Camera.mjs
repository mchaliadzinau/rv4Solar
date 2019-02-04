import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import { $, div } from '/utils/pelems.mjs';

const CLIP_FAR = 696000*1000000;
class Camera extends Component {
    constructor(props) {
        super(props); 
        const {id, x, y, z, width, height, clipFar} = {...this.props};
        
        this.camera = new THREE.PerspectiveCamera( 75,  width/height, 0.1, clipFar || CLIP_FAR );

        // Set camera position
        this.camera.position.z = z || 0;
        this.camera.position.y = y || 0;
        this.camera.position.x = x || 0;
    }

    componentDidMount() {
        if(this.camera && this.props.onRender) {
            // this.props.renderer.setSize( this.props.width, this.props.height );
            this.props.onReadyStateChange(this.props.id, this.props.sceneId, this.camera, this.props.onRender, this.props.domElement);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.camera && !prevProps.onRender && this.props.onRender) {
            // this.props.renderer.setSize( this.props.width, this.props.height );
            this.props.onReadyStateChange(this.props.id, this.props.sceneId, this.camera, this.props.onRender, this.props.domElement);
        }
    }


	render() {
        return div(null,'Camera!');
    }
}


export default $(Camera);