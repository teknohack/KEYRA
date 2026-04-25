let scene, camera, renderer, controls, keyboard, selectedKey = null;
let artisanGroups = {};
let keyModifications = {}; 

const PRICING = { '2D': 1000, '3D': 2000 };
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

const picker = new EmojiMart.Picker({
    theme: "dark",
    locale: "tr",
    onEmojiSelect: (emoji) => {
        document.getElementById("userInput").value = emoji.native;
        updateContent();
        toggleEmoji();
    },
});
document.getElementById("emoji-picker-container").appendChild(picker);

function toggleEmoji() {
    const el = document.getElementById("emoji-picker-container");
    el.style.display = el.style.display === "block" ? "none" : "block";
}


function refreshUI() {
    let totalExtra = 0;
    const listEl = document.getElementById("modList");
    listEl.innerHTML = "";

    const entries = Object.entries(keyModifications);

    if (entries.length === 0) {
        listEl.innerHTML = '<div style="color:#555; font-size:0.8rem; text-align:center;">Henüz bir şey eklenmedi.</div>';
    } else {
        entries.forEach(([uuid, data]) => {
            totalExtra += data.price;
            
            const item = document.createElement("div");
            item.className = "mod-item";
            item.innerHTML = `
                <div class="mod-info">
                    <span>${data.keyName}</span>
                    <span class="mod-type">${data.type === '2D' ? 'Yazı/Emoji' : '3D Model'} (+${data.price} TL)</span>
                </div>
                <button class="btn-remove" onclick="removeModification('${uuid}')">Sil</button>
            `;
            listEl.appendChild(item);
        });
    }

    document.getElementById("priceDisplay").innerText = `Toplam Ek: ${totalExtra} TL`;
}


window.removeModification = function(uuid) {
    if (artisanGroups[uuid]) {
        artisanGroups[uuid].clear();
    }
    delete keyModifications[uuid];
    refreshUI();
};


function init() {
    scene = new THREE.Scene();
    
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(15, 15, 15);
    
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;

    
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const sun = new THREE.DirectionalLight(0xffffff, 0.8);
    sun.position.set(10, 20, 10);
    scene.add(sun);
    
    new THREE.GLTFLoader().load("keyboard3.glb", (gltf) => {
        keyboard = gltf.scene;
        keyboard.traverse(child => {
            if (child.isMesh && child.material) {
                child.material = child.material.clone();
                child.material.map = null;
                child.material.color.setHex(0x151515);
                child.material.roughness = 0.4;
                child.material.needsUpdate = true;
                if (child.name.toLowerCase().match(/(text|font|label)/)) child.visible = false;
            }
        });
        
    
        const box = new THREE.Box3().setFromObject(keyboard);
        const center = box.getCenter(new THREE.Vector3());
        keyboard.position.sub(center);
        
        scene.add(keyboard);
        controls.update();
        document.getElementById("loader").style.display = "none";
    });

    
    window.addEventListener("pointerdown", onSelect);
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    document.getElementById("emojiBtn").onclick = toggleEmoji;
    document.getElementById("modelBtn").onclick = () => document.getElementById("fileIn").click();
    document.getElementById("userInput").oninput = updateContent;
    document.getElementById("fileIn").onchange = handleFileUpload;

    animate();
}

function onSelect(e) {
    if (e.target.tagName !== "CANVAS") return;
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(keyboard.children, true);

    if (intersects.length > 0) {
        if (selectedKey) selectedKey.material.color.setHex(selectedKey.userData.oldColor);
        selectedKey = intersects[0].object;
        document.getElementById("targetName").innerText = selectedKey.name || "Seçili Tuş";
        
        if (selectedKey.material) {
            selectedKey.userData.oldColor = selectedKey.userData.oldColor || selectedKey.material.color.getHex();
            selectedKey.material.color.setHex(0x00d4ff);
        }
        
        if (!artisanGroups[selectedKey.uuid]) {
            const g = new THREE.Group(); keyboard.add(g); artisanGroups[selectedKey.uuid] = g;
        }
    }
}

function updateContent() {
    if (!selectedKey) return;
    const text = document.getElementById("userInput").value;
    const group = artisanGroups[selectedKey.uuid];
    group.clear();
    
    if (!text) { 
        delete keyModifications[selectedKey.uuid]; 
        refreshUI(); 
        return; 
    }

    const box = new THREE.Box3().setFromObject(selectedKey);
    const size = new THREE.Vector3(); box.getSize(size);
    const pos = new THREE.Vector3(); box.getCenter(pos);
    
    const canvas = document.createElement("canvas");
    canvas.width = 512; canvas.height = 512 * (size.z / size.x);
    const ctx = canvas.getContext("2d");
    
    let fontSize = 512 * 0.7;
    if (text.length > 1) {
        fontSize = (512 / text.length) * 1.4;
        fontSize = Math.min(fontSize, canvas.height * 0.8);
    }
    
    ctx.fillStyle = "#00d4ff";
    ctx.font = `bold ${fontSize}px Arial`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(text, canvas.width/2, canvas.height/2);

    const sticker = new THREE.Mesh(
        new THREE.PlaneGeometry(size.x * 0.95, size.z * 0.95),
        new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, polygonOffset: true, polygonOffsetFactor: -1 })
    );
    sticker.rotation.x = -Math.PI / 2;
    group.position.copy(keyboard.worldToLocal(pos));
    group.position.y += size.y * 0.505;
    group.add(sticker);

    keyModifications[selectedKey.uuid] = { type: '2D', keyName: selectedKey.name || "Tuş", price: PRICING['2D'] };
    refreshUI();
}

function handleFileUpload(e) {
    if (!selectedKey || !e.target.files[0]) return;
    const reader = new FileReader();
    reader.readAsArrayBuffer(e.target.files[0]);
    reader.onload = () => {
        new THREE.GLTFLoader().parse(reader.result, "", (gltf) => {
            const group = artisanGroups[selectedKey.uuid];
            group.clear();
            const model = gltf.scene;
            const box = new THREE.Box3().setFromObject(selectedKey);
            const worldSize = new THREE.Vector3(); box.getSize(worldSize);
            const mBox = new THREE.Box3().setFromObject(model);
            const mSize = new THREE.Vector3(); mBox.getSize(mSize);

            const s = (Math.min(worldSize.x, worldSize.z) * 0.8) / Math.max(mSize.x, mSize.z);
            model.scale.set(s, s, s);
            group.position.copy(keyboard.worldToLocal(box.getCenter(new THREE.Vector3())));
            group.position.y += worldSize.y * 0.5;
            group.add(model);

            keyModifications[selectedKey.uuid] = { type: '3D', keyName: selectedKey.name || "Tuş", price: PRICING['3D'] };
            refreshUI();
        });
    };
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
init();

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.innerText = `Sepet (${cart.length})`;
    }
}
updateCartCount(); 


const buyBtn = document.querySelector('.buy-btn');
if (buyBtn) {
    buyBtn.addEventListener('click', () => {
        const entries = Object.entries(keyModifications);
        
    
        if (entries.length === 0) {
            alert("Sepete eklemeden önce lütfen bir tuşa tasarım (yazı, emoji veya 3D model) uygulayın!");
            return;
        }

        let totalExtra = 0;
        let modDetails = [];
        
       
        entries.forEach(([uuid, data]) => {
            totalExtra += data.price;
            modDetails.push(`${data.keyName} (${data.type})`);
        });

        
        const basePrice = 2000;
        const finalPrice = basePrice + totalExtra;

      
        const customProduct = {
            id: Date.now().toString(), 
            name: "Kişiselleştirilmiş Klavye",
            details: modDetails.join(" + ") + ` (Ekstralar: ${totalExtra} TL)`, 
            price: finalPrice + " TL", 
            quantity: 1,
            img: "mavik.jpeg" 
        };

      
        let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
        cart.push(customProduct);
        localStorage.setItem('shoppingCart', JSON.stringify(cart));

      
        updateCartCount();
        
       
        alert(`Harika tasarımın sepete eklendi!\nKlavye: ${basePrice} TL\nEkstralar: ${totalExtra} TL\nToplam Tutar: ${finalPrice} TL`);

       
        Object.values(artisanGroups).forEach(group => {
            group.clear();
        });
        
        keyModifications = {};
        
       
        refreshUI();
        if(selectedKey && selectedKey.material) {
            selectedKey.material.color.setHex(selectedKey.userData.oldColor);
            selectedKey = null;
            document.getElementById("targetName").innerText = "TUŞ SEÇİN";
        }

        
    });
}
