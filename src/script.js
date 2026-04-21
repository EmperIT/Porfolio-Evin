import * as THREE from 'three';
import * as dat from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OutlinePass } from 'three/addons/postprocessing/OutlinePass.js';
import {
  INTRO_FOCUS_KEY,
  PANEL_LAYOUT,
  defaultZoomOutTarget,
  focusDistanceScale,
  maxMoveToPlanetDurationMs
} from './modules/ui-config.js';
import { sectionContent, sectionOrder } from './modules/sections.js';
import { planetData } from './modules/planet-data.js';
import { createFocusOverlayController } from './modules/focus-overlay.js';

import bgTexture1 from '/images/1.jpg';
import bgTexture2 from '/images/2.jpg';
import bgTexture3 from '/images/3.jpg';
import bgTexture4 from '/images/4.jpg';
import sunTexture from '/images/sun.jpg';
import mercuryTexture from '/images/mercurymap.jpg';
import mercuryBump from '/images/mercurybump.jpg';
import venusTexture from '/images/venusmap.jpg';
import venusBump from '/images/venusmap.jpg';
import venusAtmosphere from '/images/venus_atmosphere.jpg';
import earthTexture from '/images/earth_daymap.jpg';
import earthNightTexture from '/images/earth_nightmap.jpg';
import earthAtmosphere from '/images/earth_atmosphere.jpg';
import earthMoonTexture from '/images/moonmap.jpg';
import earthMoonBump from '/images/moonbump.jpg';
import marsTexture from '/images/marsmap.jpg';
import marsBump from '/images/marsbump.jpg';
import jupiterTexture from '/images/jupiter.jpg';
import ioTexture from '/images/jupiterIo.jpg';
import europaTexture from '/images/jupiterEuropa.jpg';
import ganymedeTexture from '/images/jupiterGanymede.jpg';
import callistoTexture from '/images/jupiterCallisto.jpg';
import saturnTexture from '/images/saturnmap.jpg';
import satRingTexture from '/images/saturn_ring.png';
import uranusTexture from '/images/uranus.jpg';
import uraRingTexture from '/images/uranus_ring.png';
import neptuneTexture from '/images/neptune.jpg';
import plutoTexture from '/images/plutomap.jpg';

// ******  SETUP  ******
console.log("Create the scene");
const scene = new THREE.Scene();

console.log("Create a perspective projection camera");
var camera = new THREE.PerspectiveCamera( 45, window.innerWidth/window.innerHeight, 0.1, 1000 );
camera.position.set(-175, 115, 5);

console.log("Create the renderer");
const canvas = document.querySelector('canvas.webgl');
const renderer = new THREE.WebGL1Renderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;

console.log("Create an orbit control");
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.75;
controls.screenSpacePanning = false;
controls.enableZoom = false;

let isUserInteracting = false;
let manualCameraOverride = false;
controls.addEventListener('start', () => {
  isUserInteracting = true;
  manualCameraOverride = true;
});
controls.addEventListener('end', () => {
  isUserInteracting = false;
});

console.log("Set up texture loader");
const cubeTextureLoader = new THREE.CubeTextureLoader();
const loadTexture = new THREE.TextureLoader();

// ******  POSTPROCESSING setup ******
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

// ******  OUTLINE PASS  ******
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 3;
outlinePass.edgeGlow = 1;
outlinePass.visibleEdgeColor.set(0xffffff);
outlinePass.hiddenEdgeColor.set(0x190a05);
composer.addPass(outlinePass);

// ******  BLOOM PASS  ******
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1, 0.4, 0.85);
bloomPass.threshold = 1;
bloomPass.radius = 0.9;
composer.addPass(bloomPass);

// ****** AMBIENT LIGHT ******
console.log("Add the ambient light");
var lightAmbient = new THREE.AmbientLight(0x222222, 6); 
scene.add(lightAmbient);

// ******  Star background  ******
scene.background = cubeTextureLoader.load([

  bgTexture3,
  bgTexture1,
  bgTexture2,
  bgTexture2,
  bgTexture4,
  bgTexture2
]);

// ******  CONTROLS  ******
const gui = new dat.GUI({ autoPlace: false });
const customContainer = document.getElementById('gui-container');
customContainer.appendChild(gui.domElement);

// ****** SETTINGS FOR INTERACTIVE CONTROLS  ******
const settings = {
  accelerationOrbit: 2,
  acceleration: 1,
  sunIntensity: 2
};

gui.add(settings, 'accelerationOrbit', 0, 10).onChange(value => {
});
gui.add(settings, 'acceleration', 0, 10).onChange(value => {
});
gui.add(settings, 'sunIntensity', 1, 10).onChange(value => {
  sunMat.emissiveIntensity = value;
});

// mouse movement
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onCanvasWheel(event) {
  // Keep wheel dedicated to scroll narrative instead of OrbitControls zoom.
  event.preventDefault();

  if (selectedPlanet) {
    selectedPlanet = null;
    isMovingTowardsPlanet = false;
    isZoomingOut = false;
    focusOverlay.resetSelectionState();
    focusOverlay.hide();
    const info = document.getElementById('planetInfo');
    if (info) info.style.display = 'none';
  }

  window.scrollBy({ top: event.deltaY, left: 0, behavior: 'auto' });
}

// ******  SELECT PLANET  ******
let selectedPlanet = null;
let isMovingTowardsPlanet = false;
let targetCameraPosition = new THREE.Vector3();
let offset;
let isZoomingOut = false;
let zoomOutTargetPosition = new THREE.Vector3(defaultZoomOutTarget.x, defaultZoomOutTarget.y, defaultZoomOutTarget.z);
const selectedPlanetWorldPosition = new THREE.Vector3();
const selectedFollowPosition = new THREE.Vector3();
const selectedPlanetDelta = new THREE.Vector3();
const lastSelectedPlanetWorldPosition = new THREE.Vector3();
let hasLastSelectedPlanetWorldPosition = false;
const selectedCameraOffsetDirection = new THREE.Vector3(1, 0, 0);
let selectedCameraDistance = 0;
let moveToPlanetStartTime = 0;
let preserveSelectionUntil = 0;
const focusOverlay = createFocusOverlayController({
  PANEL_LAYOUT,
  sectionContent,
  planetData,
  INTRO_FOCUS_KEY,
  projectToScreen
});

focusOverlay.syncViewport();

// ******  SCROLL-DRIVEN CAMERA  ******
const panels = Array.from(document.querySelectorAll('.panel'));
const scrollState = {
  progress: 0,
  enabled: true
};


const activeEls = {
  kicker: document.getElementById('activeKicker'),
  title: document.getElementById('activeTitle'),
  body: document.getElementById('activeBody'),
  navLinks: Array.from(document.querySelectorAll('.site-nav__link')),
  tags: Array.from(document.querySelectorAll('.planet-tag'))
};

// Dynamically set the correct planet for each section tag.
// This ensures the tags follow the correct planets even if the mapping changes.
const sectionToPlanetMapping = {
  about: 'earth',
  experience: 'venus',
  projects: 'mars',
  license: 'jupiter',
  skills: 'saturn'
};

activeEls.tags.forEach(tag => {
  const sectionId = tag.dataset.section;
  if (sectionId && sectionToPlanetMapping[sectionId]) {
    tag.dataset.planet = sectionToPlanetMapping[sectionId];
  }
});

let activeSectionId = 'introduce';

function clamp01(v) {
  return Math.min(1, Math.max(0, v));
}

function setActiveSection(sectionId) {
  if (!sectionId || sectionId === activeSectionId) return;
  activeSectionId = sectionId;

  const content = sectionContent[sectionId];
  if (content && activeEls.kicker && activeEls.title && activeEls.body) {
    activeEls.kicker.textContent = content.kicker;
    activeEls.title.textContent = content.title;
    activeEls.body.textContent = content.body;
  }

  activeEls.navLinks.forEach(link => {
    link.classList.toggle('is-active', link.dataset.section === sectionId);
  });
}

function getScrollSectionId() {
  const n = sectionOrder.length;
  if (n === 0) return 'introduce';
  const idx = Math.round(scrollState.progress * (n - 1));
  return sectionOrder[Math.min(n - 1, Math.max(0, idx))];
}

function updateScrollProgress() {
  manualCameraOverride = false;

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  if (scrollable <= 0) {
    scrollState.progress = 0;
    return;
  }
  scrollState.progress = clamp01(window.scrollY / scrollable);

  // Only update section from scroll if no planet is selected.
  if (!selectedPlanet) {
    setActiveSection(getScrollSectionId());
  }
}

window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

function scrollToSection(sectionId, options = {}) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  if (options.preserveSelection) {
    preserveSelectionUntil = performance.now() + 1400;
  }

  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Header nav click → scroll
activeEls.navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();

    if (selectedPlanet) {
      selectedPlanet = null;
      isMovingTowardsPlanet = false;
      isZoomingOut = false;
      focusOverlay.resetSelectionState();
      focusOverlay.hide();
      const info = document.getElementById('planetInfo');
      if (info) info.style.display = 'none';
    }

    const sectionId = link.dataset.section;
    if (sectionId) scrollToSection(sectionId);
  });
});

// Tag click → scroll
activeEls.tags.forEach(tag => {
  tag.addEventListener('click', () => {
    const sectionId = tag.dataset.section;
    if (sectionId) scrollToSection(sectionId);
  });
});

const focusExploreBtn = document.getElementById('focusExploreBtn');
if (focusExploreBtn) {
  focusExploreBtn.addEventListener('click', () => {
    scrollToSection('about', { preserveSelection: true });
  });
}

function onDocumentMouseDown(event) {
  const interactiveTarget = event.target.closest('a, button, .planet-focus-panel, .site-nav, .planet-tag');
  if (interactiveTarget) {
    return;
  }

  event.preventDefault();

  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  var intersects = raycaster.intersectObjects(raycastTargets);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object;
    selectedPlanet = identifyPlanet(clickedObject);
    if (selectedPlanet) {
      closeInfoNoZoomOut();

      // Update camera to look at the selected planet
      const planetPosition = new THREE.Vector3();
      selectedPlanet.planet.getWorldPosition(planetPosition);
      controls.target.copy(planetPosition);
      camera.lookAt(planetPosition); // Orient the camera towards the planet

      selectedCameraOffsetDirection.copy(camera.position).sub(planetPosition);
      if (selectedCameraOffsetDirection.lengthSq() === 0) {
        selectedCameraOffsetDirection.set(1, 0, 0);
      }
      selectedCameraOffsetDirection.normalize();
      selectedCameraDistance = offset * focusDistanceScale;

      targetCameraPosition.copy(planetPosition).addScaledVector(selectedCameraOffsetDirection, selectedCameraDistance);
      isMovingTowardsPlanet = true;
      moveToPlanetStartTime = performance.now();
    }
  }
}

function updatePlanetFocusOverlay() {
  focusOverlay.update({
    selectedPlanet,
    activeSectionId,
    isMovingTowardsPlanet,
    isZoomingOut,
    sun
  });
}

function identifyPlanet(clickedObject) {
  // Logic to identify which planet was clicked based on the clicked object, different offset for camera distance
        if (clickedObject.material === mercury.planet.material) {
          offset = 10;
          return mercury;
        } else if (clickedObject.material === venus.Atmosphere.material) {
          offset = 25;
          return venus;
        } else if (clickedObject.material === earth.Atmosphere.material) {
          offset = 25;
          return earth;
        } else if (clickedObject.material === mars.planet.material) {
          offset = 15;
          return mars;
        } else if (clickedObject.material === jupiter.planet.material) {
          offset = 50;
          return jupiter;
        } else if (clickedObject.material === saturn.planet.material) {
          offset = 50;
          return saturn;
        } else if (clickedObject.material === uranus.planet.material) {
          offset = 25;
          return uranus;
        } else if (clickedObject.material === neptune.planet.material) {
          offset = 20;
          return neptune;
        } else if (clickedObject.material === pluto.planet.material) {
          offset = 10;
          return pluto;
        } 

  return null;
}

function getSectionForPlanetName(name) {
  switch (name) {
    case 'Earth': return 'about';
    case 'Venus': return 'experience';
    case 'Mars': return 'projects';
    case 'Jupiter': return 'license';
    case 'Saturn': return 'skills';
    default: return 'introduce';
  }
}
// close 'x' button function
function closeInfo() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
  selectedPlanet = null;
  focusOverlay.resetSelectionState();
  focusOverlay.hide();
  isZoomingOut = true;
  controls.target.set(0, 0, 0);
}
window.closeInfo = closeInfo;
// close info when clicking another planet
function closeInfoNoZoomOut() {
  var info = document.getElementById('planetInfo');
  info.style.display = 'none';
}
// ******  SUN  ******
let sunMat;

const sunSize = 697/40; // 40 times smaller scale than earth
const sunGeom = new THREE.SphereGeometry(sunSize, 32, 20);
sunMat = new THREE.MeshStandardMaterial({
  emissive: 0xFFF88F,
  emissiveMap: loadTexture.load(sunTexture),
  emissiveIntensity: settings.sunIntensity
});
const sun = new THREE.Mesh(sunGeom, sunMat);
scene.add(sun);

//point light in the sun
const pointLight = new THREE.PointLight(0xFDFFD3 , 1200, 400, 1.4);
scene.add(pointLight);


// ******  PLANET CREATION FUNCTION  ******
function createPlanet(planetName, size, position, tilt, texture, bump, ring, atmosphere, moons){

  let material;
  if (texture instanceof THREE.Material){
    material = texture;
  } 
  else if(bump){
    material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture),
    bumpMap: loadTexture.load(bump),
    bumpScale: 0.7
    });
  }
  else {
    material = new THREE.MeshPhongMaterial({
    map: loadTexture.load(texture)
    });
  } 

  const name = planetName;
  const geometry = new THREE.SphereGeometry(size, 32, 20);
  const planet = new THREE.Mesh(geometry, material);
  const planet3d = new THREE.Object3D;
  const planetSystem = new THREE.Group();
  planetSystem.add(planet);
  let Atmosphere;
  let Ring;
  planet.position.x = position;
  planet.rotation.z = tilt * Math.PI / 180;

  // add orbit path
  const orbitPath = new THREE.EllipseCurve(
    0, 0,            // ax, aY
    position, position, // xRadius, yRadius
    0, 2 * Math.PI,   // aStartAngle, aEndAngle
    false,            // aClockwise
    0                 // aRotation
);

  const pathPoints = orbitPath.getPoints(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(pathPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.03 });
  const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
  orbit.rotation.x = Math.PI / 2;
  planetSystem.add(orbit);

  //add ring
  if(ring)
  {
    const RingGeo = new THREE.RingGeometry(ring.innerRadius, ring.outerRadius,30);
    const RingMat = new THREE.MeshStandardMaterial({
      map: loadTexture.load(ring.texture),
      side: THREE.DoubleSide
    });
    Ring = new THREE.Mesh(RingGeo, RingMat);
    planetSystem.add(Ring);
    Ring.position.x = position;
    Ring.rotation.x = -0.5 *Math.PI;
    Ring.rotation.y = -tilt * Math.PI / 180;
  }
  
  //add atmosphere
  if(atmosphere){
    const atmosphereGeom = new THREE.SphereGeometry(size+0.1, 32, 20);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      map:loadTexture.load(atmosphere),
      transparent: true,
      opacity: 0.4,
      depthTest: true,
      depthWrite: false
    })
    Atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMaterial)
    
    Atmosphere.rotation.z = 0.41;
    planet.add(Atmosphere);
  }

  //add moons
  if(moons){
    moons.forEach(moon => {
      let moonMaterial;
      
      if(moon.bump){
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture),
          bumpMap: loadTexture.load(moon.bump),
          bumpScale: 0.5
        });
      } else{
        moonMaterial = new THREE.MeshStandardMaterial({
          map: loadTexture.load(moon.texture)
        });
      }
      const moonGeometry = new THREE.SphereGeometry(moon.size, 32, 20);
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
      const moonOrbitDistance = size * 1.5;
      moonMesh.position.set(moonOrbitDistance, 0, 0);
      planetSystem.add(moonMesh);
      moon.mesh = moonMesh;
    });
  }
  //add planet system to planet3d object and to the scene
  planet3d.add(planetSystem);
  scene.add(planet3d);
  return {name, planet, planet3d, Atmosphere, moons, planetSystem, Ring};
}


// ******  LOADING OBJECTS METHOD  ******
function loadObject(path, position, scale, callback) {
  const loader = new GLTFLoader();

  loader.load(path, function (gltf) {
      const obj = gltf.scene;
      obj.position.set(position, 0, 0);
      obj.scale.set(scale, scale, scale);
      scene.add(obj);
      if (callback) {
        callback(obj);
      }
  }, undefined, function (error) {
      console.error('An error happened', error);
  });
}

// ******  ASTEROIDS  ******
const asteroids = [];
function loadAsteroids(path, numberOfAsteroids, minOrbitRadius, maxOrbitRadius) {
  const loader = new GLTFLoader();
  loader.load(path, function (gltf) {
      gltf.scene.traverse(function (child) {
          if (child.isMesh) {
              for (let i = 0; i < numberOfAsteroids / 12; i++) { // Divide by 12 because there are 12 asteroids in the pack
                  const asteroid = child.clone();
                  const orbitRadius = THREE.MathUtils.randFloat(minOrbitRadius, maxOrbitRadius);
                  const angle = Math.random() * Math.PI * 2;
                  const x = orbitRadius * Math.cos(angle);
                  const y = 0;
                  const z = orbitRadius * Math.sin(angle);
                  child.receiveShadow = true;
                  asteroid.position.set(x, y, z);
                  asteroid.scale.setScalar(THREE.MathUtils.randFloat(0.8, 1.2));
                  scene.add(asteroid);
                  asteroids.push(asteroid);
              }
          }
      });
  }, undefined, function (error) {
      console.error('An error happened', error);
  });
}


// Earth day/night effect shader material
const earthMaterial = new THREE.ShaderMaterial({
  uniforms: {
    dayTexture: { type: "t", value: loadTexture.load(earthTexture) },
    nightTexture: { type: "t", value: loadTexture.load(earthNightTexture) },
    sunPosition: { type: "v3", value: sun.position }
  },
  vertexShader: `
    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    uniform vec3 sunPosition;

    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
      vSunDirection = normalize(sunPosition - worldPosition.xyz);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D dayTexture;
    uniform sampler2D nightTexture;

    varying vec3 vNormal;
    varying vec2 vUv;
    varying vec3 vSunDirection;

    void main() {
      float intensity = max(dot(vNormal, vSunDirection), 0.0);
      vec4 dayColor = texture2D(dayTexture, vUv);
      vec4 nightColor = texture2D(nightTexture, vUv)* 0.2;
      gl_FragColor = mix(nightColor, dayColor, intensity);
    }
  `
});


// ******  MOONS  ******
// Earth
const earthMoon = [{
  size: 1.6,
  texture: earthMoonTexture,
  bump: earthMoonBump,
  orbitSpeed: 0.001 * settings.accelerationOrbit,
  orbitRadius: 10
}]

// Mars' moons with path to 3D models (phobos & deimos)
const marsMoons = [
  {
    modelPath: '/images/mars/phobos.glb',
    scale: 0.1,
    orbitRadius: 5,
    orbitSpeed: 0.002 * settings.accelerationOrbit,
    position: 100,
    mesh: null
  },
  {
    modelPath: '/images/mars/deimos.glb',
    scale: 0.1,
    orbitRadius: 9,
    orbitSpeed: 0.0005 * settings.accelerationOrbit,
    position: 120,
    mesh: null
  }
];

// Jupiter
const jupiterMoons = [
  {
    size: 1.6,
    texture: ioTexture,
    orbitRadius: 20,
    orbitSpeed: 0.0005 * settings.accelerationOrbit
  },
  {
    size: 1.4,
    texture: europaTexture,
    orbitRadius: 24,
    orbitSpeed: 0.00025 * settings.accelerationOrbit
  },
  {
    size: 2,
    texture: ganymedeTexture,
    orbitRadius: 28,
    orbitSpeed: 0.000125 * settings.accelerationOrbit
  },
  {
    size: 1.7,
    texture: callistoTexture,
    orbitRadius: 32,
    orbitSpeed: 0.00006 * settings.accelerationOrbit
  }
];

// ******  PLANET CREATIONS  ******
const mercury = new createPlanet('Mercury', 2.4, 40, 0, mercuryTexture, mercuryBump);
const venus = new createPlanet('Venus', 6.1, 65, 3, venusTexture, venusBump, null, venusAtmosphere);
const earth = new createPlanet('Earth', 6.4, 90, 23, earthMaterial, null, null, earthAtmosphere, earthMoon);
const mars = new createPlanet('Mars', 3.4, 115, 25, marsTexture, marsBump)
// Load Mars moons
marsMoons.forEach(moon => {
  loadObject(moon.modelPath, moon.position, moon.scale, function(loadedModel) {
    moon.mesh = loadedModel;
    mars.planetSystem.add(moon.mesh);
    moon.mesh.traverse(function (child) {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  });
});

const jupiter = new createPlanet('Jupiter', 69/4, 200, 3, jupiterTexture, null, null, null, jupiterMoons);
const saturn = new createPlanet('Saturn', 58/4, 270, 26, saturnTexture, null, {
  innerRadius: 18, 
  outerRadius: 29, 
  texture: satRingTexture
});
const uranus = new createPlanet('Uranus', 25/4, 320, 82, uranusTexture, null, {
  innerRadius: 6, 
  outerRadius: 8, 
  texture: uraRingTexture
});
const neptune = new createPlanet('Neptune', 24/4, 340, 28, neptuneTexture);
const pluto = new createPlanet('Pluto', 1, 350, 57, plutoTexture)

// Section → focus (target) + offset (camera position relative to target).
// Targets (planets) move along their orbit; we follow their current world position for a lively scroll narrative.
const scrollKeyframes = [
  {
    id: 'introduce',
    getTarget: (out) => out.set(0, 0, 0),
    getOffset: (out) => out.set(-175, 115, 5)
  },
  {
    id: 'about',
    // Bias target slightly left so the planet appears more to the right of frame.
    getTarget: (out) => earth.planet.getWorldPosition(out).add(new THREE.Vector3(-12, 0, 0)),
    getOffset: (out) => out.set(28, 10, 40)
  },
  {
    id: 'experience',
    getTarget: (out) => venus.planet.getWorldPosition(out).add(new THREE.Vector3(-12, 0, 0)),
    getOffset: (out) => out.set(28, 10, 40)
  },
  {
    id: 'projects',
    getTarget: (out) => mars.planet.getWorldPosition(out).add(new THREE.Vector3(-12, 0, 0)),
    getOffset: (out) => out.set(25, 10, 40)
  },
  {
    id: 'license',
    getTarget: (out) => jupiter.planet.getWorldPosition(out).add(new THREE.Vector3(-22, 0, 0)),
    getOffset: (out) => out.set(110, 22, 140)
  },
  {
    id: 'skills',
    getTarget: (out) => saturn.planet.getWorldPosition(out).add(new THREE.Vector3(-22, 0, 0)),
    getOffset: (out) => out.set(105, 26, 150)
  }
];

const _tA = new THREE.Vector3();
const _tB = new THREE.Vector3();
const _oA = new THREE.Vector3();
const _oB = new THREE.Vector3();
const _pB = new THREE.Vector3();
const _desiredTarget = new THREE.Vector3();
const _desiredPos = new THREE.Vector3();

function applyScrollCamera() {
  if (isUserInteracting) return;
  if (manualCameraOverride) return;
  if (!scrollState.enabled || isMovingTowardsPlanet || isZoomingOut) return;
  if (selectedPlanet) return;
  if (isMovingTowardsPlanet || isZoomingOut) return;
  if (!panels.length) return;

  const n = sectionOrder.length;
  if (n < 2) return;

  const scaled = scrollState.progress * (n - 1);
  const aIdx = Math.floor(scaled);
  const bIdx = Math.min(n - 1, aIdx + 1);
  const t = scaled - aIdx;

  const aId = sectionOrder[aIdx];
  const bId = sectionOrder[bIdx];

  const a = scrollKeyframes.find(k => k.id === aId) || scrollKeyframes[0];
  const b = scrollKeyframes.find(k => k.id === bId) || scrollKeyframes[0];

  a.getTarget(_tA);
  b.getTarget(_tB);
  a.getOffset(_oA);
  b.getOffset(_oB);

  _desiredTarget.copy(_tA).lerp(_tB, t);
  _pB.copy(_tB).add(_oB);
  _desiredPos.copy(_tA).add(_oA).lerp(_pB, t);

  camera.position.lerp(_desiredPos, 0.06);
  controls.target.lerp(_desiredTarget, 0.08);
  // camera.lookAt(controls.target);
}

const _worldPos = new THREE.Vector3();
const _ndc = new THREE.Vector3();
const _cameraSpace = new THREE.Vector3();
function projectToScreen(worldPosition, out) {
  _ndc.copy(worldPosition).project(camera);
  _cameraSpace.copy(worldPosition).applyMatrix4(camera.matrixWorldInverse);
  out.x = (_ndc.x * 0.5 + 0.5) * window.innerWidth;
  out.y = (-_ndc.y * 0.5 + 0.5) * window.innerHeight;
  out.inFront = _cameraSpace.z < 0;
  out.visible = _ndc.z > -1 && _ndc.z < 1;
  return out;
}

const _screen = { x: 0, y: 0, visible: false, inFront: false };
function updatePlanetTags() {
  if (selectedPlanet) {
    activeEls.tags.forEach(tag => {
      tag.style.display = 'none';
    });
    return;
  }

  const planetByKey = {
    earth: earth.planet,
    venus: venus.planet,
    mars: mars.planet,
    jupiter: jupiter.planet,
    saturn: saturn.planet
  };

  activeEls.tags.forEach(tag => {
    const key = tag.dataset.planet;
    const planet = planetByKey[key];
    if (!planet) return;

    planet.getWorldPosition(_worldPos);
    projectToScreen(_worldPos, _screen);

    // Show tags whenever the planet is visible on screen
    const show = _screen.visible;
    tag.style.display = show ? 'block' : 'none';
    if (!show) return;

    tag.style.left = `${_screen.x}px`;
    tag.style.top = `${_screen.y}px`;
  });
}


// Array of planets and atmospheres for raycasting
const raycastTargets = [
  mercury.planet, venus.planet, venus.Atmosphere, earth.planet, earth.Atmosphere, 
  mars.planet, jupiter.planet, saturn.planet, uranus.planet, neptune.planet, pluto.planet
];

// ******  SHADOWS  ******
renderer.shadowMap.enabled = true;
pointLight.castShadow = true;

//properties for the point light
pointLight.shadow.mapSize.width = 1024;
pointLight.shadow.mapSize.height = 1024;
pointLight.shadow.camera.near = 10;
pointLight.shadow.camera.far = 20;

//casting and receiving shadows
earth.planet.castShadow = true;
earth.planet.receiveShadow = true;
earth.Atmosphere.castShadow = true;
earth.Atmosphere.receiveShadow = true;
earth.moons.forEach(moon => {
moon.mesh.castShadow = true;
moon.mesh.receiveShadow = true;
});
mercury.planet.castShadow = true;
mercury.planet.receiveShadow = true;
venus.planet.castShadow = true;
venus.planet.receiveShadow = true;
venus.Atmosphere.receiveShadow = true;
mars.planet.castShadow = true;
mars.planet.receiveShadow = true;
jupiter.planet.castShadow = true;
jupiter.planet.receiveShadow = true;
jupiter.moons.forEach(moon => {
  moon.mesh.castShadow = true;
  moon.mesh.receiveShadow = true;
  });
saturn.planet.castShadow = true;
saturn.planet.receiveShadow = true;
saturn.Ring.receiveShadow = true;
uranus.planet.receiveShadow = true;
neptune.planet.receiveShadow = true;
pluto.planet.receiveShadow = true;




function animate(){

  //rotating planets around the sun and itself
  sun.rotateY(0.001 * settings.acceleration);
  mercury.planet.rotateY(0.001 * settings.acceleration);
  mercury.planet3d.rotateY(0.004 * settings.accelerationOrbit);
  venus.planet.rotateY(0.0005 * settings.acceleration)
  venus.Atmosphere.rotateY(0.0005 * settings.acceleration);
  venus.planet3d.rotateY(0.0006 * settings.accelerationOrbit);
  earth.planet.rotateY(0.005 * settings.acceleration);
  earth.Atmosphere.rotateY(0.001 * settings.acceleration);
  earth.planet3d.rotateY(0.001 * settings.accelerationOrbit);
  mars.planet.rotateY(0.01 * settings.acceleration);
  mars.planet3d.rotateY(0.0007 * settings.accelerationOrbit);
  jupiter.planet.rotateY(0.005 * settings.acceleration);
  jupiter.planet3d.rotateY(0.0003 * settings.accelerationOrbit);
  saturn.planet.rotateY(0.01 * settings.acceleration);
  saturn.planet3d.rotateY(0.0002 * settings.accelerationOrbit);
  uranus.planet.rotateY(0.005 * settings.acceleration);
  uranus.planet3d.rotateY(0.0001 * settings.accelerationOrbit);
  neptune.planet.rotateY(0.005 * settings.acceleration);
  neptune.planet3d.rotateY(0.00008 * settings.accelerationOrbit);
  pluto.planet.rotateY(0.001 * settings.acceleration)
  pluto.planet3d.rotateY(0.00006 * settings.accelerationOrbit)

// Animate Earth's moon
if (earth.moons) {
  earth.moons.forEach(moon => {
    const time = performance.now();
    const tiltAngle = 5 * Math.PI / 180;

    const moonX = earth.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
    const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.sin(tiltAngle);
    const moonZ = earth.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed) * Math.cos(tiltAngle);

    moon.mesh.position.set(moonX, moonY, moonZ);
    moon.mesh.rotateY(0.01);
  });
}
// Animate Mars' moons
if (marsMoons){
marsMoons.forEach(moon => {
  if (moon.mesh) {
    const time = performance.now();

    const moonX = mars.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
    const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
    const moonZ = mars.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);

    moon.mesh.position.set(moonX, moonY, moonZ);
    moon.mesh.rotateY(0.001);
  }
});
}

// Animate Jupiter's moons
if (jupiter.moons) {
  jupiter.moons.forEach(moon => {
    const time = performance.now();
    const moonX = jupiter.planet.position.x + moon.orbitRadius * Math.cos(time * moon.orbitSpeed);
    const moonY = moon.orbitRadius * Math.sin(time * moon.orbitSpeed);
    const moonZ = jupiter.planet.position.z + moon.orbitRadius * Math.sin(time * moon.orbitSpeed);

    moon.mesh.position.set(moonX, moonY, moonZ);
    moon.mesh.rotateY(0.01);
  });
}

// Rotate asteroids
asteroids.forEach(asteroid => {
  asteroid.rotation.y += 0.0001;
  asteroid.position.x = asteroid.position.x * Math.cos(0.0001 * settings.accelerationOrbit) + asteroid.position.z * Math.sin(0.0001 * settings.accelerationOrbit);
  asteroid.position.z = asteroid.position.z * Math.cos(0.0001 * settings.accelerationOrbit) - asteroid.position.x * Math.sin(0.0001 * settings.accelerationOrbit);
});

// ****** OUTLINES ON PLANETS ******
raycaster.setFromCamera(mouse, camera);

// Check for intersections
var intersects = raycaster.intersectObjects(raycastTargets);

// Reset all outlines
outlinePass.selectedObjects = [];

if (intersects.length > 0) {
  const intersectedObject = intersects[0].object;

  // If the intersected object is an atmosphere, find the corresponding planet
  if (intersectedObject === earth.Atmosphere) {
    outlinePass.selectedObjects = [earth.planet];
  } else if (intersectedObject === venus.Atmosphere) {
    outlinePass.selectedObjects = [venus.planet];
  } else {
    // For other planets, outline the intersected object itself
    outlinePass.selectedObjects = [intersectedObject];
  }
}
// ******  ZOOM IN/OUT  ******
if (isMovingTowardsPlanet) {
  selectedPlanet.planet.getWorldPosition(selectedPlanetWorldPosition);
  targetCameraPosition.copy(selectedPlanetWorldPosition).addScaledVector(selectedCameraOffsetDirection, selectedCameraDistance);

  // Smoothly move the camera towards the target position
  camera.position.lerp(targetCameraPosition, 0.08);
  controls.target.lerp(selectedPlanetWorldPosition, 0.2);

  // Check if the camera is close to the target position
  const reachedTarget = camera.position.distanceTo(targetCameraPosition) < 3.0;
  const reachedMoveTimeout = performance.now() - moveToPlanetStartTime > maxMoveToPlanetDurationMs;
  if (reachedTarget || reachedMoveTimeout) {
      isMovingTowardsPlanet = false;
      const sectionId = getSectionForPlanetName(selectedPlanet.name);
        scrollToSection(sectionId, { preserveSelection: true });
      setActiveSection(sectionId);
  }
} else if (isZoomingOut) {
  camera.position.lerp(zoomOutTargetPosition, 0.05);

  if (camera.position.distanceTo(zoomOutTargetPosition) < 1) {
      isZoomingOut = false;
  }
}

if (!selectedPlanet) {
  hasLastSelectedPlanetWorldPosition = false;
}

if (selectedPlanet && !isMovingTowardsPlanet && !isZoomingOut && !isUserInteracting) {
  selectedPlanet.planet.getWorldPosition(selectedPlanetWorldPosition);

  if (!hasLastSelectedPlanetWorldPosition) {
    lastSelectedPlanetWorldPosition.copy(selectedPlanetWorldPosition);
    hasLastSelectedPlanetWorldPosition = true;
  }

  selectedPlanetDelta.copy(selectedPlanetWorldPosition).sub(lastSelectedPlanetWorldPosition);

  if (manualCameraOverride) {
    // Keep user-controlled orbit, but translate camera with the moving planet so focus stays locked.
    camera.position.add(selectedPlanetDelta);
    controls.target.copy(selectedPlanetWorldPosition);
  } else {
    selectedFollowPosition.copy(selectedPlanetWorldPosition).addScaledVector(selectedCameraOffsetDirection, selectedCameraDistance);
    controls.target.lerp(selectedPlanetWorldPosition, 0.12);
    camera.position.lerp(selectedFollowPosition, 0.05);
  }

  lastSelectedPlanetWorldPosition.copy(selectedPlanetWorldPosition);
}

  // ******  SCROLL CAMERA (when not zooming/selecting)  ******
  applyScrollCamera();
  updatePlanetTags();
  updatePlanetFocusOverlay();

  controls.update();
  requestAnimationFrame(animate);
  composer.render();
}
loadAsteroids('/asteroids/asteroidPack.glb', 1000, 130, 160);
loadAsteroids('/asteroids/asteroidPack.glb', 3000, 352, 370);
animate();

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onDocumentMouseDown, false);
renderer.domElement.addEventListener('wheel', onCanvasWheel, { passive: false });
window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  composer.setSize(window.innerWidth,window.innerHeight);
  outlinePass.setSize(window.innerWidth, window.innerHeight);
  focusOverlay.syncViewport();
});
