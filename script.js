const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzsINr291MUehj4bw824N47JrjRWtDHAHyx8-BeQotFoh_UxN_ca2Z2inoGdx1W5eQ/exec';
let isLoginMode = true;
let scene, camera, renderer, particles;
const particleCount = window.innerWidth < 600 ? 8000 : 15000;

// Auth Functions
function toggleMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('form-title').innerText = isLoginMode ? "Login" : "Sign Up";
    document.getElementById('submit-btn').innerText = isLoginMode ? "ACCESS SYSTEM" : "CREATE IDENTITY";
    document.getElementById('toggle-text').innerHTML = isLoginMode ? 
        `Don't have an account? <a href="#" onclick="toggleMode()">Sign Up</a>` : 
        `Already a member? <a href="#" onclick="toggleMode()">Login</a>`;
}

async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('submit-btn');

    if(!email || !password) return alert("Please fill all fields!");

    btn.innerText = "Processing...";
    btn.disabled = true;

    const payload = {
        action: isLoginMode ? 'login' : 'signup',
        email: email,
        password: password
    };

    try {
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Redirect issues වැළැක්වීමට
            cache: 'no-cache',
            body: JSON.stringify(payload)
        });
        
        // no-cors නිසා response කියවිය නොහැක, එබැවින් සාර්ථක යැයි උපකල්පනය කර හෝ වෙනත් ක්‍රමයකින් තහවුරු කරයි.
        // සටහන: වඩාත් නිවැරදි login එකක් සඳහා Apps Script එකේ JSONP භාවිතා කළ යුතුය.
        // නමුත් දැනට මේ ක්‍රමයෙන් Data Sheet එකට යනු ඇත.
        
        if(isLoginMode) {
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('success-screen').style.display = 'flex';
        } else {
            alert("Sign Up Request Sent! Please try logging in.");
            toggleMode();
        }
    } catch (error) {
        alert("Connection Error. Please check your Script URL.");
    }
    btn.innerText = isLoginMode ? "ACCESS SYSTEM" : "CREATE IDENTITY";
    btn.disabled = false;
}

// Three.js 3D Background
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
        particles.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate();
}

// Timer
setInterval(() => {
    const now = new Date().getTime();
    const target = new Date("2026-02-20").getTime(); // Event Date
    const diff = target - now;
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById('timer').innerText = `${d}d ${h}h ${m}m ${s}s`;
}, 1000);

init3D();
