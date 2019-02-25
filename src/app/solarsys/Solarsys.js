import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import { $, _, div } from '/utils/pelems.mjs';
import FlyControls from '/utils/fly-controls.js';
import {getCurrentPositions, bodyIds} from './SolarsysService.mjs';

const AU2KM = 149598000;
const SOLAR_RADIUS = 696000;

const DEFAULT_CAM_SPEED = 696000000;
class Solarsys extends Component {
    constructor(props) {
        super(props);
        
        const data = getCurrentPositions();
        this.bodies     = data.positions;
        this.interval   = data.interval;
        // SET SUN
        this.bodies[0].$instance = addPlanet(props.addToScene, Object.assign({}, this.bodies[0]));
        // SET MERCURY
        this.bodies[1].$instance = addPlanet(props.addToScene, Object.assign({}, this.bodies[1]));
        createOrbitVisualization(props.addToScene, Object.assign({}, this.bodies[0].coordinates[0]), Object.assign({}, this.bodies[1].coordinates[0]));
        // SET VENUS
        this.bodies[2].$instance = addPlanet(props.addToScene, Object.assign({}, this.bodies[2]));
        createOrbitVisualization(props.addToScene, Object.assign({}, this.bodies[0].coordinates[0]), Object.assign({}, this.bodies[2].coordinates[0]));
    
        starForge(props.addToScene);   // to do refactor

        this.loopTick           = this.loopTick.bind(this);
        this.handleSceneChildren = this.handleSceneChildren.bind(this);
        this.setupCamera         = this.setupCamera.bind(this);
        this.viewActionCallback = this.viewActionCallback.bind(this);

        this.sceneState = {
            cameras: {
                main: {
                    position: null, rotation: null,
                    speed: DEFAULT_CAM_SPEED, inertiaEnabled: false
                }
            },
            entities: {
                sun: {position: this.bodies[0].$instance.position, rotation: this.bodies[0].$instance.rotation}
            }
        };
    }

    handleSceneChildren(children) {
        return children;
    }
    
	render(props, state) {
        if(props.children.length) {
            return div(_,this.handleSceneChildren(props.children))
        } else {
            return props.render && props.render();  // reconsider usage of renderprop in future
        }
    }

    loopTick(clock){
        // this.bodies[0].$instance.rotation.x += 0.01;
        // this.bodies[0].$instance.rotation.y += 0.01;
        this.moveBody(0, clock) // SUN

        if(this.mainCamControls) {
            const delta = clock.getDelta();
            this.mainCamControls.movementSpeed = (this.camSpeed || DEFAULT_CAM_SPEED) * delta;
            this.mainCamControls.update( delta );
        }

        return this.sceneState;
    }

	moveBody(bodyIdx, clock) { // TO DO Refactor how IDs are used and intervals are handled (use mid as well)
        const time = getTime();
        let coord1, coord2;
        if(time < this.bodies[bodyIdx].coordinates[1].time) {
            coord1 = this.bodies[bodyIdx].coordinates[0];
            coord2 = this.bodies[bodyIdx].coordinates[1];
        } else {
            coord1 = this.bodies[bodyIdx].coordinates[1];
            coord2 = this.bodies[bodyIdx].coordinates[2];
        }

		const t = time / coord2.time;
		this.bodies[bodyIdx].$instance.position.set(
			lerp(coord1.x, coord2.x, t),
			lerp(coord1.y, coord2.y + 696000*2, t), //lerp(coord1.y, coord2.y + 100000000000000, t),
			lerp(coord1.z, coord2.z, t)
		);
	}

    viewActionCallback(cameraId, state) {
        switch(cameraId) {
            case "MAIN": {
                console.log('viewActionCallback', cameraId, state);
                this.mainCamControls.inertiaEnabled = state.inertiaEnabled ? state.inertiaEnabled : this.mainCamControls.inertiaEnabled;
                this.camSpeed                       = state.movementSpeed ? state.movementSpeed : this.camSpeed;
            }
        }
    }

    setupCamera(cameraId, camera, domElement) {
        console.log('setupCamera:', cameraId);
        switch(cameraId) {
            case "MAIN": {
                this.camSpeed = DEFAULT_CAM_SPEED;
                const controls = new FlyControls( camera );
                    controls.movementSpeed = 1000;
                    controls.domElement = domElement;
                    controls.rollSpeed = Math.PI / 24;
                    controls.autoForward = false;
                    controls.dragToLook = true; // FIXME // on true direction fails after hitting input
                    controls.inertiaEnabled = false;
                this.mainCamControls = controls;
                this.sceneState.cameras.main.position = this.mainCamControls.object.position;
                this.sceneState.cameras.main.rotation = this.mainCamControls.object.rotation;
                if(false) {
                    const helper = new THREE.CameraHelper( camera );
                    this.props.addToScene(helper);
                }
            }
        }
    }
}

function lerp(a, b, t) {
    return a + (b - a) * t
}

function addPlanet(addToScene, planetData, color = 0xffff00) {
    var g = new THREE.SphereGeometry( planetData.radius, 12, 12 );
    var m = new THREE.MeshBasicMaterial( { color } );
    var planet = new THREE.Mesh( g, m );
    planet.position.set(planetData.coordinates[0].x, planetData.coordinates[0].y ,planetData.coordinates[0].z);
    addToScene( planet );
    return planet;
}
function distanceVector( v1, v2 )
{
    var dx = v1.x - v2.x;
    var dy = v1.y - v2.y;
    var dz = v1.z - v2.z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}

function createOrbitVisualization(addToScene, center, object) {
    const radius = distanceVector(center, object)
    const curve = new THREE.EllipseCurve(
        0,  0,            // ax, aY
        radius, radius,           // xRadius, yRadius
        0,  2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
    );
    const curveGeometry = new THREE.BufferGeometry().setFromPoints( curve.getPoints( 50 ) );
    const curveMaterial = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    
    const orbit = new THREE.Line( curveGeometry, curveMaterial );
    orbit.position.set(center.x,center.y,center.z);
    addToScene( orbit ); 
    // rotate orbit to hold and object on it
    const plnVector = new THREE.Vector3(object.x,object.y,0);
    const objVector = new THREE.Vector3(object.x,object.y,object.z);
    const orbVector = new THREE.Vector3(orbit.position.x,orbit.position.y,orbit.position.z);
    const zAngle = plnVector.angleTo(objVector);
    const aAngle = plnVector.angleTo(orbVector);
    orbit.rotateZ(aAngle);
    orbit.rotateX(zAngle);
}

function starForge(addToScene) {
    /* 	Yep, it's a Star Wars: Knights of the Old Republic reference,
        are you really surprised at this point? 
                                                */
    const r = SOLAR_RADIUS*100;
    let i, starsGeometry = [ new THREE.BufferGeometry(), new THREE.BufferGeometry() ];
    var vertices1 = [];
    var vertices2 = [];
    var vertex = new THREE.Vector3();
    for ( i = 0; i < 250; i ++ ) {
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar( r );
        vertices1.push( vertex.x, vertex.y, vertex.z );
    }
    for ( i = 0; i < 1500; i ++ ) {
        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar( r );
        vertices2.push( vertex.x, vertex.y, vertex.z );
    }
    starsGeometry[ 0 ].addAttribute( 'position', new THREE.Float32BufferAttribute( vertices1, 3 ) );
    starsGeometry[ 1 ].addAttribute( 'position', new THREE.Float32BufferAttribute( vertices2, 3 ) );
    var stars;
    var starsMaterials = [
        new THREE.PointsMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
    ];
    for ( i = 10; i < 30; i ++ ) {
        stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );
        stars.rotation.x = Math.random() * 6;
        stars.rotation.y = Math.random() * 6;
        stars.rotation.z = Math.random() * 6;
        stars.scale.setScalar( i * 10 );
        stars.matrixAutoUpdate = false;
        stars.updateMatrix();
        addToScene( stars );
    }
}

function getTime() {
    return Date.now();
}

export default $(Solarsys);