(function () {
  "use strict";

  function initNav() {
    document.querySelectorAll(".w-nav").forEach(function (nav) {
      var btn = nav.querySelector(".w-nav-button");
      var menu = nav.querySelector(".w-nav-menu");
      var overlay = nav.querySelector(".w-nav-overlay");
      if (!btn || !menu || !overlay) return;

      function close() {
        btn.classList.remove("w--open");
        btn.setAttribute("aria-expanded", "false");
        overlay.style.display = "none";
        overlay.innerHTML = "";
      }

      function open() {
        var clone = menu.cloneNode(true);
        clone.setAttribute("data-nav-menu-open", "");
        overlay.innerHTML = "";
        overlay.appendChild(clone);
        overlay.style.display = "block";
        overlay.style.height = clone.offsetHeight + "px";
        btn.classList.add("w--open");
        btn.setAttribute("aria-expanded", "true");
      }

      function toggle() {
        btn.classList.contains("w--open") ? close() : open();
      }

      btn.addEventListener("click", toggle);
      btn.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
      document.addEventListener("click", function (e) {
        if (!nav.contains(e.target)) close();
      });
      window.addEventListener("resize", function () {
        if (getComputedStyle(btn).display === "none") close();
      });
    });
  }

  function initSliders() {
    document.querySelectorAll(".w-slider").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll(".w-slide"));
      if (!slides.length) return;
      var dotsWrap = slider.querySelector(".w-slider-nav");
      var left = slider.querySelector(".w-slider-arrow-left");
      var right = slider.querySelector(".w-slider-arrow-right");
      var delay = parseInt(slider.getAttribute("data-delay"), 10) || 4000;
      var autoplay = slider.getAttribute("data-autoplay") === "true";
      var index = 0;
      var timer = null;
      var dots = [];

      if (slider.getAttribute("data-hide-arrows") === "true" || slides.length < 2) {
        [left, right].forEach(function (a) { if (a) a.style.display = "none"; });
      }

      if (dotsWrap) {
        slides.forEach(function (_, i) {
          var dot = document.createElement("div");
          dot.className = "w-slider-dot";
          dot.setAttribute("role", "button");
          dot.setAttribute("tabindex", "0");
          dot.setAttribute("aria-label", "Show slide " + (i + 1) + " of " + slides.length);
          dot.addEventListener("click", function () { go(i); restart(); });
          dotsWrap.appendChild(dot);
          dots.push(dot);
        });
      }

      function go(i) {
        index = (i + slides.length) % slides.length;
        slides.forEach(function (s) {
          s.style.transform = "translateX(" + (-100 * index) + "%)";
        });
        dots.forEach(function (d, di) { d.classList.toggle("w-active", di === index); });
      }

      function restart() {
        if (!autoplay) return;
        clearInterval(timer);
        timer = setInterval(function () { go(index + 1); }, delay);
      }

      if (left) left.addEventListener("click", function () { go(index - 1); restart(); });
      if (right) right.addEventListener("click", function () { go(index + 1); restart(); });

      var startX = null;
      slider.addEventListener("touchstart", function (e) { startX = e.touches[0].clientX; }, { passive: true });
      slider.addEventListener("touchend", function (e) {
        if (startX === null) return;
        var dx = e.changedTouches[0].clientX - startX;
        if (Math.abs(dx) > 40) { go(index + (dx < 0 ? 1 : -1)); restart(); }
        startX = null;
      });

      go(0);
      restart();
    });
  }

  function initLottie() {
    if (!window.lottie) return;
    document.querySelectorAll('[data-animation-type="lottie"]').forEach(function (el) {
      window.lottie.loadAnimation({
        container: el,
        renderer: el.getAttribute("data-renderer") || "svg",
        loop: el.getAttribute("data-loop") === "1",
        autoplay: el.getAttribute("data-autoplay") === "1",
        path: el.getAttribute("data-src")
      });
    });
  }

  function initClocks() {
    var clocks = document.querySelectorAll("[fb-clock]");
    if (!clocks.length) return;
    function tick() {
      var now = new Date();
      clocks.forEach(function (clock) {
        var parts = new Intl.DateTimeFormat("en-US", {
          timeZone: clock.getAttribute("fb-clock-timezone") || undefined,
          hour: "2-digit",
          minute: "2-digit",
          hour12: clock.getAttribute("fb-clock-format") !== "24-hour"
        }).formatToParts(now);
        var get = function (t) {
          var p = parts.find(function (x) { return x.type === t; });
          return p ? p.value : "";
        };
        var h = clock.querySelector("[fb-clock-hour]");
        var m = clock.querySelector("[fb-clock-minute]");
        var period = clock.querySelector("[fb-clock-period]");
        if (h) h.textContent = get("hour").padStart(2, "0");
        if (m) m.textContent = get("minute");
        if (period) period.textContent = get("dayPeriod").toLowerCase();
      });
    }
    tick();
    setInterval(tick, 10000);
  }

  function initScrollCarousel() {
    var section = document.querySelector(".carousel-cover");
    var track = section && section.querySelector(".inner-container");
    if (!track) return;
    var ticking = false;
    function update() {
      ticking = false;
      var rect = section.getBoundingClientRect();
      var vh = window.innerHeight;
      var progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
      var max = Math.max(0, track.scrollWidth - section.clientWidth);
      track.style.transform = "translate3d(" + (-max * progress) + "px,0,0)";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  function initHoverBubble() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    document.querySelectorAll(".imageproject").forEach(function (card) {
      var bubble = card.querySelector(".works-hover");
      if (!bubble) return;
      card.addEventListener("mouseenter", function () { card.classList.add("is-hovering"); });
      card.addEventListener("mouseleave", function () { card.classList.remove("is-hovering"); });
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        bubble.style.left = e.clientX - r.left + "px";
        bubble.style.top = e.clientY - r.top + "px";
      });
    });
  }

  initNav();
  initSliders();
  initLottie();
  initClocks();
  initScrollCarousel();
  initHoverBubble();
})();
