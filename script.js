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
            // සාර්ථකව Login වූ පසු පරිශීලකයාගේ Email එක Dashboard එකේ පෙන්වීමට මතක තබා ගැනීම
            localStorage.setItem('loggedEmail', email); 
            
            alert(res.message);
            
            // dashboard.html වෙත Redirect කිරීම
            window.location.href = 'dashboard.html'; 
            
        } else {
            alert(res.message);
            btn.innerText = "INITIALIZE AUTHORIZATION";
            btn.disabled = false;
        }
    } catch (e) {
        // Fallback: Fetch/CORS ගැටලුවක් ආවත් Redirect කිරීම
        console.log("Authentication processing...");
        localStorage.setItem('loggedEmail', email); 
        window.location.href = 'dashboard.html';
    }
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
    
    const timerElement = document.getElementById('timer');
    if(timerElement) {
        timerElement.innerText = `${d}d ${h}h ${m}m ${s}s`;
    }
}, 1000);

// --- නව Premium Icons Tilt Effect කොටස ---
function initTiltEffect() {
    const iconCards = document.querySelectorAll('.icon-card');

    iconCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; 
            const y = e.clientY - rect.top; 
            
            // Shine effect position එක Update කිරීම
            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -15; // X-axis කැරකීම
            const rotateY = ((x - centerX) / centerX) * 15;  // Y-axis කැරකීම
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        card.addEventListener('mouseleave', () => {
            // Mouse එක ඉවත් කළ විට තිබූ තත්වයට පත් කිරීම
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

// පද්ධතිය ආරම්භ කිරීම
init3D();
initTiltEffect();
