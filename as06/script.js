$(function () {
  // 使用者累積捲動到這個距離，才切換到下一頁或上一頁。
  const scrollThreshold = 100;
  let accumulatedScroll = 0;
  let isSliding = false;
  let slideTimer;
  let lastDirection = 0;

  // 找出目前「填滿畫面中央」的 div，避免在區塊交界處誤判。
  function getCurrentPage() {
    const screenMiddle = window.innerHeight / 2;

    return $('.page').toArray().find(function (page) {
      const position = page.getBoundingClientRect();
      return position.top <= screenMiddle && position.bottom >= screenMiddle;
    });
  }

  // 平滑捲到指定的文件高度；計時器保證鎖定一定會解除。
  function slideTo(scrollTop) {
    isSliding = true;
    clearTimeout(slideTimer);

    $('html, body').stop(true).animate({
      scrollTop: scrollTop
    }, 500);

    // 不依賴動畫 callback，避免 callback 失敗時整頁無法再滾動。
    slideTimer = setTimeout(function () {
      isSliding = false;
      accumulatedScroll = 0;
      lastDirection = 0;
    }, 650);
  }

  // wheel 事件可取得滑鼠滾輪的 deltaY，並在指定區塊累積到 100px。
  window.addEventListener('wheel', function (event) {
    if (isSliding) {
      event.preventDefault();
      return;
    }

    const currentPage = getCurrentPage();
    if (!currentPage) return;

    const pageNumber = $('.page').index(currentPage);
    const goingDown = event.deltaY > 0;
    const goingUp = event.deltaY < 0;
    const direction = goingDown ? 1 : -1;

    // 使用者改變滾動方向時，重新計算 100px，不能沿用前一方向的距離。
    if (direction !== lastDirection) accumulatedScroll = 0;
    lastDirection = direction;

    const pagePosition = currentPage.getBoundingClientRect();
    // 第三區頂端接近視窗頂端，才可往上跳回第二區。
    const pageIsAligned = Math.abs(pagePosition.top) < 24;
    // 第三區接近底端時先攔截，避免快速滾動直接露出第四、五區交界。
    const page3IsNearBottom = pagePosition.bottom <= window.innerHeight + 120;
    const shouldSlide =
      (goingDown && [0, 1].includes(pageNumber)) ||
      (goingUp && [1, 3, 4].includes(pageNumber)) ||
      (goingDown && pageNumber === 2 && page3IsNearBottom) ||
      (goingDown && pageNumber === 3) ||
      (goingUp && pageNumber === 2 && pageIsAligned);

    // 第三區尚未接近底端時可正常捲動；第四區往上也可正常回到第三區。
    if (!shouldSlide) {
      accumulatedScroll = 0;
      return;
    }

    event.preventDefault();
    accumulatedScroll += Math.abs(event.deltaY);

    if (accumulatedScroll < scrollThreshold) return;

    // 依方向取得下一個或上一個 page div。
    const targetIndex = goingDown ? pageNumber + 1 : pageNumber - 1;
    const targetPage = $('.page').eq(targetIndex);
    if (!targetPage.length) return;

    // 一般跳頁都對齊目標 section，避免 sticky 元素本身的 offset 造成細縫。
    let targetScrollTop = targetPage.parent().offset().top;

    // 第四區往上時，改讓 300vh 的第三區「底部」貼齊視窗底部。
    if (goingUp && pageNumber === 3) {
      targetScrollTop = targetPage.offset().top + targetPage.outerHeight() - window.innerHeight;
    }

    slideTo(targetScrollTop);
  }, { passive: false });
});
