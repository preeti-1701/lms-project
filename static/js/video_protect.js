document.addEventListener('DOMContentLoaded', function() {
    // Disable right-click on video container
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
        videoContainer.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    }

    // Disable common keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
        if (
            e.key === 'F12' ||
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
            (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
        ) {
            e.preventDefault();
            return false;
        }
    });

    // Prevent iframe from capturing clicks that navigate away
    const iframe = document.querySelector('.video-wrapper iframe');
    if (iframe) {
        iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation');
    }

    // Overlay to prevent direct interaction with iframe (optional layer)
    const wrapper = document.querySelector('.video-wrapper');
    if (wrapper && !document.getElementById('video-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'video-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.zIndex = '10';
        overlay.style.background = 'transparent';
        overlay.style.pointerEvents = 'none';
        wrapper.appendChild(overlay);
    }
});

