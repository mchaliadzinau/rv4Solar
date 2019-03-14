import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import { $, _, div } from '/utils/pelems.mjs';
import FlyControls from '/utils/fly-controls.js';
import {getCurrentPositions, bodyIds} from './SolarsysService.mjs';

const AU2KM = 149598000;
const SOLAR_RADIUS = 696000;
const DEBUG = true;

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
        createOrbitVisualization(props.addToScene, {x:0, y: 0, z: 0}, Object.assign({}, this.bodies[1].orbit));
        // SET VENUS
        this.bodies[2].$instance = addPlanet(props.addToScene, Object.assign({}, this.bodies[2]));
        createOrbitVisualization(props.addToScene, {x:0, y: 0, z: 0}, Object.assign({}, this.bodies[2].orbit));
    
        starForge(props.addToScene);   // to do refactor

        if(DEBUG) {
            const startPoint = {x: 0, y: 0, z: 0},
                dirX = {x: 1, y: 0, z: 0},
                dirY = {x: 0, y: 1, z: 0},
                dirZ = {x: 0, y: 0, z: 1};
            // const arrowX = new THREE.ArrowHelper(dirX, startPoint, AU2KM, 0xCC0000 );
            // const arrowY = new THREE.ArrowHelper(dirY, startPoint, AU2KM, 0xFFFF00 );
            // const arrowZ = new THREE.ArrowHelper(dirZ, startPoint, AU2KM, 0x0000FF );
            // props.addToScene(arrowX);
            // props.addToScene(arrowY);
            // props.addToScene(arrowZ);
            props.addToScene(new THREE.AxesHelper( SOLAR_RADIUS * 10 ));
        }

        this.loopTick           = this.loopTick.bind(this);
        this.handleSceneChildren = this.handleSceneChildren.bind(this);
        this.setupCamera         = this.setupCamera.bind(this);
        this.viewActionCallback = this.viewActionCallback.bind(this);

        this.sceneState = {
            cameras: {
                main: {
                    position: null, rotation: null,
                    speed: this.camSpeed, inertiaEnabled: false
                }
            },
            entities: {
                sun: { position: this.bodies[0].$instance.position,  rotation: this.bodies[0].$instance.rotation },
                mercury: { position: this.bodies[1].$instance.position,  rotation: this.bodies[1].$instance.rotation },
                venus: { position: this.bodies[2].$instance.position,  rotation: this.bodies[2].$instance.rotation },
            }
        };
    }

    getData = () => {
        const data = getCurrentPositions();
        this.bodies     = data.positions;
        this.interval   = data.interval;
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
        this.moveBody(1, clock) // MERCURY
        this.moveBody(2, clock) // VENUS

        if(this.mainCamControls) {
            const delta = clock.getDelta();
            this.mainCamControls.movementSpeed = (this.camSpeed || DEFAULT_CAM_SPEED) * delta;
            this.mainCamControls.update( delta );
            
            this.sceneState.entities.sun.projection = toScreenPosition(this.bodies[0].$instance, this.mainCamControls);
            this.sceneState.entities.mercury.projection = toScreenPosition(this.bodies[1].$instance, this.mainCamControls);
            this.sceneState.entities.venus.projection = toScreenPosition(this.bodies[2].$instance, this.mainCamControls);
            this.sceneState.cameras.main.speed = (this.camSpeed || DEFAULT_CAM_SPEED);
        }

        return this.sceneState;
    }

	moveBody(bodyIdx, clock) { // TO DO Refactor how IDs are used and intervals are handled (use mid as well)
        const time = getTime();
        let coord1, coord2;
        if(time < this.bodies[bodyIdx].coordinates[1].time) {
            coord1 = this.bodies[bodyIdx].coordinates[0];
            coord2 = this.bodies[bodyIdx].coordinates[1];
        } else if(time >= this.bodies[bodyIdx].coordinates[1].time){
            coord1 = this.bodies[bodyIdx].coordinates[1];
            coord2 = this.bodies[bodyIdx].coordinates[2];
        } else {
            this.getData();
            coord1 = this.bodies[bodyIdx].coordinates[0];
            coord2 = this.bodies[bodyIdx].coordinates[1];
        }

		const t = (coord2.time - time) / (coord2.time - coord1.time);
		this.bodies[bodyIdx].$instance.position.set(
			lerp(coord1.x, coord2.x, t),
			lerp(coord1.y, coord2.y, t),
			lerp(coord1.z, coord2.z, t)
		);
	}

    viewActionCallback(cameraId, state) {
        switch(cameraId) {
            case "MAIN": {
                console.log('viewActionCallback', cameraId, state);
                this.mainCamControls.inertiaEnabled = typeof state.inertiaEnabled !== 'undefined' ? state.inertiaEnabled : this.mainCamControls.inertiaEnabled;
                this.camSpeed                       = typeof state.movementSpeed !== 'undefined' ? state.movementSpeed : this.camSpeed;
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

function createOrbitVisualization(addToScene, center, orbit) {
    const material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
    addToScene(createOrbitSegmentGeometry(orbit, 0, material, addToScene));
    addToScene(createOrbitSegmentGeometry(orbit, 2, material, addToScene));
    addToScene(createOrbitSegmentGeometry(orbit, 4, material, addToScene));
    addToScene(createOrbitSegmentGeometry(orbit, 6, material, addToScene));
}

function createOrbitSegmentGeometry(orbit, idx, material, addToScene) {
    const p1 = new THREE.Vector3( orbit[idx].x, orbit[idx].y, orbit[idx].z );
    const p2 = new THREE.Vector3( orbit[idx + 1].x, orbit[idx + 1].y, orbit[idx + 1].z );
    const p3 = new THREE.Vector3( orbit[idx + 2].x, orbit[idx + 2].y, orbit[idx + 2].z );

    const p1p3middle = new THREE.Vector3( (p1.x + p3.x)/2 , (p1.y + p3.y)/2, (p1.z + p3.z)/2 );

    const controlPoint = new THREE.Vector3(2*p2.x - p1p3middle.x, 2*p2.y - p1p3middle.y, 2*p2.z - p1p3middle.z,);

    addToScene(new THREE.ArrowHelper(controlPoint.clone().normalize(), controlPoint, AU2KM, 0xCC0000 ) )
    const curve = new THREE.QuadraticBezierCurve3(p1, controlPoint, p3);
    const points = curve.getPoints( 50 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    return new THREE.Line( geometry, material );
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

function toScreenPosition(obj, camera) {
    const vector = new THREE.Vector3();
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera.object);
    vector.x = ( vector.x * 0.5*camera.domElement.clientWidth ) + 0.5*camera.domElement.clientWidth; 
    vector.y = - ( vector.y * 0.5*camera.domElement.clientHeight ) + 0.5*camera.domElement.clientHeight; 
    return vector;
}


export default $(Solarsys);