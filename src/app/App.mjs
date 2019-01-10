import { Component } from '/@/preact.mjs';
import { $, _, div, table, tr, td, h2 } from '/utils/pelems.mjs';
import Solarsys from './solarsys/Solarsys.js';
import Display from './common/display/Display.js';
import { setupOverlay } from '/utils/init-overlay.js';
import FlyControls from '/utils/fly-controls.js';
import * as THREE from '/@/three.mjs';

export default class App extends Component {
	constructor(props) {
		super(props);
		this.setup 					= this.setup.bind(this)
		this.setupCameraControls 	= this.setupCameraControls.bind()
		this.loop 					= this.loop.bind(this)
		this.renderDisplay 			= this.renderDisplay.bind(this);

	}
	componentDidMount() {
		this.setState({ message:'rv4Solar project init!' });
		// SolarInit();
	}

	setup(scene, renderer, camera, parentElement) {

		const overlay = setupOverlay(
			renderer, camera, parentElement,
			// ()=>{console.log('click on overlay!')}
		);
		const controls = this.setupCameraControls({
			camera, renderer, panel:overlay.panel, 

		});
		this.loop(
			scene,
			renderer, 
			camera,
			controls,
			overlay.updateLabelsPos, 
			overlay.updateCameraStats
		)
	}

	setupCameraControls(display) {
        //
        const camSpeed = 696000000;
        var controls = new FlyControls( display.camera );
            controls.movementSpeed = 1000;
            controls.domElement = display.renderer.domElement;
            controls.rollSpeed = Math.PI / 24;
            controls.autoForward = false;
            controls.dragToLook = false; // FIXME // on true direction fails after hitting input
            controls.inertiaEnabled = false;
        const camSpeedControl = display.panel.getElementsByClassName('cam-control-speed')[0];
            camSpeedControl.value = camSpeed;
            camSpeedControl.oninput = (event) => {
                if(!isNaN(event.target.value) && event.target.value > 0 && event.target.value < 900000000000000) {
                    this.camSpeed = parseFloat(event.target.value);
                }
            }
        const camInertiaControl = display.panel.getElementsByClassName('cam-control-inertia')[0];
            camInertiaControl.checked = controls.inertiaEnabled;
            camInertiaControl.onclick = (e)=> {
                if(e.target.checked == true) {
                    controls.inertiaEnabled = true;
                } else {
                    controls.inertiaEnabled = false;
                }
            }
		//
		return controls;
	}
	
	loop(scene, renderer, camera, controls, updateLabelsPos, updateCameraStats) {
		const clock = new THREE.Clock();
		const {sun, venus, mercury} = {...this.objects};

		const animate = () => {
			requestAnimationFrame( animate, renderer.domElement );
			
			sun.rotation.x += 0.01;
			sun.rotation.y += 0.01;
		
			updateLabelsPos({mercury, venus});
			//panel
			updateCameraStats()
			
			var delta = clock.getDelta();
			controls.movementSpeed = this.camSpeed * delta;
			controls.update( delta );
			// console.log(delta); // WTF?!
		
			renderer.render( scene, camera );
			// display.renderer2.render( scene, display.camera2 );
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
		return (
			$(Solarsys)({render: this.renderDisplay})
		)
	}
}