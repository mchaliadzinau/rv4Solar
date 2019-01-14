import { Component } from '/@/preact.mjs';
import { $, _, div, table, tr, td, h2 } from '/utils/pelems.mjs';
import Solarsys from './solarsys/Solarsys.js';
import Display from './common/display/Display.js';
import { setupOverlay } from '/utils/init-overlay.js';
import CamPanel from './common/threed/camPanel/CamPanel.mjs';
import FlyControls from '/utils/fly-controls.js';
import * as THREE from '/@/three.mjs';


const KEY_FRAME_MIN_INTERVAL = 0.05;
const DEFAULT_CAM_SPEED = 696000000;
export default class App extends Component {
	constructor(props) {
		super(props);
		this.setup 					= this.setup.bind(this)
		this.setupCameraControls 	= this.setupCameraControls.bind(this)
		this.initLoop 				= this.initLoop.bind(this)
		this.renderDisplay 			= this.renderDisplay.bind(this);
		this.state = {
			isSolarReady: false,
			lastKeyFrame: 0
		}

	}
	componentDidMount() {
		this.setState({ message:'rv4Solar project init!' });
		// SolarInit();
	}

	setup(scene, renderer, camera, parentElement) {
		this.camera = camera; // TEMPORAL fro CamPanel
		this.controls = this.setupCameraControls(camera, renderer);
		this.initLoop(
			scene,
			renderer, 
			camera
		)
		this.setState({isSolarReady: true});
	}

	setupCameraControls(camera, renderer) {
        //
        this.camSpeed = DEFAULT_CAM_SPEED;
        var controls = new FlyControls( camera );
            controls.movementSpeed = 1000;
            controls.domElement = renderer.domElement;
            controls.rollSpeed = Math.PI / 24;
            controls.autoForward = false;
            controls.dragToLook = false; // FIXME // on true direction fails after hitting input
			controls.inertiaEnabled = false;
		return controls;
	}
	
	initLoop(scene, renderer, camera, updateLabelsPos, updateCameraStats) {
		const clock = new THREE.Clock();
		const {sun, venus, mercury} = {...this.objects};

		const animate = () => {
			requestAnimationFrame( animate, renderer.domElement );
			
			sun.rotation.x += 0.01;
			sun.rotation.y += 0.01;
		
			// updateLabelsPos({mercury, venus});
			// //panel
			// updateCameraStats(camera);
			
			var delta = clock.getDelta();
			this.controls.movementSpeed = this.camSpeed * delta;
			this.controls.update( delta );
			// console.log(delta); // WTF?!
		
			renderer.render( scene, camera );
			// display.renderer2.render( scene, display.camera2 );

			if(clock.elapsedTime - this.state.lastKeyFrame > KEY_FRAME_MIN_INTERVAL) {
				this.setState({lastKeyFrame: clock.elapsedTime})
			}
		}
		animate();
	}

	renderDisplay(data,scene, sun, venus, mercury) {
		this.objects = {sun, venus, mercury};
		return $(Display)({
			data,scene, sun, venus, mercury,
			camPos: {
				z:data.sun.radius+65804560.09749729, y: data.sun.Y, x: data.sun.X
			}, 
			width: window.innerWidth, 
			height: window.innerHeight, 
			withHelper: false,
			onDisplayReady: this.setup
		});
	}

	render(props, state) {
		const position = this.camera ? this.camera.position : {};
		const rotation = this.camera ? this.camera.rotation : {};
		const {x,y,z} = position;
		const {_x,_y,_z} = rotation;
		const inertiaEnabled = this.controls ?  this.controls.inertiaEnabled : false;
		return (
			div(_,
				$(Solarsys)({render: this.renderDisplay}),
				CamPanel({
					x, y, z, 
					_x, _y, _z,
					enableControls: true,
					camSpeed: 	this.camSpeed, 		onCamSpeedChange: 	speed => {this.camSpeed = speed},
					camInertia: inertiaEnabled, 	onCamInertiaClick: 	inertia => {this.controls.inertiaEnabled = inertia},
				})
			)
		)
	}
}