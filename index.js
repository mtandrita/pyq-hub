const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.classList.remove('hidden');
      // Stop observing once visible (prevents shaking)
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.2,
  rootMargin: '0px 0px -50px 0px'
});

// Select both .para and .para2
document.querySelectorAll('.para, .para2').forEach(section => {
  section.classList.add('hidden'); // Start hidden
  observer.observe(section);
});
