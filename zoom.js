const zoomableDiv = document.getElementById("canvas-wrapper");
let scale = 2; // Start zoomed in (1.5x)
let translateX = 0,
  translateY = 0;
let startX, startY;
let isPanning = false;

// Zoom on mouse wheel
zoomableDiv.addEventListener("wheel", function (event) {
  event.preventDefault();
  let zoomFactor = 0.01;
  scale += event.deltaY * -zoomFactor * 0.1;
  scale = Math.max(1, Math.min(scale, 3)); // Limit zoom scale (min: 1, max: 3)
  updateTransform();
},
{passive :true}
);

// Mouse down event to start panning
zoomableDiv.addEventListener("mousedown", function (event) {
  isPanning = true;
  startX = event.clientX - translateX;
  startY = event.clientY - translateY;
  zoomableDiv.style.cursor = "grabbing";
});

// Mouse move event for panning
window.addEventListener("mousemove", function (event) {
  if (!isPanning) return; // Calculate new translation values

  const newTranslateX = event.clientX - startX;
  const newTranslateY = event.clientY - startY; // Update translation values

  translateX = newTranslateX;
  translateY = newTranslateY; // Stop panning if the canvas is now at its original position

  if (translateX === 0 && translateY === 0) {
    isPanning = false;
    zoomableDiv.style.cursor = "grab"; // Change the cursor back to 'grab'
    return; // Exit the function early since panning is stopped
  }

  updateTransform();
});

// Mouse up event to stop panning
window.addEventListener("mouseup", function () {
  isPanning = false;
  zoomableDiv.style.cursor = "grab";
});

function updateTransform() {
  zoomableDiv.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
}

// Initialize the transform
updateTransform();
