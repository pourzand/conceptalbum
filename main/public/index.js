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
var meshes = [];

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
    "https://m.media-amazon.com/images/I/71RDpVmr2hL._UF1000,1000_QL80_.jpg", // rodeo
    "https://upload.wikimedia.org/wikipedia/en/b/b9/Freudian_by_Daniel_Caesar.jpg",
    "https://upload.wikimedia.org/wikipedia/en/4/4c/Daniel_Caesar_-_Case_Study_01.png",
    "https://upload.wikimedia.org/wikipedia/en/4/4b/My_Bloody_Valentine_-_Loveless.png",
    "https://upload.wikimedia.org/wikipedia/en/5/56/Clairo_-_Immunity.png",
    "https://i.scdn.co/image/ab67616d0000b27313f2466b83507515291acce4", // is this it
    "https://i.scdn.co/image/ab67616d0000b27371f8b254f302d09364879e65", // adults are talking
    "https://upload.wikimedia.org/wikipedia/en/5/51/Igor_-_Tyler%2C_the_Creator.jpg",
    "https://upload.wikimedia.org/wikipedia/en/2/21/Deftones_-_Around_the_Fur.jpg",
    "https://upload.wikimedia.org/wikipedia/en/8/8b/Deftones_-_Diamond_Eyes.jpg",
    "https://upload.wikimedia.org/wikipedia/en/8/8e/The_Ooz_King_Krule.jpg",
    "https://upload.wikimedia.org/wikipedia/en/2/20/PinkPantheress_-_Heaven_Knows.png",
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQq0dH404LfbpA1JVfrurfLqXdcStsy2rDYQg&s", // motomami
    "https://upload.wikimedia.org/wikipedia/en/b/ba/Radioheadokcomputer.png",
    "https://upload.wikimedia.org/wikipedia/en/3/34/Chappell_Roan_-_The_Rise_and_Fall_of_a_Midwest_Princess.png",
    "https://upload.wikimedia.org/wikipedia/en/b/b2/Olivia_Rodrigo_-_SOUR.png",
    "https://upload.wikimedia.org/wikipedia/en/a/ad/Beyonc%C3%A9_-_Renaissance.png",
    "https://upload.wikimedia.org/wikipedia/en/6/6a/UltraviolenceLDR.png",
    "https://upload.wikimedia.org/wikipedia/en/8/8a/Lana_Del_Rey_-_Norman_Fucking_Rockwell.png",
    "https://upload.wikimedia.org/wikipedia/en/f/f8/Mitskipuberty2.jpg",
    "https://upload.wikimedia.org/wikipedia/en/f/f3/Be_the_Cowboy.jpg",
    "https://upload.wikimedia.org/wikipedia/en/a/ac/Dominic_Fike_-_Sunburn.png",
    "https://upload.wikimedia.org/wikipedia/en/8/8d/Solange_-_A_Seat_at_the_Table.png",
    "https://upload.wikimedia.org/wikipedia/en/f/f5/Ken_Carson_-_A_Great_Chaos.jpg",
    "https://upload.wikimedia.org/wikipedia/en/d/de/Steve_Lacy_-_Gemini_Rights.png",
    "https://upload.wikimedia.org/wikipedia/en/e/eb/Live_Love_ASAP.jpg",
    "https://upload.wikimedia.org/wikipedia/en/7/7a/Sweetener_album_cover.png",
    "https://upload.wikimedia.org/wikipedia/en/e/e4/Jeff_Buckley_grace.jpg",
    "https://upload.wikimedia.org/wikipedia/en/3/32/Rihanna_-_Anti.png",
    "https://upload.wikimedia.org/wikipedia/en/0/03/Yeezus_album_cover.png",
    "https://upload.wikimedia.org/wikipedia/en/b/b5/FionaAppleTidal.png",
    "https://upload.wikimedia.org/wikipedia/en/9/96/TV_Girl_-_French_Exit.png",
    "https://upload.wikimedia.org/wikipedia/en/f/f6/Titanic_Rising.jpg",
    "https://upload.wikimedia.org/wikipedia/en/b/b2/Lorde_-_Melodrama.png",
    "https://upload.wikimedia.org/wikipedia/en/b/ba/Azealia_Banks_-_Broke_With_Expensive_Taste_album_cover_2014.png",
    "https://upload.wikimedia.org/wikipedia/en/2/27/Troye_Sivan_-_Something_to_Give_Each_Other.png",
    "https://upload.wikimedia.org/wikipedia/en/9/95/Declan_McKenna_-_What_Do_You_Think_About_the_Car%3F.jpg",
    "https://upload.wikimedia.org/wikipedia/en/f/fd/Short_n%27_Sweet_-_Sabrina_Carpenter.png",
    "https://upload.wikimedia.org/wikipedia/en/7/7e/Ariana_Grande_-_Eternal_Sunshine.png",
    "https://upload.wikimedia.org/wikipedia/en/5/53/Beyonce_-_Lemonade_%28Official_Album_Cover%29.png",
    "https://i.scdn.co/image/ab67616d0000b273767ea1c8f7edd378aa40b204", //musiq soulchild
    "https://upload.wikimedia.org/wikipedia/en/4/4c/Erykah_Badu_-_Mama%27s_Gun.jpg",
    "https://upload.wikimedia.org/wikipedia/en/f/f6/Kendrick_Lamar_-_To_Pimp_a_Butterfly.png",
    "https://upload.wikimedia.org/wikipedia/en/d/d0/Victoria_Monet_-_Jaguar_II.png",
    "https://upload.wikimedia.org/wikipedia/en/d/dc/HEAUX-TALES-ep-cover.jpg",
    "https://upload.wikimedia.org/wikipedia/en/f/fb/IAmAlbumCover.jpg",
    "https://upload.wikimedia.org/wikipedia/en/e/e6/The_Diary_Of_Alicia_Keys_album_cover.jpg",
    "https://upload.wikimedia.org/wikipedia/en/0/0c/Velvet_Underground_and_Nico.jpg",
    "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg",
    "https://upload.wikimedia.org/wikipedia/en/5/50/Sgt._Pepper%27s_Lonely_Hearts_Club_Band.jpg",
    "https://upload.wikimedia.org/wikipedia/en/3/3b/Dark_Side_of_the_Moon.png",
    "https://upload.wikimedia.org/wikipedia/en/d/d0/Sophie_-_Oil_of_Every_Pearl%27s_Un-Insides.png",
    "https://upload.wikimedia.org/wikipedia/en/a/a4/Pink_Floyd%2C_Wish_You_Were_Here_%281975%29.png",
    "https://upload.wikimedia.org/wikipedia/en/8/81/Marina_and_the_Diamonds_-_Electra_Heart.png",
    "https://upload.wikimedia.org/wikipedia/en/1/14/Bj%C3%B6rk_-_Vespertine_album_cover.png",
    "https://upload.wikimedia.org/wikipedia/en/f/f6/Off_the_wall.jpg",
    "https://upload.wikimedia.org/wikipedia/en/6/67/Amy_Winehouse_-_Back_to_Black_%28album%29.png",
    "https://upload.wikimedia.org/wikipedia/en/2/29/DS2_by_Future.jpg",
    "https://upload.wikimedia.org/wikipedia/en/b/bf/SZA_-_Ctrl_cover.png",
    "https://upload.wikimedia.org/wikipedia/en/9/99/The_Miseducation_of_Lauryn_Hill.png",
    "https://upload.wikimedia.org/wikipedia/en/6/60/Bad_Bunny_-_Un_Verano_Sin_Ti.png",
    "https://upload.wikimedia.org/wikipedia/en/5/55/Michael_Jackson_-_Thriller.png",
    "https://upload.wikimedia.org/wikipedia/en/b/b7/NirvanaNevermindalbumcover.jpg",
    "https://upload.wikimedia.org/wikipedia/en/1/1e/Zach_Bryan_-_Zach_Bryan.png",
    "https://upload.wikimedia.org/wikipedia/en/6/65/Kacey_Musgraves_-_Golden_Hour.png",
    "https://upload.wikimedia.org/wikipedia/en/c/c2/Wizkid_-_Made_in_Lagos.png",
    "https://upload.wikimedia.org/wikipedia/en/e/e2/Songs_in_the_key_of_life.jpg"


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
    // mesh.matrixAutoUpdate = false;
    // mesh.updateMatrix();
    group.add(mesh);
    meshes.push(mesh); // Store the mesh in our array

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
  updateMeshes(); // Add this line to update mesh positions
  render();
}

function updateMeshes() {
  var time = Date.now() * 0.001;
  meshes.forEach((mesh, index) => {
    // Create a unique movement for each mesh based on its index
    mesh.position.x += Math.sin(time + index * 0.1) * 0.5;
    mesh.position.y += Math.cos(time + index * 0.1) * 0.5;
    mesh.position.z += Math.sin(time + index * 0.2) * 0.5;
    
    // // Rotate the mesh slightly
    // mesh.rotation.x += 0.01;
    // mesh.rotation.y += 0.01;
    
    // Slow down the rotation
    mesh.rotation.x += 0.002;
    mesh.rotation.y += 0.002;


  });
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
