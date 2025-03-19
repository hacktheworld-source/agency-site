/**
 * Snow Tech Agency Blog Functionality
 * Handles tag filtering, search, and related post functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const tagFilters = document.querySelectorAll('.tag-filter');
    const searchInput = document.querySelector('.blog-search input');
    const searchButton = document.querySelector('.blog-search button');
    const blogPosts = document.querySelectorAll('.blog-card');
    const noPosts = document.getElementById('no-posts-message');
    
    // Active tag filter
    let activeTag = 'all';
    
    // Search term
    let searchTerm = '';
    
    /**
     * Tag filtering
     */
    if (tagFilters) {
        tagFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                // Update UI
                tagFilters.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                
                // Set active tag
                activeTag = this.getAttribute('data-tag');
                
                // Apply filters
                applyFilters();
            });
        });
    }
    
    /**
     * Search functionality
     */
    if (searchButton && searchInput) {
        searchButton.addEventListener('click', function() {
            searchTerm = searchInput.value.toLowerCase().trim();
            applyFilters();
        });
        
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchTerm = searchInput.value.toLowerCase().trim();
                applyFilters();
            }
        });
    }
    
    /**
     * Apply both tag and search filters
     */
    function applyFilters() {
        let visibleCount = 0;
        
        blogPosts.forEach(post => {
            const postTags = post.getAttribute('data-tags').split(',');
            const postTitle = post.querySelector('h3').textContent.toLowerCase();
            const postExcerpt = post.querySelector('.blog-excerpt') ? 
                post.querySelector('.blog-excerpt').textContent.toLowerCase() : '';
            
            // Check if post matches tag filter
            const matchesTag = activeTag === 'all' || postTags.includes(activeTag);
            
            // Check if post matches search term
            const matchesSearch = searchTerm === '' || 
                postTitle.includes(searchTerm) || 
                postExcerpt.includes(searchTerm);
            
            // Show/hide post based on filters
            if (matchesTag && matchesSearch) {
                post.style.display = 'flex';
                visibleCount++;
            } else {
                post.style.display = 'none';
            }
        });
        
        // Show "no posts" message if no visible posts
        if (noPosts) {
            if (visibleCount === 0) {
                noPosts.style.display = 'block';
            } else {
                noPosts.style.display = 'none';
            }
        }
    }
    
    /**
     * Related posts functionality for single blog posts
     */
    async function loadRelatedPosts() {
        try {
            const relatedPostsContainer = document.getElementById('relatedPosts');
            if (!relatedPostsContainer) return;
            
            // Get current post ID from data attribute
            const currentPostId = relatedPostsContainer.getAttribute('data-post-id');
            if (!currentPostId) return;
            
            // Fetch blog posts data
            const response = await fetch('/blog/blog.json');
            const allPosts = await response.json();
            
            // Find current post
            const currentPost = allPosts.find(post => post.id === currentPostId);
            if (!currentPost) return;
            
            const currentTags = currentPost.tags || [];
            
            // Find related posts based on tag overlap
            const relatedPosts = allPosts
                .filter(post => post.id !== currentPostId)
                .map(post => {
                    // Calculate relevance score based on tag overlap
                    const sharedTags = (post.tags || []).filter(tag => currentTags.includes(tag));
                    return {
                        ...post,
                        relevance: sharedTags.length
                    };
                })
                .filter(post => post.relevance > 0)
                .sort((a, b) => b.relevance - a.relevance)
                .slice(0, 3); // Get top 3 related posts
            
            // Render related posts
            renderRelatedPosts(relatedPosts, relatedPostsContainer);
        } catch (error) {
            console.error('Error loading related posts:', error);
            const relatedPostsElement = document.getElementById('relatedPosts');
            if (relatedPostsElement) {
                relatedPostsElement.style.display = 'none';
            }
        }
    }
    
    /**
     * Render related posts
     */
    function renderRelatedPosts(posts, container) {
        const relatedPostsGrid = container.querySelector('.related-posts-grid');
        if (!relatedPostsGrid) return;
        
        if (posts.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        posts.forEach(post => {
            const formattedDate = formatDate(post.date);
            
            const postHTML = `
                <article class="blog-card">
                    <div class="blog-image">
                        <img src="${post.image || '/assets/images/blog/default.jpg'}" alt="${post.title}">
                    </div>
                    <div class="blog-content">
                        <span class="blog-tag">${post.tags[0] || 'General'}</span>
                        <h3>${post.title}</h3>
                        <span class="blog-date">${formattedDate}</span>
                        <a href="/blog/posts/${post.slug}.html" class="blog-read-more">Read Article →</a>
                    </div>
                </article>
            `;
            
            relatedPostsGrid.innerHTML += postHTML;
        });
    }
    
    /**
     * Format date
     */
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }
    
    // Initialize related posts if on a single blog post page
    if (document.querySelector('.blog-post-content')) {
        loadRelatedPosts();
    }
}); 