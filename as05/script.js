// 較慢、接近瀏覽器原生 smooth 手感的 JavaScript 版本。
const nav = document.querySelector("#nav");
const navLinks = document.querySelectorAll('#nav a[href^="#"]');
const scrollDuration = 4000;
let activeAnimationFrame;

function smootherstep(progress) {
  return progress * progress * progress
    * (progress * (progress * 6 - 15) + 10);
}

function scrollToTarget(target, hash) {
  const navOffset = target.id === "banner" ? 0 : nav.offsetHeight;
  const targetPosition = target.getBoundingClientRect().top + window.scrollY - navOffset;
  const startPosition = window.scrollY;
  const distance = targetPosition - startPosition;
  const startTime = performance.now();

  cancelAnimationFrame(activeAnimationFrame);

  function animate(currentTime) {
    const progress = Math.min((currentTime - startTime) / scrollDuration, 1);
    const easedProgress = smootherstep(progress);

    window.scrollTo(0, startPosition + distance * easedProgress);

    if (progress === 1) {
      window.scrollTo(0, targetPosition);
      activeAnimationFrame = undefined;
      history.pushState(null, "", hash);
      return;
    }

    activeAnimationFrame = requestAnimationFrame(animate);
  }

  activeAnimationFrame = requestAnimationFrame(animate);
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const hash = link.getAttribute("href");
    const target = document.querySelector(hash);

    if (!target) return;

    event.preventDefault();
    scrollToTarget(target, hash);
  });
});
