document.addEventListener('DOMContentLoaded', function() {
    // Highlight the current page link based on the URL path.
    const links = document.querySelectorAll('nav a');
    function setActiveLink() {
      const currentPath = window.location.pathname;
      links.forEach(link => {
        // Assuming the href attribute matches the route (e.g. "/overview")
        if (link.getAttribute('href') === currentPath) {
          link.classList.add('bg-neutral-100', 'text-neutral-700');
          link.classList.remove('text-neutral-600');
        } else {
          link.classList.remove('bg-neutral-100', 'text-neutral-700');
          link.classList.add('text-neutral-600');
        }
      });
    }
    window.addEventListener('popstate', setActiveLink);
    setActiveLink();
  });
  
  // Smooth scrolling for in‑page anchor links (if any)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
  