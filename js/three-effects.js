// portfolio/js/three-effects.js
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  // Scene setup
  const scene = new THREE.Scene();
  // Cinematic depth with subtle fog blending into background
  scene.fog = new THREE.FogExp2(0x0d0d0f, 0.001);

  // Camera setup
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 400;

  // Renderer setup
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Create soft bokeh texture programmatically
  function createBokehTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    const center = size / 2;
    const gradient = context.createRadialGradient(center, center, 0, center, center, center);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.1, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    context.fillStyle = gradient;
    context.beginPath();
    context.arc(center, center, center, 0, Math.PI * 2, false);
    context.fill();

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  const bokehTexture = createBokehTexture();

  // Create multiple layers of particles for depth
  const particleLayers = [];
  const layerSettings = [
    { count: 80, size: 40, color: 0xd4af37, speed: 0.15, opacity: 0.15 }, // Background large bokeh
    { count: 150, size: 15, color: 0x8892b0, speed: 0.25, opacity: 0.3 },  // Midground cool tone
    { count: 400, size: 4, color: 0xffffff, speed: 0.4, opacity: 0.6 },    // Foreground sharp particles
  ];

  layerSettings.forEach(setting => {
    const geometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(setting.count * 3);
    const initialPositions = []; // To store original Y for sine wave
    
    for(let i = 0; i < setting.count * 3; i+=3) {
      posArray[i] = (Math.random() - 0.5) * 2500;   // x spread
      posArray[i+1] = (Math.random() - 0.5) * 2000; // y spread
      posArray[i+2] = (Math.random() - 0.5) * 1500 - 300; // z spread
      initialPositions.push({
        x: posArray[i],
        y: posArray[i+1],
        z: posArray[i+2],
        offset: Math.random() * Math.PI * 2 // Random phase for sine wave
      });
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    
    const material = new THREE.PointsMaterial({
      size: setting.size,
      color: setting.color,
      map: bokehTexture,
      transparent: true,
      opacity: setting.opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    const mesh = new THREE.Points(geometry, material);
    mesh.userData = { speed: setting.speed, initials: initialPositions };
    scene.add(mesh);
    particleLayers.push(mesh);
  });

  // Mouse interactivity for Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;
  const windowHalfX = window.innerWidth / 2;
  const windowHalfY = window.innerHeight / 2;

  document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - windowHalfX);
    mouseY = (event.clientY - windowHalfY);
  });

  // Handle Resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  // Animation Loop
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Anti-gravity drift and slow rotation
    particleLayers.forEach((mesh, index) => {
      // Gentle scene rotation
      mesh.rotation.y = elapsedTime * 0.03 * (index % 2 === 0 ? 1 : -0.5);
      mesh.rotation.x = elapsedTime * 0.015;
      
      // Upward anti-gravity drift with gentle sway
      const positions = mesh.geometry.attributes.position.array;
      for (let i = 0, j = 0; i < positions.length; i += 3, j++) {
        // Upward movement
        mesh.userData.initials[j].y += mesh.userData.speed;
        
        // Seamless loop: if particle goes too high, wrap around to bottom
        if (mesh.userData.initials[j].y > 1000) {
          mesh.userData.initials[j].y = -1000;
        }

        // Apply anti-gravity sway using sine wave
        const swayX = Math.sin(elapsedTime * 0.5 + mesh.userData.initials[j].offset) * 10;
        const swayZ = Math.cos(elapsedTime * 0.3 + mesh.userData.initials[j].offset) * 10;

        positions[i] = mesh.userData.initials[j].x + swayX;
        positions[i+1] = mesh.userData.initials[j].y;
        positions[i+2] = mesh.userData.initials[j].z + swayZ;
      }
      mesh.geometry.attributes.position.needsUpdate = true;
    });

    // Smooth ease mouse position for parallax
    targetX = mouseX * 0.05;
    targetY = mouseY * 0.05;
    
    // Apply cinematic smooth parallax to camera
    camera.position.x += (targetX - camera.position.x) * 0.02;
    camera.position.y += (-targetY - camera.position.y) * 0.02;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();
});
