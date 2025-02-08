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

let currentAudio = null;

function playAudio(meetingId) {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    
    currentAudio = new Audio(`/play-audio/${meetingId}`);
    currentAudio.play().catch(error => {
        console.error('Error playing audio:', error);
        alert('Error playing audio. Please try again.');
    });
}

function handleChatSubmit(event) {
    event.preventDefault();
    
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (!message) return;

    // Add user message
    addMessageToChat('user', message);
    messageInput.value = '';

    // Send to backend and get response
    fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message,
            meeting_id: currentMeetingId  // Make sure to set this variable somewhere
        })
    })
    .then(response => response.json())
    .then(data => {
        addMessageToChat('assistant', data.response);
    })
    .catch(error => {
        console.error('Error:', error);
        addMessageToChat('assistant', 'Sorry, I encountered an error processing your request.');
    });
}

function addMessageToChat(type, message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex items-start';

    if (type === 'user') {
        messageDiv.classList.add('justify-end');
        messageDiv.innerHTML = `
            <div class="mr-3 bg-blue-500 rounded-lg py-2 px-4 max-w-[80%]">
                <p class="text-white">${escapeHtml(message)}</p>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg class="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                </svg>
            </div>
            <div class="ml-3 bg-blue-50 rounded-lg py-2 px-4 max-w-[80%]">
                <p class="text-neutral-600">${escapeHtml(message)}</p>
            </div>
        `;
    }

    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
