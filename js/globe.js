import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

class Globe {
    constructor(container) {
        this.container = container;
        this.rotationY = 0;
        this.rotationX = 0.5;
        this.targetRotation = 0;
        this.currentRotation = 0;
        this.isRunning = true;
        
        // Bind methods to prevent memory leaks
        this.onScroll = this.onScroll.bind(this);
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
            antialias: true,
            powerPreference: "high-performance"
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
        this.globe.rotation.x = this.rotationX;
        
        // Add event listeners
        window.addEventListener('scroll', this.onScroll, { passive: true });
        window.addEventListener('resize', this.onResize);
        
        // Start animation
        this.animate(0);
        
        // Periodic state reset to prevent error accumulation
        setInterval(() => {
            if (Math.abs(this.currentRotation - this.targetRotation) < 0.001) {
                this.currentRotation = this.targetRotation;
            }
        }, 5000);
    }
    
    onScroll() {
        const scrollPercent = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        this.targetRotation = scrollPercent * Math.PI;
    }
    
    onResize() {
        if (!this.renderer || !this.camera) return;
        
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    animate(timestamp) {
        if (!this.isRunning) return;
        
        // Smooth rotation interpolation
        this.currentRotation += (this.targetRotation - this.currentRotation) * 0.1;
        
        // Constant rotation
        this.rotationY += 0.001;
        
        // Apply rotations
        if (this.globe) {
            this.globe.rotation.y = this.currentRotation + this.rotationY;
        }
        
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.animate);
    }

    destroy() {
        this.isRunning = false;
        
        // Remove event listeners
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onResize);
        
        // Cleanup Three.js resources
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
        
        // Clear references
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