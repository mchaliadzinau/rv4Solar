import * as THREE from '/@/three.mjs';
import FlyControls from '/utils/fly-controls.js';
import {data,sun,mercury,venus,scene} from './init-system.js'; // bundle error
import { setupDisplay } from './init-display.js';

export default function() {
    const display = setupDisplay(scene ,{
        z:data.sun.radius+65804560.09749729, y: data.sun.Y, x: data.sun.X
    }, window.innerWidth, window.innerHeight, false);
    //
    let camSpeed = 696000000;
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
                camSpeed = parseFloat(event.target.value);
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
    
    var clock = new THREE.Clock();
    //
    var animate = function () {
        requestAnimationFrame( animate, display.renderer.domElement );
    
        sun.rotation.x += 0.01;
        sun.rotation.y += 0.01;
    
        display.updateLabelsPos({mercury,venus});
        //panel
        display.updateCameraStats()
        
        var delta = clock.getDelta();
        controls.movementSpeed = camSpeed * delta;
        controls.update( delta );
        // console.log(delta); // WTF?!
    
        display.renderer.render( scene, display.camera );
        // display.renderer2.render( scene, display.camera2 );
    
    }
    
    animate();
}