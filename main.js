// Initialize canvas and context
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const loadingScreen = document.getElementById('loading');

// Loading state
let loadCounter = 0;

// Layer images
const images = [
    'background', 'didot', 'shadow', 'man', 'headlines', 'title', 'frame', 'gloss'
].map(name => {
    const img = new Image();
    img.src = `./images/layer_${name}.png`;
    return { image: img, name, zIndex: 0, position: { x: 0, y: 0 }, opacity: 1 };
});

// Check for sensor API support
async function requestOrientationPermission() {
    if (navigator.permissions) {
        try {
            const permission = await navigator.permissions.query({ name: 'gyroscope' });
            if (permission.state === 'denied') {
                console.warn('Gyroscope permission denied');
                return false;
            }
        } catch (error) {
            console.warn('Permissions API not supported or error:', error);
        }
    }
    return true;
}

async function initOrientationSensor() {
    if ('AbsoluteOrientationSensor' in window) {
        try {
            const sensor = new AbsoluteOrientationSensor({ frequency: 60 });
            sensor.addEventListener('reading', () => {
                const quaternion = sensor.quaternion;
                console.log('Orientation:', quaternion);
            });
            sensor.addEventListener('error', event => {
                console.error('Sensor error:', event.error.name);
            });
            await requestOrientationPermission();
            sensor.start();
        } catch (error) {
            console.error('Error initializing sensor:', error);
        }
    } else if ('DeviceOrientationEvent' in window) {
        window.addEventListener('deviceorientation', event => {
            console.log('Alpha:', event.alpha, 'Beta:', event.beta, 'Gamma:', event.gamma);
        });
    } else {
        console.warn('No orientation sensor available');
    }
}

// Request permission on Safari
document.getElementById('startButton').addEventListener('click', async () => {
    if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
            const permission = await DeviceOrientationEvent.requestPermission();
            if (permission === 'granted') {
                initOrientationSensor();
            } else {
                console.warn('Permission denied');
            }
        } catch (error) {
            console.error('Permission request error:', error);
        }
    } else {
        initOrientationSensor();
    }
});

// Render function
function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    images.sort((a, b) => a.zIndex - b.zIndex).forEach(layer => {
        context.globalAlpha = layer.opacity;
        context.drawImage(layer.image, layer.position.x, layer.position.y);
    });
    requestAnimationFrame(render);
}

// Start rendering once images are loaded
window.onload = () => {
    render();
};
