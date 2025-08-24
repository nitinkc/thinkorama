const IMAGE_FOLDER = 'images/';
const DISPLAY_TIME = 5000;
const TOTAL_DURATION = 15 * 60 * 1000;

async function fetchImageList() {
  const response = await fetch('images.json');
  return await response.json();
}

function startSlideshow(images) {
  const container = document.getElementById('slideshow');
  let index = 0;
  const shuffled = images.sort(() => Math.random() - 0.5);
  const startTime = Date.now();

  function showNext() {
    if (Date.now() - startTime > TOTAL_DURATION) return;
    container.innerHTML = `<img src="${IMAGE_FOLDER}${shuffled[index]}" style="width:100vw;height:100vh;object-fit:cover;">`;
    index = (index + 1) % shuffled.length;
    setTimeout(showNext, DISPLAY_TIME);
  }

  showNext();
}

fetchImageList().then(startSlideshow);
