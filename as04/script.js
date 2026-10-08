const crossfadeScenes = document.querySelectorAll("[data-crossfade]");
const introScene = document.querySelector(".intro-scene");
const introFirstLayer = introScene.querySelector(".intro-first-layer");
const pageTwo = document.querySelector("[data-page-two]");
const pageTwoImage = pageTwo.querySelector(".page-two-image");
const pageTwoMask = pageTwo.querySelector(".page-two-mask");
const fadeInFrame = document.querySelector("[data-fade-in]");
const fadeInImage = fadeInFrame.querySelector("img");
const sequenceScene = document.querySelector("[data-sequence]");
const horizontalScene = document.querySelector("[data-horizontal]");
const horizontalStage = horizontalScene.querySelector(".horizontal-stage");
const horizontalImage = horizontalStage.querySelector("img");
const introScrollDistance = 6000;
const introFadeDistance = 1000;

const clamp = (value, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));

const sceneProgress = (scene) => {
  const distance = scene.offsetHeight - window.innerHeight;
  return distance > 0
    ? clamp((window.scrollY - scene.offsetTop) / distance)
    : 0;
};

const crossfadeProgress = (scene) => {
  const fadeDelay = Number(scene.dataset.fadeDelay) || 0;
  const fadeDistance = Number(scene.dataset.fadeDistance);
  if (!fadeDistance) return sceneProgress(scene);

  const distance = scene.offsetHeight - window.innerHeight;
  const scrolled = clamp(window.scrollY - scene.offsetTop, 0, distance);
  return clamp((scrolled - fadeDelay) / fadeDistance);
};

const sizeHorizontalScene = () => {
  horizontalImage.style.transform = "none";
  const travel = Math.max(
    0,
    horizontalImage.offsetWidth - horizontalStage.clientWidth,
  );
  horizontalScene.style.height = `${horizontalStage.clientHeight + travel}px`;
  horizontalScene.dataset.travel = travel;
};

const updateScenes = () => {
  crossfadeScenes.forEach((scene) => {
    const topLayer = scene.querySelector(".crossfade-layer");
    topLayer.style.opacity = crossfadeProgress(scene);
  });

  const introRainPan = clamp(
    (window.scrollY - introScene.offsetTop) / introScrollDistance,
  );
  introFirstLayer.style.objectPosition = `center ${introRainPan * 100}%`;

  const pageTwoEntry = clamp(
    (window.scrollY -
      introScene.offsetTop -
      (introScrollDistance - introFadeDistance)) /
      introFadeDistance,
  );
  introFirstLayer.style.opacity = 1 - pageTwoEntry;
  pageTwo.style.opacity = pageTwoEntry;

  const pageTwoDistance = Math.max(
    1,
    pageTwo.offsetHeight - window.innerHeight,
  );
  const pageTwoProgress = clamp(
    (window.scrollY - pageTwo.offsetTop) / pageTwoDistance,
  );
  pageTwoMask.style.opacity = clamp((pageTwoProgress - 0.15) / 0.85) * 0.98;

  const fadeInProgress = clamp(
    (window.scrollY - fadeInFrame.offsetTop + window.innerHeight) /
      window.innerHeight,
  );
  fadeInImage.style.opacity = fadeInProgress;

  const sequenceScrolled = clamp(
    window.scrollY - sequenceScene.offsetTop,
    0,
    window.innerHeight * 6,
  );
  sequenceScene.querySelector(".lower-mask").style.opacity = clamp(
    sequenceScrolled / (window.innerHeight * 2),
  ) * 0.96;
  sequenceScene.querySelector(".sequence-layer-10").style.opacity = clamp(
    (sequenceScrolled - window.innerHeight * 3) / window.innerHeight,
  );
  sequenceScene.querySelector(".sequence-layer-11").style.opacity = clamp(
    (sequenceScrolled - window.innerHeight * 5) / window.innerHeight,
  );

  const travel = Number(horizontalScene.dataset.travel) || 0;
  const offset = travel * sceneProgress(horizontalScene);
  horizontalImage.style.transform = `translate3d(${-offset}px, 0, 0)`;
};

const refreshLayout = () => {
  sizeHorizontalScene();
  updateScenes();
};

window.addEventListener("scroll", updateScenes, { passive: true });
window.addEventListener("resize", refreshLayout);

if (horizontalImage.complete && pageTwoImage.complete) {
  refreshLayout();
} else {
  horizontalImage.addEventListener("load", refreshLayout, { once: true });
  pageTwoImage.addEventListener("load", refreshLayout, { once: true });
}
