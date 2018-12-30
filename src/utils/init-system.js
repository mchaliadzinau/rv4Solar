import * as THREE from '/@/three.mjs';
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

function addPlanet(planetData) {
    var g = new THREE.SphereGeometry( planetData.radius, 12, 12 );
    var m = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
    var planet = new THREE.Mesh( g, m );
    planet.position.set(planetData.X,planetData.Y,planetData.Z);
    scene.add( planet );
    return planet;
}
function distanceVector( v1, v2 )
{
    var dx = v1.X - v2.X;
    var dy = v1.Y - v2.Y;
    var dz = v1.Z - v2.Z;

    return Math.sqrt( dx * dx + dy * dy + dz * dz );
}
function createOrbitVisualization(scene, center, object) {
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
  scene.add( orbit ); 
  // rotate orbit to hold and object on it
  const plnVector = new THREE.Vector3(object.X,object.Y,0);
  const objVector = new THREE.Vector3(object.X,object.Y,object.Z);
  const orbVector = new THREE.Vector3(orbit.position.x,orbit.position.y,orbit.position.z);
  const zAngle = plnVector.angleTo(objVector);
  const aAngle = plnVector.angleTo(orbVector);
  orbit.rotateZ(aAngle);
  orbit.rotateX(zAngle);
}

var scene = new THREE.Scene();
// SET SUN
const sun = addPlanet({...data.sun});
// SET MERCURY
const mercury = addPlanet({...data.mercury});
createOrbitVisualization(scene, {...data.sun}, {...data.mercury});
// SET VENUS
const venus = addPlanet({...data.venus});
createOrbitVisualization(scene, {...data.sun}, {...data.venus});

function starForge() {
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
      scene.add( stars );
  }

}
starForge();

export {data,scene,sun,venus,mercury};