import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

class Globe {
    constructor(container) {
        this.container = container;
        this.isRunning = true;
        this.rotationSpeed = 0.0002;
        this.scrollRotation = 0;
        this.lastScrollY = window.scrollY;
        this.animationFrame = null;
        
        // Create a separate canvas layer for better performance
        this.offscreenCanvas = document.createElement('canvas');
        this.offscreenContext = this.offscreenCanvas.getContext('webgl', {
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
            desynchronized: true
        });
        
        this.onResize = this.onResize.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.animate = this.animate.bind(this);
        
        this.init();
    }

    async init() {
        try {
            this.scene = new THREE.Scene();
            
            // Update camera setup
            const aspectRatio = this.container.clientWidth / this.container.clientHeight;
            this.camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
            
            // Set initial camera position using same formula as resize
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            const containerSize = Math.min(width, height);
            this.camera.position.z = Math.max(13, 9 * (1000 / containerSize));
            
            this.renderer = new THREE.WebGLRenderer({ 
                canvas: this.offscreenCanvas,
                context: this.offscreenContext,
                alpha: true, 
                antialias: true,
                powerPreference: 'high-performance'
            });
            
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.container.appendChild(this.offscreenCanvas);

            const textureLoader = new THREE.TextureLoader();
            const globeTexture = await new Promise((resolve) => {
                textureLoader.load('/assets/globe-texture.png', resolve, undefined, resolve);
            });
            
            globeTexture.minFilter = THREE.LinearMipmapLinearFilter;
            globeTexture.magFilter = THREE.LinearFilter;
            globeTexture.generateMipmaps = true;
            
            // Fixed globe size
            const geometry = new THREE.SphereGeometry(6, 64, 64);
            const material = new THREE.MeshBasicMaterial({
                map: globeTexture,
                transparent: true,
                opacity: 0.9
            });
            
            this.globe = new THREE.Mesh(geometry, material);
            this.scene.add(this.globe);
            
            this.globe.rotation.x = 0.3;
            
            window.addEventListener('resize', this.onResize, { passive: true });
            window.addEventListener('scroll', this.onScroll, { passive: true });
            
            requestAnimationFrame(() => {
                this.container.classList.add('loaded');
            });
            
            this.animate();

        } catch (error) {
            console.error('Error initializing globe:', error);
            this.showErrorState();
        }
    }

    onScroll() {
        const scrollDelta = window.scrollY - this.lastScrollY;
        this.scrollRotation += scrollDelta * 0.0002;
        this.lastScrollY = window.scrollY;
    }

    onResize() {
        if (!this.renderer || !this.camera) return;
        
        // Update sizes
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        // Update camera
        this.camera.aspect = width / height;
        
        // Adjust camera position based on container size
        const containerSize = Math.min(width, height);
        this.camera.position.z = Math.max(13, 9 * (1000 / containerSize));
        
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(width, height);
        
        // Force render
        this.renderer.render(this.scene, this.camera);
    }

    animate() {
        if (!this.isRunning) return;

        this.animationFrame = requestAnimationFrame(this.animate);

        if (this.globe) {
            this.globe.rotation.y += this.rotationSpeed;
            this.globe.rotation.y += this.scrollRotation;
            this.scrollRotation *= 0.95;
            
            this.renderer.render(this.scene, this.camera);
        }
    }

    destroy() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('scroll', this.onScroll);
        
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
            this.renderer.forceContextLoss();
            this.offscreenCanvas.remove();
        }
        
        this.offscreenCanvas = null;
        this.offscreenContext = null;
        this.globe = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
    }

    showErrorState() {
        const errorEl = document.createElement('div');
        errorEl.className = 'globe-error';
        errorEl.textContent = 'Could not load globe visualization';
        this.container.appendChild(errorEl);
    }
}

// Initialize globe immediately
const container = document.querySelector('.globe-container');
if (container && !window.matchMedia('(max-width: 768px)').matches) {
    new Globe(container);
}