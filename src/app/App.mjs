import { Component } from '/@/preact.mjs';
import { $, _, div, table, tr, td, h2 } from '/utils/pelems.mjs';
import Solarsys from './solarsys/Solarsys.js';
import Camera from './common/threed/Camera.mjs';
import { setupOverlay } from '/utils/init-overlay.js';
import CamPanel from './common/threed/camPanel/CamPanel.mjs';
import FlyControls from '/utils/fly-controls.js';
import * as THREE from '/@/three.mjs';

import SceneManager from './common/threed/SceneManager.mjs';

export default class App extends Component {
	constructor(props) {
		super(props);

		this.renderers = {
			'1-MAIN': new THREE.WebGLRenderer() // TO DO Refactor renders instantiation to <Display/> component 
		};

		this.onLoopRenderPhase = this.onLoopRenderPhase.bind(this);

		this.setup 					= this.setup.bind(this)
		this.setupCameraControls 	= this.setupCameraControls.bind(this)
		this.setupCanvas 			= this.setupCanvas.bind(this);
		// this.initLoop 				= this.initLoop.bind(this)
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

	setup(renderer, camera) {
		this.camera = camera; // TEMPORAL fro CamPanel
		this.controls = this.setupCameraControls(camera, renderer);
		this.initLoop(
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

	renderDisplay(data, sun, venus, mercury) {
		this.objects = {sun, venus, mercury};
		return $(View)({
			data, sun, venus, mercury,
			camPos: {
				z:data.sun.radius+65804560.09749729, y: data.sun.Y, x: data.sun.X
			}, 
			width: window.innerWidth, 
			height: window.innerHeight, 
			withHelper: false,
			onDisplayReady: this.setup
		});
	}

	setupCanvas(ref) {
		if(ref) {
			ref.appendChild( this.renderers['1-MAIN'].domElement );
		}
	}

	onLoopRenderPhase(sceneId, scene, updatedCameras) {

	}

	render(props, state) {
		const position = this.camera ? this.camera.position : {};
		const rotation = this.camera ? this.camera.rotation : {};
		const {x,y,z} = position;
		const {_x,_y,_z} = rotation;
		const inertiaEnabled = this.controls ?  this.controls.inertiaEnabled : false;
		return (
			div(_,
				// $(Solarsys)({render: this.renderDisplay}),
				SceneManager({onLoopRenderPhase: this.onLoopRenderPhase},
					Solarsys({
							// render: this.renderDisplay, 
							sceneId:1
						}
						,Camera({
							id: 'MAIN', 
							renderer: this.renderers['1-MAIN'],

							z: -12507.576005649345 + 65804560.09749729, y: 1059308.133517735, x: 43571.53266016538,

							width: window.innerWidth, 
							height: window.innerHeight, 
						})
					),

					div({ref: this.setupCanvas, class:'canvas-wrapper'})
				)
				// ,CamPanel({
				// 	x, y, z, 
				// 	_x, _y, _z,
				// 	enableControls: true,
				// 	camSpeed: 	this.camSpeed, 		onCamSpeedChange: 	speed => {this.camSpeed = speed},
				// 	camInertia: inertiaEnabled, 	onCamInertiaClick: 	inertia => {this.controls.inertiaEnabled = inertia},
				// })
			)
		)
	}
}