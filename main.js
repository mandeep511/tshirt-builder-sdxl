import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
// import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// State
let isSpinning = false;
let tshirtModel = null;
let spinTime = 0; // Keep track of the spin time

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, 800 / 600, 0.1, 1000);
camera.position.z = 22;
camera.position.y = 10;

const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(800, 600);
renderer.setClearColor("#a6b1e1");
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // for softer shadows

document.getElementById('tshirt-canvas').appendChild(renderer.domElement);

// Function to start the spinning
function startSpin() {
  isSpinning = true;
  spinTime = 0; // Reset the spin time
  camera.position.z = 42;
}


// Function to stop the spinning
function stopSpin() {
  isSpinning = false;
  camera.position.z = 22;
}

const mtlLoader = new MTLLoader();
mtlLoader.setPath('./');
const materialPath = "./material.lib";
mtlLoader.load(materialPath, (materials) => {
  materials.preload();
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath('./');
  objLoader.load('tshirt.obj', (object) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // This will change the color to white without affecting the texture
        child.material.color.set(0xFFFFFF);
        child.castShadow = true;
      }
    });

    object.scale.set(1, 1, 1);
    object.position.y = -55;
    object.userData.name = "tshirt"
    const patternTexture = object.children[0].material.map;
    const sliderValue = positionSlider.value / 100;
    patternTexture.offset.x = sliderValue;
    scene.add(object);
    tshirtModel = object;

    // updateTexture('./image2.png')

  });
});

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(20, 20, 20);
scene.add(light);

const light2 = new THREE.DirectionalLight(0xffffff, .5);
light.position.set(-20, -20, -20);
scene.add(light2);

const light3 = new THREE.DirectionalLight(0xffffff, .5);
light.position.set(20, -20, 20);
scene.add(light3);

const light4 = new THREE.DirectionalLight(0xffffff, .7);
light.position.set(-20, 20, -20);
scene.add(light4);

const light5 = new THREE.DirectionalLight(0xffffff, .5);
light.position.set(20, 20, -20);
scene.add(light5);

const light6 = new THREE.DirectionalLight(0xffffff, .7);
light.position.set(-20, -20, 20);
scene.add(light6);


const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
// directionalLight.position.set(0, 20, 20);
// scene.add(directionalLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(0, 20, 10); // Adjust as needed
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048; // Increase for better shadow resolution
directionalLight.shadow.mapSize.height = 2048; // Increase for better shadow resolution
scene.add(directionalLight);


// const axesHelper = new THREE.AxesHelper( 20 );
// scene.add( axesHelper );


// // add a wall behind the tshirt
// const wallGeometry = new THREE.PlaneGeometry(200, 200, 32);
// const wallMaterial = new THREE.MeshPhongMaterial({ color: 0xa6b1e1 });
// const wall = new THREE.Mesh(wallGeometry, wallMaterial);
// wall.position.z = -10;
// wall.receiveShadow = true;
// scene.add(wall);

// // add a floor
// const floorGeometry = new THREE.PlaneGeometry(200, 200, 32);
// const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xa6b1e1 });
// const floor = new THREE.Mesh(floorGeometry, floorMaterial);
// floor.rotation.x = Math.PI / 2;
// floor.position.y = -25;
// floor.receiveShadow = true;
// scene.add(floor);

// Render loop
const animate = () => {
  requestAnimationFrame(animate);
  if (isSpinning && tshirtModel) {
    // tshirtModel.rotation.y += 0.01; // Adjust the rotation speed as needed
    // Increase the spin time
    spinTime += 0.009; // Adjust the spin time increment as needed

    // Calculate the sinusoidal rotation speed
    const rotationSpeed = .09 * Math.sin(spinTime); // Adjust the amplitude and frequency as needed

    // Update the rotation
    tshirtModel.rotation.y += rotationSpeed;

  }

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
}

const positionSlider = document.getElementById('position-slider');
positionSlider.addEventListener('input', updatePatternPosition);

// Pattern generation
const promptField = document.getElementById('prompt-field');
const generateBtn = document.getElementById('generate-btn');

generateBtn.addEventListener('click', async () => {
  const prompt = promptField.value;
  // const payload = { prompt: "Seamless pattern for a t-shirt design, " + prompt + ", high detail, sharp focus, asthetic appeal, 4k" };
  const payload = { prompt: `Seamless ${prompt} cloth design, intricate details, sharp focus, aesthetically pleasing, 4k resolution, vector illustration style` };
  console.log(payload)
  try {
    // isSpinning = true; // Start spinning
    startSpin();
    const response = await fetch('http://127.0.0.1:5000/genrate-pattern-image', {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    const imageUrl = data.imageUrl;
    console.log(imageUrl)

    updateTexture(imageUrl);

    // fetch('./image2.png').then(res => res.blob()).then(blob => {
    //   const imageUrl = URL.createObjectURL(blob);
    //   updateTexture(imageUrl)
    // });

  } catch (error) {
    console.error('Error generating pattern:', error);
  } finally {
    // isSpinning = false; // Start spinning
    stopSpin();
  }
});

// Function to update the texture of the T-shirt
function updateTexture(newTexturePath) {
  // Load the new texture
  const mtlLoaderNew = new MTLLoader()
  const materials = mtlLoaderNew.parse(`newmtl FABRIC_1_FRONT_4193
	map_Kd ${newTexturePath}
	illum 2
	Kd 0.7822376 0.7822376 0.7822376
	Ke 0 0 0
	Pr 0.95021707
	Pm 0.77389205
	d 1
	Tr 0`)
  const objLoader = new OBJLoader();
  objLoader.setMaterials(materials);
  objLoader.setPath('./');
  objLoader.load('tshirt.obj', (object) => {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // This will change the color to white without affecting the texture
        child.material.color.set(0xFFFFFF);
        child.castShadow = true;
      }
    });

    object.scale.set(1, 1, 1);
    object.position.y = -55;
    object.userData.name = "tshirt"
    const patternTexture = object.children[0].material.map;
    const sliderValue = positionSlider.value / 100;
    patternTexture.offset.x = sliderValue;


    scene.children.forEach((object) => {
      if (object.userData.name === "tshirt") {
        scene.remove(object);
      }
    });

    scene.add(object);
    tshirtModel = object;
  }, undefined, function (error) {
    console.error('There was an error loading the texture:', error);
  });
}


// Add to cart button
const addToCartBtn = document.getElementById('add-to-cart');
addToCartBtn.disabled = true;

function downloadImage() {
  // Get the canvas element using its id
  const canvas = renderer.domElement
  // Create a data URL for the canvas
  const imageURI = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');

  // Create a new anchor element
  const a = document.createElement('a');
  a.href = imageURI;
  a.download = 'tshirt-model.png'; // Specify the name of the file to be downloaded

  // Trigger a click event on the anchor to open the save dialog
  a.click();
}

document.getElementById('download-btn').addEventListener('click', downloadImage);
