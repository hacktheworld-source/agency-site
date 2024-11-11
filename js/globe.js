import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

class Globe {
    constructor(container) {
        this.container = container;
        this.rotationSpeed = 0.0005;
        this.isRunning = true;
        this.lastFrame = 0;
        this.fps = 60;
        this.fpsInterval = 1000 / this.fps;
        
        this.onResize = this.onResize.bind(this);
        this.animate = this.animate.bind(this);
        
        this.init();
    }

    async init() {
        // Setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true
        });
        
        // Configure renderer
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);

        // Load texture
        const textureLoader = new THREE.TextureLoader();
        const globeTexture = await new Promise(resolve => 
            textureLoader.load('/assets/globe-texture.png', resolve)
        );
        
        globeTexture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        globeTexture.minFilter = THREE.LinearFilter;
        globeTexture.generateMipmaps = false;
        
        // Create globe
        const geometry = new THREE.SphereGeometry(4, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            map: globeTexture,
            transparent: true,
            opacity: 0.9
        });
        
        this.globe = new THREE.Mesh(geometry, material);
        this.scene.add(this.globe);
        
        // Position camera
        this.camera.position.z = 8;
        this.globe.rotation.x = 0.5;
        
        // Add event listener for resize only
        window.addEventListener('resize', this.onResize);
        
        // Start animation with timestamp
        this.lastFrame = performance.now();
        this.animate();
    }
    
    onResize() {
        if (!this.renderer || !this.camera) return;
        
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    animate(currentTime) {
        if (!this.isRunning) return;

        // Throttle to target FPS
        const elapsed = currentTime - this.lastFrame;
        
        if (elapsed > this.fpsInterval) {
            this.lastFrame = currentTime - (elapsed % this.fpsInterval);
            
            if (this.globe) {
                this.globe.rotation.y += this.rotationSpeed;
                this.renderer.render(this.scene, this.camera);
            }
        }
        
        requestAnimationFrame(this.animate);
    }

    destroy() {
        this.isRunning = false;
        
        window.removeEventListener('resize', this.onResize);
        
        if (this.globe) {
            this.scene.remove(this.globe);
            this.globe.geometry.dispose();
            this.globe.material.dispose();
            if (this.globe.material.map) {
                this.globe.material.map.dispose();
            }
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        this.globe = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }
}

// Initialize globe when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.globe-container');
    if (container) {
        new Globe(container);
    }
}); 