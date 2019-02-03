import { Component } from '/@/preact.mjs';
import * as THREE from '/@/three.mjs';
import { $, _, div } from '/utils/pelems.mjs';
import FlyControls from '/utils/fly-controls.js';


const AU2KM = 149598000;
const SOLAR_RADIUS = 696000;
const data = {
    _updatedAt: '16 August 2018 12:00:00',
    sun: {
        label: 'Sun',
        color: 'red',
        radius: 696000,
        photosphereRadius: 696500,
		"X": 43571.53266016538,
		"Y": 1059308.133517735,
		"Z": -12507.576005649345,
    },
    mercury: {
        label: 'Mercury',
        color: 'gray',
        radius: 2440,
		"X": parseFloat('5.380456009749729E+07'),
		"Y": parseFloat('-1.338060080030250E+07'),
		"Z": parseFloat('-6.124385517224120E+06'),
    },
    venus: {
        label: 'Venus',
        color: 'yellow',
        radius: 6051, // X =  Y = Z =
		"X": parseFloat('1.271345127229626E-01')  * AU2KM ,
		"Y": parseFloat('-7.090862683787544E-01') * AU2KM,
		"Z": parseFloat('-1.722741515705422E-02') * AU2KM,
    }
}; 

const DEFAULT_CAM_SPEED = 696000000;
class Solarsys extends Component {
    constructor(props) {
        super(props);

        // SET SUN
        this.sun = addPlanet(props.addToScene, Object.assign({},data.sun));
        // SET MERCURY
        this.mercury = addPlanet(props.addToScene, Object.assign({},data.mercury));
        createOrbitVisualization(props.addToScene, Object.assign({},data.sun), Object.assign({},data.mercury));
        // SET VENUS
        this.venus = addPlanet(props.addToScene, Object.assign({},data.venus));
        createOrbitVisualization(props.addToScene, Object.assign({},data.sun), Object.assign({},data.venus));
    
        starForge(props.addToScene);   // to do refactor

        this.loopTick           = this.loopTick.bind(this);
        this.handleSceneChildren = this.handleSceneChildren.bind(this);
        this.setupCamera         = this.setupCamera.bind(this);
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
        this.sun.rotation.x += 0.01;
        this.sun.rotation.y += 0.01;

        if(this.mainCamControls) {
            const delta = clock.getDelta();
            this.mainCamControls.movementSpeed = (this.camSpeed || DEFAULT_CAM_SPEED) * delta;
            this.mainCamControls.update( delta );
        }

        return {sunRotation: this.sun.rotation}
    }

    setupCamera(cameraId, camera, domElement) {
        console.log('setupCamera:', cameraId);
        switch(cameraId) {
            case "MAIN": {
                this.camSpeed = DEFAULT_CAM_SPEED;
                let controls = new FlyControls( camera );
                    controls.movementSpeed = 1000;
                    controls.domElement = domElement;
                    controls.rollSpeed = Math.PI / 24;
                    controls.autoForward = false;
                    controls.dragToLook = false; // FIXME // on true direction fails after hitting input
                    controls.inertiaEnabled = false;
                this.mainCamControls = controls;
            }
        }
    }
}

function addPlanet(addToScene, planetData) {// to do refactor
    var g = new THREE.SphereGeometry( planetData.radius, 12, 12 );
    var m = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var planet = new THREE.Mesh( g, m );
    planet.position.set(planetData.X,planetData.Y,planetData.Z);
    addToScene( planet );
    return planet;
}
function distanceVector( v1, v2 )
{
    var dx = v1.X - v2.X;
    var dy = v1.Y - v2.Y;
    var dz = v1.Z - v2.Z;

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
    orbit.position.set(center.X,center.Y,center.Z);
    addToScene( orbit ); 
    // rotate orbit to hold and object on it
    const plnVector = new THREE.Vector3(object.X,object.Y,0);
    const objVector = new THREE.Vector3(object.X,object.Y,object.Z);
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

export default $(Solarsys);