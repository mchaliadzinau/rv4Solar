import { Component, h } from '/@/preact.mjs';
import { $, _, div, table, tr, td, h2 } from '/utils/pelems.mjs';
import Solarsys from './solarsys/Solarsys.js';
import Camera from './common/threed/Camera.mjs';
import { setupOverlay } from '/utils/init-overlay.js';
import CamPanel from './common/threed/camPanel/CamPanel.mjs';
import * as THREE from '/@/three.mjs';
import View from './common/threed/View.mjs';


import SceneManager from './common/threed/SceneManager.mjs';

import { connect } from '/@/unistore/integrations/preact.mjs';
import {actions} from '../stores/solarsys.store.mjs'

class App extends Component {
	constructor(props) {
		super(props);

		this.renderers = {};

		this.onLoopRenderPhase = this.onLoopRenderPhase.bind(this);

		this.setup 					= this.setup.bind(this)
		// this.initLoop 				= this.initLoop.bind(this)
		this.renderCamera 			= this.renderCamera.bind(this);
		this.onViewUpdate 			= this.onViewUpdate.bind(this);

		this.state = {
			isSolarReady: false,
			viewsReady: false	// TO DO Refactor
			// lastKeyFrame: 0
		}

	}
	componentDidMount() {
		this.setState({ message:'rv4Solar project init!' });
		this.props.increment();
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

	onLoopRenderPhase(sceneId, scene, updatedCameras) {

	}

	onViewUpdate(sceneId, cameraId, render, width, height, domElement) {
		this.renderers[`${sceneId}-${cameraId}`] = {render, width, height, domElement};
		this.setState({viewsReady: true});	// TO DO Refactor
	}

	renderCamera(sceneId, cameraId, position, clipFar) {
		const {x,y,z} = {...position};
		const rendererId = `${sceneId}-${cameraId}`;
		const renderer = this.renderers[rendererId];
		const {width, height, domElement} = {...renderer};

		return this.state.viewsReady && !!renderer && Camera({
			id: cameraId, onRender: renderer.render,
			clipFar, x, y, z, 
			width, height, 
			domElement
		})
	}

	renderPanelView(canvas, state, onViewStateChanged) {
		const {x,y,z} = state.mainCamPosition	 ? state.mainCamPosition : {};
		const rotation = state.mainCamRotation	 ? state.mainCamRotation : {};
		return div({className:'view'},
			canvas, CamPanel({
				x,y,z,
				_x: rotation.x, _y: rotation.y, _z:rotation.z,
				enableControls: true,
				onCamSpeedChange: (movementSpeed)=>{onViewStateChanged({movementSpeed})},
				onCamInertiaClick: (inertiaEnabled)=>{onViewStateChanged({inertiaEnabled})},
			})
		);
	}

	render(props, state) {
		// const position = this.camera ? this.camera.position : {};
		// const rotation = this.camera ? this.camera.rotation : {};
		// const {x,y,z} = position;
		// const {_x,_y,_z} = rotation;
		// const inertiaEnabled = this.controls ?  this.controls.inertiaEnabled : false;
		return (
			div(_,
				SceneManager({onLoopRenderPhase: this.onLoopRenderPhase},
					Solarsys({sceneId:1}, 
						this.renderCamera(
							1,'MAIN',
							{z:-12507.576005649345+65804560.09749729,y:1059308.133517735,x:43571.53266016538}, 
							696000*1000000
						)
					)
				),
				View({
					sceneId: 1,
					cameraId: 'MAIN',
					width: window.innerWidth,
					height: window.innerHeight,
					onUpdate: this.onViewUpdate,
					render: this.renderPanelView // can be omitted if only canvas is required
				})
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

export default h(connect('count', actions)(App))