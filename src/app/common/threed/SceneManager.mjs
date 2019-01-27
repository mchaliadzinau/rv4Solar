import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import {$,_,div} from '/utils/pelems.mjs';

class SceneManager extends Component {
	constructor(props) {
        super(props);
        
        this.scenes = {};

        this.state = {
            loopIsSpinning: false
        };

        this.handleChildren = this.handleChildren.bind(this);

	}
	componentDidMount() {
		
    }

    handleChildren(children) {
        return children.map(child=>{
            if(!child.attributes) return child; // DEBUG
            const sceneId = child.attributes.sceneId;

            this.scenes[sceneId] = this.scenes[sceneId] ? this.scenes[sceneId] : {};
            this.scenes[sceneId].instance = this.scenes[sceneId].instance ? this.scenes[sceneId].instance : new THREE.Scene();;
            
            child.attributes.onclick=(e)=>{alert(e)};
            child.attributes.addToScene = (obj)=>this.scenes[sceneId].instance.add(obj); // TO DO make intermediate add function inside SceneManager to be able to track scene changes
            child.attributes.onReady = (loopFnRef) => {
                this.scenes[sceneId].isReady = true;
                this.scenes[sceneId].loopFn = loopFnRef;
                this.runLoop();
            } 


            return child;
        });
    }

    render(props, state) {
        return div(_,
            this.handleChildren(props.children)
        );
    }

    runLoop() {
        if(!this.state.loopIsSpinning) {
            this.setState({loopIsSpinning: true})
            const clock = new THREE.Clock();
            
            const animate = () => {
                requestAnimationFrame( animate ); // consider usage of secnd parameter
    
                const ids = Object.keys(this.scenes);
                
                this.loopChangePhase(ids, clock);
    
                this.loopRenderPhase(ids, clock);
            }
            animate();
        }
    }

    loopChangePhase(sceneIds, clock) {
        sceneIds.forEach(id=>{
            if(this.scenes[id].isReady) {
                const cameras = this.scenes[id].loopFn(clock);
                this.scenes[id].updatedCameras = cameras; 
            }
        });
    }
    
    loopRenderPhase(sceneIds, clock) {
        sceneIds.forEach(sceneId=>{
            if(this.scenes[sceneId].isReady && this.scenes[sceneId].updatedCameras) {
                const scene = this.scenes[sceneId].instance;
                const cameras = this.scenes[sceneId].updatedCameras;
                for(let i = 0; i < cameras.length; i++) {
                    const cam = cameras[i];
                    cam.render(scene, cam.camera)
                }
                // this.props.onLoopRenderPhase(sceneId, scene.instance, scene.updatedCameras); // TO DO try to avoid passing scene, camera references outside SceneManager
            }
        });
    }
}

export default $(SceneManager);