import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import { $, _, div } from '/utils/pelems.mjs';
import FlyControls from '/utils/fly-controls.js';
import {getCurrentPositions, bodyIds} from './SolarsysService.mjs';

const AU2KM = 149598000;
const SOLAR_RADIUS = 696000;
const DEBUG = true;
const DEBUG_TIME_MULTIPLIER = 6000;

const DEFAULT_CAM_SPEED = 696000000;
class Solarsys extends Component {
    constructor(props) {
        super(props);
        
        this.getData();
        // SET SUN
        this.bodies[0].$instance = addPlanet(props.addToScene, Object.assign({}, this.bodies[0]));
        // SET MERCURY
        this.bodies[1].$instance = addPlanet(props.addToScene, Object.assign({}, this.bodies[1]));
        DEBUG && (this.bodies[1].$debug = {
            startDummyPos: addPlanet(props.addToScene, Object.assign({}, this.bodies[0])), 
            endDummyPos: addPlanet(props.addToScene, Object.assign({}, this.bodies[0])), 
        });
        createOrbitVisualization(props.addToScene, {x:0, y: 0, z: 0}, Object.assign({}, this.bodies[1].orbit));
        // SET VENUS
        this.bodies[2].$instance = addPlanet(props.addToScene, Object.assign({}, this.bodies[2]));
        createOrbitVisualization(props.addToScene, {x:0, y: 0, z: 0}, Object.assign({}, this.bodies[2].orbit));
        // SET EARTH
        this.bodies[3].$instance = addPlanet(props.addToScene, Object.assign({}, this.bodies[3]));
        createOrbitVisualization(props.addToScene, {x:0, y: 0, z: 0}, Object.assign({}, this.bodies[3].orbit));
        
        // SET MARS
        this.bodies[4].$instance = addPlanet(props.addToScene, Object.assign({}, this.bodies[4]));
        createOrbitVisualization(props.addToScene, {x:0, y: 0, z: 0}, Object.assign({}, this.bodies[4].orbit));
                

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

    getData = (ms) => {
        const data = getCurrentPositions(ms);
        if(!this.bodies) {
            this.bodies = data.positions;
        } else {
            this.bodies.map((body,idx)=>{
                body.coordinates = data.positions[idx].coordinates;
                body.orbit = data.positions[idx].orbit;
                return body;
            });
        }
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
        // this.moveBody(0, clock) // SUN
        this.moveBody(1, clock) // MERCURY
        // this.moveBody(2, clock) // VENUS

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
        const time = getTime(clock);
        let coord1, coord2;
        if(time < this.bodies[bodyIdx].coordinates[1].time) {
            coord1 = this.bodies[bodyIdx].coordinates[0];
            coord2 = this.bodies[bodyIdx].coordinates[1];
        } else if(time >= this.bodies[bodyIdx].coordinates[1].time && time < this.bodies[bodyIdx].coordinates[2] ){
            coord1 = this.bodies[bodyIdx].coordinates[1];
            coord2 = this.bodies[bodyIdx].coordinates[2];
        } else {
            this.getData(time);
            coord1 = this.bodies[bodyIdx].coordinates[0];
            coord2 = this.bodies[bodyIdx].coordinates[1];
        }

        DEBUG && this.bodies[bodyIdx].$debug && this.bodies[bodyIdx].$debug.startDummyPos.position.set(coord1.x, coord1.y, coord1.z);
        DEBUG && this.bodies[bodyIdx].$debug && this.bodies[bodyIdx].$debug.endDummyPos.position.set(coord2.x, coord2.y, coord2.z);
        const t = (coord2.time - time) / (coord2.time - coord1.time);
        DEBUG && console.log('|','\tt\t|\t', t);
        const vec = new THREE.Vector3(coord2.x, coord2.y, coord2.z);
        const endPosVec = new THREE.Vector3(coord1.x, coord1.y, coord1.z);
        vec.lerp(endPosVec, t);
		this.bodies[bodyIdx].$instance.position.set(
			vec.x,
			vec.y,
			vec.z
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
    orbit[0] && orbit[1] && orbit[2] && addToScene(createOrbitSegmentGeometry(orbit[0], orbit[1], orbit[2], addToScene));
    orbit[2] && orbit[3] && orbit[4] && addToScene(createOrbitSegmentGeometry(orbit[2], orbit[3], orbit[4], addToScene));
    orbit[4] && orbit[5] && orbit[6] && addToScene(createOrbitSegmentGeometry(orbit[4], orbit[5], orbit[6], addToScene));
    orbit[6] && orbit[7] && orbit[8] && addToScene(createOrbitSegmentGeometry(orbit[6], orbit[7], orbit[8], addToScene));
}

function createOrbitSegmentGeometry(point1, point2, point3, addToScene) {
    const p1 = new THREE.Vector3( point1.x, point1.y, point1.z );
    const p2 = new THREE.Vector3( point2.x, point2.y, point2.z );
    const p3 = new THREE.Vector3( point3.x, point3.y, point3.z );

    const p1p3middle = new THREE.Vector3( (p1.x + p3.x)/2 , (p1.y + p3.y)/2, (p1.z + p3.z)/2 );

    const controlPoint = new THREE.Vector3(2*p2.x - p1p3middle.x, 2*p2.y - p1p3middle.y, 2*p2.z - p1p3middle.z,);

    addToScene(new THREE.ArrowHelper(controlPoint.clone().normalize(), controlPoint, AU2KM, 0xCC0000 ) )
    const curve = new THREE.QuadraticBezierCurve3(p1, controlPoint, p3);
    const points = curve.getPoints( 50 );
    const geometry = new THREE.BufferGeometry().setFromPoints( points );
    const lineSegments = new THREE.LineSegments( geometry, new THREE.LineDashedMaterial( {
        color: 0xffffff,
        linewidth: 1,
        scale: 1,
        dashSize: 1,
        gapSize: 0.5,
    }));
    lineSegments.computeLineDistances();
    return lineSegments;
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

function getTime(clock) {
    const now = Date.now();
    if(DEBUG) {
        const debugTime = now + (clock.elapsedTime*1000) * DEBUG_TIME_MULTIPLIER;
        console.log('|','\tdebugTime\t|\t', new Date(debugTime));
        return now + (clock.elapsedTime*1000) * 20000;
    } else return Date.now();
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