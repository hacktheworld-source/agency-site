import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';

export default class Globe {
    constructor(container) {
        if (!container) return;
        
        this.container = container;
        this.isRunning = true;
        this.rotationSpeed = 0.0002;
        this.scrollRotation = 0;
        this.lastScrollY = window.scrollY;
        this.animationFrame = null;
        
        // Store the instance globally
        window.globeInstance = this;
        
        this.onResize = this.onResize.bind(this);
        this.onScroll = this.onScroll.bind(this);
        this.animate = this.animate.bind(this);
        
        // Clear container
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing globe...');
            this.scene = new THREE.Scene();
            
            const aspectRatio = this.container.clientWidth / this.container.clientHeight;
            this.camera = new THREE.PerspectiveCamera(60, aspectRatio, 0.1, 1000);
            
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            const containerSize = Math.min(width, height);
            this.camera.position.z = Math.max(13, 9 * (1000 / containerSize));
            
            this.renderer = new THREE.WebGLRenderer({ 
                alpha: true, 
                antialias: true,
                powerPreference: 'high-performance'
            });
            
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.container.appendChild(this.renderer.domElement);

            const textureLoader = new THREE.TextureLoader();
            const globeTexture = await new Promise((resolve) => {
                textureLoader.load('/assets/globe-texture.png', resolve, undefined, resolve);
            });
            
            globeTexture.minFilter = THREE.LinearMipmapLinearFilter;
            globeTexture.magFilter = THREE.LinearFilter;
            globeTexture.generateMipmaps = true;
            
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
        
        // Immediately hide the container
        if (this.container) {
            this.container.style.opacity = '0';
        }
        
        if (this.globe) {
            this.scene.remove(this.globe);
            this.globe.geometry.dispose();
            this.globe.material.dispose();
            if (this.globe.material.map) {
                this.globe.material.map.dispose();
            }
        }
        
        if (this.renderer) {
            // Force immediate cleanup
            this.renderer.setAnimationLoop(null);
            this.renderer.dispose();
            this.renderer.forceContextLoss();
            if (this.renderer.domElement) {
                this.renderer.domElement.remove();
            }
            this.renderer = null;
        }
        
        // Clear all references
        this.globe = null;
        this.scene = null;
        this.camera = null;
        this.container = null;
        
        // Remove global reference
        if (window.globeInstance === this) {
            window.globeInstance = null;
        }
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