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

// Modal functionality
function openModal() {
    document.getElementById('scheduleModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('scheduleModal').classList.add('hidden');
}

function handleSubmit(event) {
    event.preventDefault();
    
    const formData = {
        meeting_name: document.getElementById('meetingName').value,
        meeting_time: document.getElementById('meetingTime').value,
        meeting_url: document.getElementById('meetingUrl').value,
        meeting_platform: document.getElementById('meetingPlatform').value
    };

    // Send POST request to backend
    fetch('/schedule_meeting', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            closeModal();
            // Refresh the page to show new meeting
            window.location.reload();
        } else {
            alert('Failed to schedule meeting: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to schedule meeting');
    });
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('scheduleModal');
    const modalContent = modal.querySelector('div');
    if (event.target === modal) {
        closeModal();
    }
});

function toggleJoinButton(button) {
    if (button.textContent.trim() === 'Allow Joining') {
        button.textContent = 'Join Meeting';
        button.onclick = function() {
            window.open(button.dataset.url, '_blank');
        };
    }
}

function showDetails(name, time, platform, url) {
    document.getElementById('detailMeetingName').textContent = name;
    document.getElementById('detailMeetingTime').textContent = time;
    document.getElementById('detailMeetingPlatform').textContent = platform;
    
    const urlElement = document.getElementById('detailMeetingUrl');
    if (url) {
        urlElement.href = url;
        urlElement.textContent = url;
        urlElement.classList.remove('hidden');
    } else {
        urlElement.classList.add('hidden');
    }
    
    document.getElementById('detailsModal').classList.remove('hidden');
}

function closeDetailsModal() {
    document.getElementById('detailsModal').classList.add('hidden');
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const detailsModal = document.getElementById('detailsModal');
    if (event.target === detailsModal) {
        closeDetailsModal();
    }
});
