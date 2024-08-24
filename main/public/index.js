// import * as THREE from 'three';
// DEBUG IMPORT
import * as THREE from "https://unpkg.com/three@0.167.1/build/three.module.js";

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
  // scene.background = new THREE.Color(0x2b2b2b);
  scene.background = new THREE.Color(0x000000);

  scene.fog = new THREE.Fog(0x000000, 1, 10000);

  // Load textures

  var loader = new THREE.TextureLoader();

  var album_urls = [
    "https://upload.wikimedia.org/wikipedia/commons/6/60/Charli_XCX_-_Brat_%28album_cover%29.png",
    "https://upload.wikimedia.org/wikipedia/en/c/c6/Die_Lit_by_Playboi_Carti.jpg",
    "https://upload.wikimedia.org/wikipedia/en/6/6c/Playboi_Carti_-_Whole_Lotta_Red.png",
    "https://upload.wikimedia.org/wikipedia/en/1/14/Inrainbowscover.png",
    "https://upload.wikimedia.org/wikipedia/en/2/26/Daft_Punk_-_Random_Access_Memories.png",
    "https://upload.wikimedia.org/wikipedia/en/2/28/Channel_ORANGE.jpg",
    "https://upload.wikimedia.org/wikipedia/en/a/a0/Blonde_-_Frank_Ocean.jpeg",
    "https://upload.wikimedia.org/wikipedia/en/7/70/Graduation_%28album%29.jpg",
    "https://upload.wikimedia.org/wikipedia/en/f/f4/Late_registration_cd_cover.jpg",
    "https://upload.wikimedia.org/wikipedia/en/a/a3/Kanyewest_collegedropout.jpg",
    "https://upload.wikimedia.org/wikipedia/en/4/42/Drake_-_Nothing_Was_the_Same_cover.png",
    "https://upload.wikimedia.org/wikipedia/en/thumb/a/ae/Drake_-_Take_Care_cover.jpg/220px-Drake_-_Take_Care_cover.jpg",
    "https://upload.wikimedia.org/wikipedia/en/4/4b/Travis_Scott_-_Astroworld.png",
    "https://m.media-amazon.com/images/I/71RDpVmr2hL._UF1000,1000_QL80_.jpg",
    "https://upload.wikimedia.org/wikipedia/en/b/b9/Freudian_by_Daniel_Caesar.jpg",
    "https://upload.wikimedia.org/wikipedia/en/4/4c/Daniel_Caesar_-_Case_Study_01.png",
    "https://upload.wikimedia.org/wikipedia/en/4/4b/My_Bloody_Valentine_-_Loveless.png",
    "https://upload.wikimedia.org/wikipedia/en/5/56/Clairo_-_Immunity.png",
    "https://i.scdn.co/image/ab67616d0000b27313f2466b83507515291acce4",
    "https://i.scdn.co/image/ab67616d0000b27371f8b254f302d09364879e65",
    "https://upload.wikimedia.org/wikipedia/en/5/51/Igor_-_Tyler%2C_the_Creator.jpg",
    "https://upload.wikimedia.org/wikipedia/en/2/21/Deftones_-_Around_the_Fur.jpg",
    "https://upload.wikimedia.org/wikipedia/en/8/8b/Deftones_-_Diamond_Eyes.jpg",
    "https://upload.wikimedia.org/wikipedia/en/8/8e/The_Ooz_King_Krule.jpg",
    "https://upload.wikimedia.org/wikipedia/en/2/20/PinkPantheress_-_Heaven_Knows.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq0dH404LfbpA1JVfrurfLqXdcStsy2rDYQg&s",
    "https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png",

  ];

  album_urls.forEach(url => {
    textures.push(loader.load(url))
  });

  var geometry = new THREE.BoxGeometry(150, 150, 15);
  // var geometry = new THREE.BoxGeometry(100, 100, 100); // album cubes

  var material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
  // var sidemat = new THREE.MeshBasicMaterial({color: 0xffffff});
  var sidemat = new THREE.MeshBasicMaterial({color: 0x000000});



  group = new THREE.Group();
  for (var i = 0; i < 500; i++) {
    var texture = textures[Math.floor(Math.random() * textures.length)];
    var image = new THREE.MeshBasicMaterial({ map: texture });
    var materialNew = [
      sidemat,
      sidemat,
      sidemat,
      sidemat,
      image,
      image,
    ];


    var mesh = new THREE.Mesh(geometry, materialNew);
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
