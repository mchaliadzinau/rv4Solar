import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import {$,_,div} from '/utils/pelems.mjs';

const KEY_FRAME_MIN_INTERVAL = 0.05;

class SceneManager extends Component {
	constructor(props) {
        super(props);
        
        this.scenes = {}; // scenes[sceneId] = {instance, cameras: {}, state}
        this.state = {
            loopIsSpinning: false,
            lastKeyFrame: 0
        };

        this.handleChildren = this.handleChildren.bind(this);
        this.cameraStateHandler = this.cameraStateHandler.bind(this);

	}
	componentDidMount() {
		
    }

    cameraStateHandler(id, sceneId, camera, render) {
        this.scenes[sceneId].cameras[id] = render ? {camera, render} : undefined;  // TO DO refactor to make scene.cameras of array type
    }

    handleChildren(children) {
        return children.map(child=>{
            if(!child.attributes) return child; // DEBUG
            const sceneId = child.attributes.sceneId;

            this.scenes[sceneId] = this.scenes[sceneId] ? this.scenes[sceneId] : {cameras: {}};
            this.scenes[sceneId].instance = this.scenes[sceneId].instance ? this.scenes[sceneId].instance : new THREE.Scene();;
            
            child.attributes.onclick=(e)=>{alert(e)};
            child.attributes.addToScene = (obj)=>this.scenes[sceneId].instance.add(obj); // TO DO make intermediate add function inside SceneManager to be able to track scene changes
            // on scene ready it returns reference to loopTick(clock) function which should be called every loop to enable scene control by SceneComponent
            child.attributes.ref = (ref) => {
                if(ref && ref.loopTick) {
                    this.scenes[sceneId].isReady = true;
                    this.scenes[sceneId].loopFn = ref.loopTick;
                    this.runLoop();
                } else {
                    ref && console.warn(ref.constructor.name, 'loopTick method is not defined!')
                }
            } 
            // hnalde scene cameras
            child.children.map(c=> { // TO DO Render inside SceneManager to avoid overriding inside Scene components
                if(c && c.constructor.name=='VNode' && c.nodeName.name=='Camera') {
                    c.attributes.sceneId = sceneId;
                    c.attributes.onReadyStateChange = this.cameraStateHandler;
                }
                return c;
            });

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
                this.scenes[id].state = this.scenes[id].loopFn(clock, this.scenes[id].cameras); //TO DO provide only methods and readonly data
            }
        });
    }
    
    loopRenderPhase(sceneIds, clock) {
        sceneIds.forEach(sceneId=>{
            if(this.scenes[sceneId].isReady && this.scenes[sceneId].cameras) {
                const scene = this.scenes[sceneId];
                const cameraIds = Object.keys(scene.cameras); // TO DO refactor to make scene.cameras of array type
                for(let i = 0; i < cameraIds.length; i++) {
                    const cam = scene.cameras[cameraIds[i]];
                    cam.render(scene.instance, cam.camera, clock, scene.state)
                }
                // this.props.onLoopRenderPhase(sceneId, scene.instance, scene.updatedCameras); // TO DO try to avoid passing scene, camera references outside SceneManager
            }
        });

        if(clock.elapsedTime - this.state.lastKeyFrame > KEY_FRAME_MIN_INTERVAL) {
            this.setState({lastKeyFrame: clock.elapsedTime})
        }
    }
}

export default $(SceneManager);