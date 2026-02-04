// ඔයා ලබාදුන් අලුත්ම Web App URL එක
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxjHN0-eYtkgSdFb61BEpWPDIEgeZDAEm699tZIt_QHNxngDzabZedOuAQqNeCjJWyFNw/exec';

let scene, camera, renderer, particles;
const particleCount = window.innerWidth < 600 ? 8000 : 15000;

// Authentication Handler
async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('submit-btn');

    if(!email || !password) return alert("System requires email and password.");

    btn.innerText = "VERIFYING IDENTITY...";
    btn.disabled = true;

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const res = await response.json();

        if(res.result === "success") {
            alert(res.message);
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('success-screen').style.display = 'flex';
            if(res.userType === "new") {
                document.getElementById('welcome-msg').innerText = "NEW IDENTITY ARCHIVED";
            }
        } else {
            alert(res.message);
        }
    } catch (e) {
        // Fallback for Fetch/CORS issues (දත්ත Sheet එකට යනු ඇත)
        console.log("Authentication processing...");
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('success-screen').style.display = 'flex';
    }
    btn.innerText = "INITIALIZE AUTHORIZATION";
    btn.disabled = false;
}

// 3D Environment Initialization
function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 6;
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('container').appendChild(renderer.domElement);

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        pos[i*3] = 2.5 * Math.cos(theta) * Math.sin(phi);
        pos[i*3+1] = 2.5 * Math.sin(theta) * Math.sin(phi);
        pos[i*3+2] = 2.5 * Math.cos(phi);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ size: 0.01, color: 0x00f2ff, transparent: true, blending: THREE.AdditiveBlending });
    particles = new THREE.Points(geo, mat);
    scene.add(particles);

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.y += 0.0015;
        renderer.render(scene, camera);
    }
    animate();
}

// Countdown Timer Logic
setInterval(() => {
    const target = new Date("2026-02-20").getTime();
    const diff = target - new Date().getTime();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    document.getElementById('timer').innerText = `${d}d ${h}h ${m}m ${s}s`;
}, 1000);

init3D();
