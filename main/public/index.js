// import * as THREE from 'three';
// DEBUG IMPORT
import * as THREE from "../../node_modules/three/build/three.module.js";

var camera, scene, renderer;
var geometry, group;
var mouseX = 0,
  mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

// Array to hold our textures

var textures = [];

init();
animate();

function init() {
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    10000
  );
  camera.position.z = 1500;
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x2b2b2b);
  scene.fog = new THREE.Fog(0x2b2b2b, 1, 10000);

  // Load textures

  var loader = new THREE.TextureLoader();

  textures.push(loader.load('https://upload.wikimedia.org/wikipedia/en/c/c6/Die_Lit_by_Playboi_Carti.jpg'));
  textures.push(loader.load('https://upload.wikimedia.org/wikipedia/en/6/6c/Playboi_Carti_-_Whole_Lotta_Red.png'));
  textures.push(
    loader.load(
      'https://upload.wikimedia.org/wikipedia/en/1/14/Inrainbowscover.png'
    )
  );
  textures.push(
    loader.load(
      'https://upload.wikimedia.org/wikipedia/en/2/26/Daft_Punk_-_Random_Access_Memories.png'
    )
  );

  var geometry = new THREE.BoxBufferGeometry(150, 150, 10);
  var material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });

  group = new THREE.Group();
  for (var i = 0; i < 500; i++) {
    var texture = textures[Math.floor(Math.random() * textures.length)];
    var image = new THREE.MeshBasicMaterial({ map: texture });

    var mesh = new THREE.Mesh(geometry, image);
    mesh.position.x = Math.random() * 2000 - 1000;
    mesh.position.y = Math.random() * 2000 - 1000;
    mesh.position.z = Math.random() * 2000 - 1000;
    mesh.rotation.x = Math.random() * 2 * Math.PI;
    mesh.rotation.y = Math.random() * 2 * Math.PI;
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    group.add(mesh);
  }

  scene.add(group);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  // renderer.setClearColor( 0xfff );
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  document.addEventListener('mousemove', onDocumentMouseMove, false);
  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseMove(event) {
  mouseX = (event.clientX - windowHalfX) * 2;
  mouseY = (event.clientY - windowHalfY) * 2;
}

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  var time = Date.now() * 0.001;
  var rx = Math.sin(time * 0.7) * 0.5,
    ry = Math.sin(time * 0.3) * 0.5,
    rz = Math.sin(time * 0.2) * 0.5;
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);
  group.rotation.x = rx;
  group.rotation.y = ry;
  group.rotation.z = rz;
  renderer.render(scene, camera);
}
