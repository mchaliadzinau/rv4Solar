import * as THREE from '/@/three.mjs';

function toScreenPosition(obj, renderer, camera)
{
    var vector = new THREE.Vector3();
    
    // TODO: need to update this when resize window
    var widthHalf = 0.5*renderer.context.canvas.width;
    var heightHalf = 0.5*renderer.context.canvas.height;
    
    obj.updateMatrixWorld();
    vector.setFromMatrixPosition(obj.matrixWorld);
    vector.project(camera);
    
    vector.x = ( vector.x * widthHalf ) + widthHalf;
    vector.y = - ( vector.y * heightHalf ) + heightHalf;
    
    return { 
        x: vector.x,
        y: vector.y
    };

}

function createLabel(parentElement, name, color = white) {
    const labelElement = document.createElement('div');
    labelElement.innerHTML=name; labelElement.style.position = 'absolute'; labelElement.style.color = color;
    parentElement.appendChild(labelElement);;
    return labelElement;
}
function updateLabel(label, object, renderer, camera) {
  const proj = toScreenPosition(object, renderer, camera);
  label.style.left = proj.x + 'px'; label.style.top = proj.y + 'px';
}

export const setupOverlay = (renderer, camera, parentElement, onClick) => {
    //create camera stats
    const panel = document.getElementById('panel-bottom');
      if(onClick)
        panel.onclick = onClick;
    const panelElements = {
      camX: panel.getElementsByClassName('cam-x')[0],
      camY: panel.getElementsByClassName('cam-y')[0],
      camZ: panel.getElementsByClassName('cam-z')[0],
      camO: panel.getElementsByClassName('cam-orientation')[0]
    }

  const mercuryLabel = createLabel(parentElement, 'mercury', 'silver');
  const venusLabel = createLabel(parentElement, 'venus', 'lightyellow');

  const updateLabelsPos = (data) => {
    updateLabel(mercuryLabel, data.mercury, renderer, camera);
    updateLabel(venusLabel, data.venus, renderer, camera);
  }

  const updateCameraStats = () => {
    panelElements.camX.innerText = camera.position.x;
    panelElements.camY.innerText = camera.position.y;
    panelElements.camZ.innerText = camera.position.z;
    panelElements.camO.innerText = `x:${camera.rotation._x.toString().slice(0,10)},y:${camera.rotation._y.toString().slice(0,10)},z:${camera.rotation._z.toString().slice(0,10)}`;
  }

  return {panel, updateLabelsPos, updateCameraStats}
}