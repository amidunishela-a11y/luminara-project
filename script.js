let scene, camera, renderer, particles;
const particleCount = window.innerWidth < 600 ? 10000 : 18000;
let spherePoints = [], textPoints = [];
let state = "sphere";

// Google Sheet URL
const SHEET_ID = '1mDpVWrfZvCK3idWvhQMOZA0J8KVc0FPnLtTdg6xtyk';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

async function loadSheetData() {
    try {
        const response = await fetch(SHEET_URL);
        const text = await response.text();
        const json = JSON.parse(text.substring(47).slice(0, -2));
        const rows = json.table.rows;
        let html = "";
        rows.slice().reverse().slice(0, 12).forEach(row => {
            const name = row.c[0] ? row.c[0].v : "Unknown User";
            const batch = row.c[2] ? row.c[2].v : "";
            html += `<div class="data-row"><span class="name">▶ ${name}</span><span class="batch">${batch}</span></div>`;
        });
        document.getElementById('sheet-content').innerHTML = html;
    } catch (e) {
        document.getElementById('sheet-content').innerHTML = "Updating Database...";
    }
}

// Timer Logic (16 Days)
const targetDate = new Date().getTime() + (16 * 24 * 60 * 60 * 1000);
function updateTimer() {
    const diff = targetDate - new Date().getTime();
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    document.getElementById('timer').innerText = `${d}d ${h}h ${m}m ${s}s`;
}

// 3D Text Generation
function createTextCoords() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800; canvas.height = 200;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 100px Orbitron';
    ctx.textAlign = 'center';
    ctx.fillText('LUMINARA', 400, 120);
    
    const imgData = ctx.getImageData(0, 0, 800, 200).data;
    const pts = [];
    for (let y = 0; y < 200; y += 1) {
        for (let x = 0; x < 800; x += 1) {
            if (imgData[(y * 800 + x) * 4] > 128) {
                pts.push((x - 400) * 0.015, (100 - y) * 0.015, 0);
            }
        }
    }
    for (let i = 0; i < particleCount; i++) {
        const r = Math.floor(Math.random() * (pts.length / 3));
        textPoints.push(pts[r * 3], pts[r * 3 + 1], pts[r * 3 + 2]);
    }
}

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = window.innerWidth < 600 ? 8 : 6;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.getElementById('container').appendChild(renderer.domElement);

    createTextCoords();
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / particleCount);
        const theta = Math.sqrt(particleCount * Math.PI) * phi;
        pos[i*3] = 2.2 * Math.cos(theta) * Math.sin(phi);
        pos[i*3+1] = 2.2 * Math.sin(theta) * Math.sin(phi);
        pos[i*3+2] = 2.2 * Math.cos(phi);
        spherePoints.push(pos[i*3], pos[i*3+1], pos[i*3+2]);
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
        size: window.innerWidth < 600 ? 0.015 : 0.008, 
        color: 0x00f2ff, 
        transparent: true, 
        blending: THREE.AdditiveBlending, 
        opacity: 0.8 
    });
    particles = new THREE.Points(geo, mat);
    scene.add(particles);

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Morph Toggle
    const handleAction = () => {
        state = (state === "sphere") ? "text" : "sphere";
        const target = (state === "text") ? textPoints : spherePoints;
        const posAttr = particles.geometry.attributes.position;
        for (let i = 0; i < particleCount; i++) {
            gsap.to(posAttr.array, {
                duration: 2, ease: "power4.inOut",
                [i*3]: target[i*3], [i*3+1]: target[i*3+1], [i*3+2]: target[i*3+2],
                onUpdate: () => posAttr.needsUpdate = true
            });
        }
    };

    window.addEventListener('click', handleAction);
    window.addEventListener('touchstart', (e) => { e.preventDefault(); handleAction(); }, {passive: false});

    setInterval(updateTimer, 1000);
    setInterval(loadSheetData, 30000);
    loadSheetData();
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    if(state === "sphere") {
        particles.rotation.y += 0.002;
    } else {
        particles.rotation.y *= 0.95; 
    }
    const time = Date.now() * 0.005;
    particles.material.opacity = 0.6 + Math.sin(time) * 0.3;
    renderer.render(scene, camera);
}

init();
