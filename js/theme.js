/**
 * Theme Switcher
 * Handles theme switching based on user preference and system preference
 */

// Single instance of the media query
const systemThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

// Initialize theme on document load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
});

// Initialize theme based on saved preference or system preference
function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
        // User has a saved preference, use it
        document.documentElement.setAttribute('data-theme', savedTheme);
        console.log('Using saved theme preference:', savedTheme);
    } else {
        // No saved preference, check system preference
        const systemTheme = systemThemeMedia.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', systemTheme);
        console.log('Using system theme preference:', systemTheme);
    }
    
    // Update toggle button to match current theme
    updateToggleButton();
}

// Single listener for system preference changes
systemThemeMedia.addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
        // Only update if user hasn't set a preference
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        console.log('System theme changed to:', newTheme);
        updateToggleButton();
    }
});

// Toggle between light and dark themes
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    // Set the theme
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Save the preference
    try {
        localStorage.setItem('theme', newTheme);
        console.log('Theme manually changed to:', newTheme);
    } catch (e) {
        console.error('Could not save theme preference:', e);
    }
    
    // Update button appearance
    updateToggleButton();
}

// Update toggle button appearance based on current theme
function updateToggleButton() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const toggleButtons = document.querySelectorAll('.theme-toggle');
    
    // Update all toggle buttons on the page
    toggleButtons.forEach(button => {
        // Set aria-label for accessibility
        button.setAttribute('aria-label', `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`);
    });
}

// Clear user theme preference (reset to system preference)
function resetThemePreference() {
    localStorage.removeItem('theme');
    initTheme();
}

// Expose necessary functions to global scope
window.toggleTheme = toggleTheme;
window.resetThemePreference = resetThemePreference; 