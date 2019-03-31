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

	setRef = ref => {
		if(ref) {
			ref.className === 'sun-label' && (this.sunRef = ref);
			ref.className === 'mercury-label' && (this.mercuryRef = ref);
			ref.className === 'venus-label' && (this.venusRef = ref);
		}
	}

	renderPanelView = (canvas, state, onViewStateChanged) => { // TO DO Refactor to improve performance
		const {x,y,z} = state.cameras && state.cameras.main.position	 ? state.cameras.main.position : {};
		const rotation = state.cameras && state.cameras.main.rotation ? state.cameras.main.rotation : {};
		
		if(this.sunRef && state.entities) {
			this.sunRef.style.left = state.entities.sun.projection.x + 'px'; 
			this.sunRef.style.top = state.entities.sun.projection.y + 'px';
			this.mercuryRef.style.left = state.entities.mercury.projection.x + 'px'; 
			this.mercuryRef.style.top = state.entities.mercury.projection.y + 'px';
			this.venusRef.style.left = state.entities.venus.projection.x + 'px'; 
			this.venusRef.style.top = state.entities.venus.projection.y + 'px';
		}
		return div({className:'view'},
			canvas, CamPanel({
				x,y,z,
				_x: rotation.x, _y: rotation.y, _z:rotation.z,
				enableControls: true,
				camSpeed: 	state.cameras && state.cameras.main.speed,
				camInertia: state.cameras && state.cameras.main.inertiaEnabled,
				onCamSpeedChange: (movementSpeed)=>{onViewStateChanged({movementSpeed})},
				onCamInertiaClick: (inertiaEnabled)=>{onViewStateChanged({inertiaEnabled})},
			}),
			div({style:'position: absolute; color: white;', class: 'sun-label', ref: this.setRef}, 'Sun'),
			div({style:'position: absolute; color: white;', class: 'mercury-label', ref: this.setRef}, 'Mercury'),
			div({style:'position: absolute; color: white;', class: 'venus-label', ref: this.setRef}, 'Venus')

		);
	}

	render(props, state) {
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
			)
		)
	}
}

export default h(connect('count', actions)(App))