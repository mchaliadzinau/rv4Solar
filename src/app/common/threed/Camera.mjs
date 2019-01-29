import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import { $, div } from '/utils/pelems.mjs';

class Camera extends Component {
    constructor(props) {
        super(props); 
        const {id, x, y, z, width, height, clipFar, onReady} = {...this.props};
        const CLIP_FAR = 696000*1000000;
        
        this.camera = new THREE.PerspectiveCamera( 75,  width/height, 0.1, clipFar || CLIP_FAR );
        // TO DO refactor to more suitable component
        // if(withHelper) {
        //   const helper = new THREE.CameraHelper( camera );
        //   scene.add(helper);
        // }

        // Set camera position
        this.camera.position.z = z;
        this.camera.position.y = y;
        this.camera.position.x = x;
    }

    componentDidMount() {
        if(this.camera && this.props.renderer) {
            this.props.renderer.setSize( this.props.width, this.props.height );
            this.props.onReadyStateChange(this.props.id, this.props.sceneId, this.camera, (scene,camera)=>this.props.renderer.render(scene,camera));
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.camera && !prevProps.renderer && this.props.renderer) {
            this.props.renderer.setSize( this.props.width, this.props.height );
            this.props.onReadyStateChange(this.props.id, this.props.sceneId, this.camera, this.props.renderer.render);
        }
    }


	render() {
        return div(null,'Camera!');
    }
}


export default $(Camera);