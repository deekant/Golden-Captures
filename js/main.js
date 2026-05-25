(function () {
  "use strict";

  var menuBtn = document.querySelector(".navbar_menu-button");
  var navMenu = document.querySelector(".navbar_menu");
  if (menuBtn && navMenu) {
    function setMenuOpen(open) {
      navMenu.classList.toggle("is-open", open);
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false");
      menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    menuBtn.addEventListener("click", function () {
      setMenuOpen(!navMenu.classList.contains("is-open"));
    });
    navMenu.querySelectorAll("a, .button").forEach(function (link) {
      link.addEventListener("click", function () {
        setMenuOpen(false);
      });
    });
  }

  var mobileCta = document.getElementById("mobile-cta");
  var heroSection = document.querySelector(".section_header-hero");
  var mobileCtaMq = window.matchMedia("(max-width: 61.99rem)");
  if (mobileCta && heroSection && mobileCtaMq.matches) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        mobileCta.classList.toggle("hide", entry.isIntersecting);
      });
    }, { threshold: 0 }).observe(heroSection);
  }
  if (mobileCta && !mobileCtaMq.matches) {
    mobileCta.classList.add("hide");
  }

  var videoBlock = document.getElementById("testimonials-video-block");
  var playBtn = document.querySelector("[data-play-testimonial-video]");
  var video = document.getElementById("review-video");
  if (videoBlock && playBtn && video) {
    playBtn.addEventListener("click", function () {
      videoBlock.classList.add("is-playing");
      video.setAttribute("controls", "");
      video.play();
    });
  }

  var heroSlider = document.getElementById("hero-slider");
  if (heroSlider) {
    var heroSlides = heroSlider.querySelectorAll("img");
    var heroIndex = 0;
    var heroInterval = 3000;
    var heroAnimating = false;
    var heroReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function setHeroFetchPriority(activeIndex) {
      heroSlides.forEach(function (slide, i) {
        if (i === activeIndex) {
          slide.setAttribute("fetchpriority", "high");
        } else {
          slide.removeAttribute("fetchpriority");
        }
      });
    }

    function showHeroSlide(index) {
      heroSlides.forEach(function (slide, i) {
        slide.classList.remove("is-leaving");
        slide.classList.toggle("is-active", i === index);
      });
      heroIndex = index;
      setHeroFetchPriority(index);
    }

    function advanceHeroSlide() {
      if (heroAnimating || heroSlides.length < 2) return;
      var nextIndex = (heroIndex + 1) % heroSlides.length;
      if (heroReducedMotion) {
        showHeroSlide(nextIndex);
        return;
      }
      var current = heroSlides[heroIndex];
      var next = heroSlides[nextIndex];
      heroAnimating = true;
      current.classList.remove("is-active");
      current.classList.add("is-leaving");
      next.classList.add("is-active");
      heroIndex = nextIndex;
      setHeroFetchPriority(nextIndex);
      current.addEventListener("transitionend", function onLeave(e) {
        if (e.target !== current || e.propertyName !== "transform") return;
        current.removeEventListener("transitionend", onLeave);
        current.classList.remove("is-leaving");
        heroAnimating = false;
      });
    }

    setHeroFetchPriority(0);

    if (heroSlides.length > 1) {
      setInterval(advanceHeroSlide, heroInterval);
    }
  }

  var galleryCarousel = document.getElementById("gallery-carousel");
  if (galleryCarousel) {
    var viewport = galleryCarousel.querySelector(".gallery_carousel-viewport");
    var track = galleryCarousel.querySelector(".gallery_carousel-track");
    var dots = galleryCarousel.querySelectorAll(".gallery_dot");
    var slides = galleryCarousel.querySelectorAll(".gallery_slide");
    var currentIndex = 0;
    var dragStartX = 0;
    var dragStartTranslate = 0;
    var dragDelta = 0;
    var isDragging = false;
    var dragThreshold = 40;
    var galleryDesktopMq = window.matchMedia("(min-width: 62rem)");
    var galleryWasDesktop = galleryDesktopMq.matches;
    var galleryLayout = {
      viewportWidth: 0,
      gap: 0,
      slideWidths: [],
      translateByIndex: []
    };

    function isGalleryDesktop() {
      return galleryDesktopMq.matches;
    }

    function getLogicalSlideCount() {
      return isGalleryDesktop() ? Math.ceil(slides.length / 2) : slides.length;
    }

    function getMaxIndex() {
      return getLogicalSlideCount() - 1;
    }

    var galleryMeasureRaf = 0;

    function measureGalleryLayout() {
      if (!viewport || !track) return;
      var viewportRect = viewport.getBoundingClientRect();
      galleryLayout.viewportWidth = viewportRect.width;
      galleryLayout.gap = parseFloat(getComputedStyle(track).gap) || 0;
      galleryLayout.slideWidths = [];
      for (var i = 0; i < slides.length; i++) {
        galleryLayout.slideWidths[i] = slides[i].getBoundingClientRect().width;
      }
      galleryLayout.translateByIndex = [];
      for (var j = 0, max = getMaxIndex(); j <= max; j++) {
        galleryLayout.translateByIndex[j] = computeCenteredTranslate(j);
      }
    }

    function scheduleGalleryMeasure(applyPosition) {
      cancelAnimationFrame(galleryMeasureRaf);
      galleryMeasureRaf = requestAnimationFrame(function () {
        measureGalleryLayout();
        if (applyPosition) {
          setTransform(currentIndex, 0);
          updateDots();
        }
      });
    }

    function getSlideOffsetLeft(index) {
      var offset = 0;
      for (var i = 0; i < index; i++) {
        offset += galleryLayout.slideWidths[i] + galleryLayout.gap;
      }
      return offset;
    }

    function getGroupWidth(logicalIndex) {
      if (!isGalleryDesktop()) {
        return galleryLayout.slideWidths[logicalIndex] || 0;
      }
      var first = logicalIndex * 2;
      var second = first + 1;
      if (!galleryLayout.slideWidths[first]) return 0;
      var width = galleryLayout.slideWidths[first];
      if (galleryLayout.slideWidths[second]) {
        width += galleryLayout.gap + galleryLayout.slideWidths[second];
      }
      return width;
    }

    function computeCenteredTranslate(index) {
      if (!viewport) return 0;
      var offsetIndex = isGalleryDesktop() ? index * 2 : index;
      var groupWidth = getGroupWidth(index);
      return (galleryLayout.viewportWidth - groupWidth) / 2 - getSlideOffsetLeft(offsetIndex);
    }

    function getCenteredTranslate(index) {
      if (galleryLayout.translateByIndex[index] !== undefined) {
        return galleryLayout.translateByIndex[index];
      }
      return computeCenteredTranslate(index);
    }

    function setTransform(index, offsetPx) {
      if (!track) return;
      var x = getCenteredTranslate(index) + (offsetPx || 0);
      track.style.transform = "translate3d(" + x + "px, 0, 0)";
    }

    function updateDots() {
      dots.forEach(function (dot) {
        var dotIndex = parseInt(dot.getAttribute("data-slide"), 10);
        if (isNaN(dotIndex)) return;
        var active = isGalleryDesktop()
          ? dotIndex === currentIndex && dotIndex < getLogicalSlideCount()
          : dotIndex === currentIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
      });
    }

    function goToSlide(index) {
      currentIndex = Math.max(0, Math.min(getMaxIndex(), index));
      if (!galleryLayout.viewportWidth) {
        scheduleGalleryMeasure(true);
        return;
      }
      setTransform(currentIndex, 0);
      updateDots();
    }

    var dragBounds = { minX: 0, maxX: 0 };

    function clampTranslate(x) {
      if (x > dragBounds.maxX) return dragBounds.maxX + (x - dragBounds.maxX) * 0.35;
      if (x < dragBounds.minX) return dragBounds.minX + (x - dragBounds.minX) * 0.35;
      return x;
    }

    function snapFromDrag() {
      if (Math.abs(dragDelta) > dragThreshold) {
        if (dragDelta > 0 && currentIndex > 0) currentIndex -= 1;
        if (dragDelta < 0 && currentIndex < getMaxIndex()) currentIndex += 1;
      }
      goToSlide(currentIndex);
    }

    if (viewport && track && slides.length) {
      if (typeof ResizeObserver !== "undefined") {
        new ResizeObserver(function () {
          scheduleGalleryMeasure(true);
        }).observe(viewport);
      } else {
        window.addEventListener("load", function () {
          scheduleGalleryMeasure(true);
        });
      }

      window.addEventListener("resize", function () {
        var nowDesktop = isGalleryDesktop();
        if (nowDesktop && !galleryWasDesktop) {
          currentIndex = Math.min(Math.floor(currentIndex / 2), getMaxIndex());
        } else if (!nowDesktop && galleryWasDesktop) {
          currentIndex = Math.min(currentIndex * 2, getMaxIndex());
        }
        galleryWasDesktop = nowDesktop;
        scheduleGalleryMeasure(true);
      });

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          var index = parseInt(dot.getAttribute("data-slide"), 10);
          if (!isNaN(index)) goToSlide(index);
        });
      });

      viewport.addEventListener("pointerdown", function (e) {
        if (e.button !== 0) return;
        if (!galleryLayout.viewportWidth) {
          scheduleGalleryMeasure(false);
          return;
        }
        isDragging = true;
        dragStartX = e.clientX;
        dragStartTranslate = getCenteredTranslate(currentIndex);
        dragBounds.maxX = getCenteredTranslate(0);
        dragBounds.minX = getCenteredTranslate(getMaxIndex());
        dragDelta = 0;
        viewport.classList.add("is-dragging");
        viewport.setPointerCapture(e.pointerId);
      });

      viewport.addEventListener("pointermove", function (e) {
        if (!isDragging) return;
        dragDelta = e.clientX - dragStartX;
        var nextX = clampTranslate(dragStartTranslate + dragDelta);
        track.style.transform = "translate3d(" + nextX + "px, 0, 0)";
      });

      function endDrag(e) {
        if (!isDragging) return;
        isDragging = false;
        viewport.classList.remove("is-dragging");
        try { viewport.releasePointerCapture(e.pointerId); } catch (err) { /* noop */ }
        snapFromDrag();
      }

      viewport.addEventListener("pointerup", endDrag);
      viewport.addEventListener("pointercancel", endDrag);
      viewport.addEventListener("lostpointercapture", function () {
        if (isDragging) {
          isDragging = false;
          viewport.classList.remove("is-dragging");
          snapFromDrag();
        }
      });
    }
  }

  document.querySelectorAll(".faq_item").forEach(function (detail) {
    var summary = detail.querySelector("summary");
    var answer = detail.querySelector(".faq_answer");
    if (!summary || !answer) return;

    if (detail.hasAttribute("open")) {
      detail.classList.add("faq_item--expanded");
    }

    summary.addEventListener("click", function (e) {
      e.preventDefault();
      if (detail.classList.contains("faq_item--expanded")) {
        detail.classList.remove("faq_item--expanded");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          detail.removeAttribute("open");
          return;
        }
        var onClose = function (ev) {
          if (ev.target !== answer || ev.propertyName !== "grid-template-rows") return;
          answer.removeEventListener("transitionend", onClose);
          detail.removeAttribute("open");
        };
        answer.addEventListener("transitionend", onClose);
      } else {
        detail.setAttribute("open", "");
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            detail.classList.add("faq_item--expanded");
          });
        });
      }
    });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  var honeybookRoot = document.querySelector(".cta_honeybook");
  if (honeybookRoot) {
    var honeybookPid = "69bdb71e3f88dd00293079dd";
    var honeybookIframeTitle = "Get your custom quote contact form";

    if (!window.__gcHoneybookPlacementLoaded) {
      window.__gcHoneybookPlacementLoaded = true;
      window._HB_ = window._HB_ || {};
      window._HB_.pid = honeybookPid;
      var hbScript = document.createElement("script");
      hbScript.async = true;
      hbScript.src =
        "https://widget.honeybook.com/assets_users_production/websiteplacements/placement-controller.min.js";
      document.head.appendChild(hbScript);
    }

    function titleHoneybookIframe(iframe) {
      if (!iframe.getAttribute("title")) {
        iframe.setAttribute("title", honeybookIframeTitle);
      }
    }
    honeybookRoot.querySelectorAll("iframe").forEach(titleHoneybookIframe);
    new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeName === "IFRAME") {
            titleHoneybookIframe(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll("iframe").forEach(titleHoneybookIframe);
          }
        });
      });
    }).observe(honeybookRoot, { childList: true, subtree: true });
  }
})();
