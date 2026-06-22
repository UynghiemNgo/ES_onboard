(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var counters = document.querySelectorAll('[data-count]');
  if (reduce) {
    counters.forEach(function (el) { el.textContent = el.dataset.count; });
  } else {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, target = parseInt(el.dataset.count, 10);
        var cur = 0;
        var step = Math.max(1, Math.round(target / 40));
        var tick = function () {
          cur = Math.min(target, cur + step);
          el.textContent = cur;
          if (cur < target) requestAnimationFrame(tick);
        };
        tick();
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { io.observe(el); });
  }
})();
