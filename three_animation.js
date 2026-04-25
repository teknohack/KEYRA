import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let model;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); 
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3d').appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(1, 1, 2);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));
camera.position.z = 5; // Modeli daha rahat görmek için biraz geri aldım

new GLTFLoader().load('./sample1.glb', (gltf) => {
    model = gltf.scene;

    // --- ŞEFFAFLIK AYARI ---
    // Modelin içindeki tüm parçaları (meshleri) şeffaflığa uygun hale getiriyoruz
    model.traverse((child) => {
        if (child.isMesh) {
            child.material.transparent = true;
            child.material.opacity = 1; // Başlangıçta tam görünür
        }
    });

    scene.add(model);
    model.scale.set(0.22, 0.22, 0.22); 
    
    // Beğendiğin başlangıç konumu
    model.rotation.x = 0.55; 
    model.rotation.y = 0;
    model.rotation.z = 0;
}, undefined, (e) => console.error("Model hatası:", e));

window.onscroll = () => {
    if (model) {
        const scrollY = window.scrollY;
        
        // 1. Model Rotasyonu
        model.rotation.x = 0.55 + (scrollY * 0.001); 
        model.rotation.y = scrollY * 0.002;

        // 2. İlerleme ve Arka Plan Renk Geçişi
        const progress = Math.min(scrollY / 600, 1); 
        const startGray = 50; 
        const colorValue = startGray + Math.floor(progress * (255 - startGray));
        document.getElementById('container3d').style.backgroundColor = `rgb(${colorValue}, ${colorValue}, ${colorValue})`;

        // 3. SÖNME / YOK OLMA ETKİSİ (Opacity)
        const opacityValue = 1 - progress; 
        model.traverse((child) => {
            if (child.isMesh) {
                child.material.opacity = opacityValue;
            }
        });

        // 4. YAZI RENGİ GEÇİŞİ (Beyazdan Siyaha)
        // Progress 0 iken (255, 255, 255) -> Progress 1 iken (17, 24, 39)
        const textR = Math.floor(255 - (progress * (255 - 17)));
        const textG = Math.floor(255 - (progress * (255 - 24)));
        const textB = Math.floor(255 - (progress * (255 - 39)));

        const scrollText = document.getElementById('scroll-text');
        if (scrollText) {
            scrollText.style.color = `rgb(${textR}, ${textG}, ${textB})`;
        }
    }
};

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});