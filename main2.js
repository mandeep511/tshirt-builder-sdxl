import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
camera.position.set(0, 10, 22);

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(800, 600);
renderer.setClearColor("#a6b1e1");
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('tshirt-canvas').appendChild(renderer.domElement);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 20, 10);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

// Load T-shirt model
const loadTShirtModel = (materialPath, texturePath) => {
  const mtlLoader = new MTLLoader();
  mtlLoader.setPath('./');
  mtlLoader.load(materialPath, (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('./');
    objLoader.load('tshirt.obj', (object) => {
      object.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.material.color.set(0xFFFFFF);
          child.castShadow = true;
        }
      });
      object.scale.set(1, 1, 1);
      object.position.y = -55;
      object.userData.name = "tshirt";
      const patternTexture = object.children[0].material.map;
      const sliderValue = positionSlider.value / 100;
      patternTexture.offset.x = sliderValue;
      scene.add(object);
    });
  });
};

// Render loop
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
animate();

// Interaction controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.enableRotate = true;

// Pattern position slider
const updatePatternPosition = () => {
  scene.children.forEach((object) => {
    if (object.userData.name === "tshirt") {
      const patternTexture = object.children[0].material.map;
      const sliderValue = positionSlider.value / 100;
      patternTexture.offset.x = sliderValue;
    }
  });
};
const positionSlider = document.getElementById('position-slider');
positionSlider.addEventListener('input', updatePatternPosition);


// Pattern generation
const promptField = document.getElementById('prompt-field');
const generateBtn = document.getElementById('generate-btn');
generateBtn.addEventListener('click', generatePattern);

async function generatePattern() {
  const prompt = promptField.value;
  const payload = { prompt: `Seamless ${prompt} pattern for textile or t-shirt design, intricate details, sharp focus, aesthetically pleasing, 4k resolution, textile weave texture, vector illustration style` };
  console.log(payload);
  try {
    const response = await fetch('http://127.0.0.1:5000/genrate-pattern-image', {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    const imageUrl = data.imageUrl;
    console.log(imageUrl);
    updateTexture(imageUrl);
  } catch (error) {
    console.error('Error generating pattern:', error);
  }
}

// Function to update the texture of the T-shirt
function updateTexture(newTexturePath) {
  const mtlLoaderNew = new MTLLoader();
  const materials = mtlLoaderNew.parse(`newmtl FABRIC_1_FRONT_4193
    map_Kd ${newTexturePath}
    illum 2
    Kd 0.7822376 0.7822376 0.7822376
    Ke 0 0 0
    Pr 0.95021707
    Pm 0.77389205
    d 1
    Tr 0`);
  loadTShirtModel(materials, newTexturePath);
}

// Download image
const downloadImage = () => {
  const canvas = renderer.domElement;
  const imageURI = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
  const a = document.createElement('a');
  a.href = imageURI;
  a.download = 'tshirt-model.png';
  a.click();
};
document.getElementById('download-btn').addEventListener('click', downloadImage);

// Initial load
loadTShirtModel('./material.lib', './image2.png');