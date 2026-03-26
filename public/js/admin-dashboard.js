// =====================================================
// ADMIN DASHBOARD SCRIPT
// =====================================================

let currentSectionId = 'dashboard-section';
let modal = null;
let currentSuggestionId = null;
let allSuggestions = [];

document.addEventListener('DOMContentLoaded', function() {
  modal = document.getElementById('suggestionModal');
  
  // Check authentication
  checkAuthentication();
  
  // Initialize dashboard
  initializeDashboard();
  
  // Setup navigation
  setupNavigation();
  
  // Load initial data
  loadDashboardData();
  
  // Setup modal
  setupModal();
  
  // Update time
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);
});

// =====================================================
// AUTHENTICATION CHECK
// =====================================================

async function checkAuthentication() {
  try {
    const response = await fetch('/api/admin/check-auth');
    const data = await response.json();

    if (!data.authenticated) {
      window.location.href = '/admin';
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    window.location.href = '/admin';
  }
}

// =====================================================
// INITIALIZE DASHBOARD
// =====================================================

function initializeDashboard() {
  document.getElementById('adminUsername').textContent = 'Admin User';
}

// =====================================================
// NAVIGATION SETUP
// =====================================================

function setupNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Remove active class from all items
      navItems.forEach(i => i.classList.remove('active'));
      
      // Add active class to clicked item
      this.classList.add('active');

      // Get section to show
      const sectionId = this.dataset.section + '-section';

      // Handle different sections
      if (this.dataset.section === 'dashboard') {
        showSection('dashboard-section');
        loadDashboardData();
      } else if (this.dataset.section === 'all-suggestions') {
        showSection('suggestions-section');
        document.getElementById('sectionTitle').textContent = 'All Suggestions';
        loadAllSuggestions();
      } else if (this.dataset.section === 'pending') {
        showSection('suggestions-section');
        document.getElementById('sectionTitle').textContent = 'Pending Suggestions';
        loadSuggestionsByStatus('Pending');
      } else if (this.dataset.section === 'under-review') {
        showSection('suggestions-section');
        document.getElementById('sectionTitle').textContent = 'Under Review';
        loadSuggestionsByStatus('Under Review');
      } else if (this.dataset.section === 'resolved') {
        showSection('suggestions-section');
        document.getElementById('sectionTitle').textContent = 'Resolved Suggestions';
        loadSuggestionsByStatus('Resolved');
      } else if (this.dataset.section === 'rejected') {
        showSection('suggestions-section');
        document.getElementById('sectionTitle').textContent = 'Rejected Suggestions';
        loadSuggestionsByStatus('Rejected');
      } else if (this.dataset.section === 'filter') {
        showSection('filter-section');
      }
    });
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', logout);
}

// =====================================================
// SECTION MANAGEMENT
// =====================================================

function showSection(sectionId) {
  const sections = document.querySelectorAll('.dashboard-section');
  sections.forEach(section => section.classList.remove('active'));
  
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.add('active');
    currentSectionId = sectionId;
  }
}

// =====================================================
// LOAD DATA
// =====================================================

async function loadDashboardData() {
  try {
    const response = await fetch('/api/suggestions/stats');
    const stats = await response.json();

    document.getElementById('statTotal').textContent = stats.total;
    document.getElementById('statPending').textContent = stats.pending;
    document.getElementById('statUnderReview').textContent = stats.underReview;
    document.getElementById('statResolved').textContent = stats.resolved;
    document.getElementById('statRejected').textContent = stats.rejected;

    // Load recent suggestions
    loadRecentSuggestions();
  } catch (error) {
    console.error('Error loading statistics:', error);
  }
}

async function loadRecentSuggestions() {
  try {
    const response = await fetch('/api/suggestions/all');
    const suggestions = await response.json();

    const recentList = document.getElementById('recentSuggestionsList');
    const recent = suggestions.slice(0, 5);

    if (recent.length === 0) {
      recentList.innerHTML = '<p style="text-align: center; color: #64748b;">No suggestions yet</p>';
      return;
    }

    recentList.innerHTML = recent.map(suggestion => `
      <div class="suggestion-item" onclick="openSuggestionModal('${suggestion._id}')">
        <div class="suggestion-header">
          <p class="suggestion-title">${escapeHtml(suggestion.title)}</p>
          <span class="suggestion-status status-${getStatusClass(suggestion.status)}">${suggestion.status}</span>
        </div>
        <div class="suggestion-meta">
          <span>Area: ${suggestion.area}</span>
          <span>Date: ${formatDate(suggestion.submittedAt)}</span>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading recent suggestions:', error);
  }
}

async function loadAllSuggestions() {
  showLoading();
  try {
    const response = await fetch('/api/suggestions/all');
    allSuggestions = await response.json();
    displaySuggestions(allSuggestions);
  } catch (error) {
    console.error('Error loading suggestions:', error);
  }
  hideLoading();
}

async function loadSuggestionsByStatus(status) {
  showLoading();
  try {
    const response = await fetch(`/api/suggestions/status/${status}`);
    const suggestions = await response.json();
    displaySuggestions(suggestions);
  } catch (error) {
    console.error('Error loading suggestions:', error);
  }
  hideLoading();
}

async function loadSuggestionsByArea(area) {
  showLoading();
  try {
    const response = await fetch(`/api/suggestions/area/${area}`);
    const suggestions = await response.json();
    
    const resultsList = document.getElementById('areaFilterResults');
    if (suggestions.length === 0) {
      resultsList.innerHTML = '<p style="text-align: center; color: #64748b;">No suggestions found</p>';
    } else {
      displaySuggestions(suggestions, 'areaFilterResults');
    }
  } catch (error) {
    console.error('Error loading suggestions:', error);
  }
  hideLoading();
}

// =====================================================
// DISPLAY SUGGESTIONS
// =====================================================

function displaySuggestions(suggestions, containerId = 'suggestionsList') {
  const container = document.getElementById(containerId);
  
  if (suggestions.length === 0) {
    container.innerHTML = '<p style="text-align: center; color: #64748b;">No suggestions found</p>';
    return;
  }

  container.innerHTML = suggestions.map(suggestion => `
    <div class="suggestion-item" onclick="openSuggestionModal('${suggestion._id}')">
      <div class="suggestion-header">
        <p class="suggestion-title">${escapeHtml(suggestion.title)}</p>
        <span class="suggestion-status status-${getStatusClass(suggestion.status)}">${suggestion.status}</span>
      </div>
      <div class="suggestion-meta">
        <span>Area: ${suggestion.area}</span>
        <span>Date: ${formatDate(suggestion.submittedAt)}</span>
        ${suggestion.imagePath ? '<span>Attachment: Yes</span>' : ''}
      </div>
      <p class="suggestion-message">${escapeHtml(suggestion.message.substring(0, 150))}...</p>
      <div class="suggestion-actions">
        <button onclick="event.stopPropagation(); openSuggestionModal('${suggestion._id}')">View Details</button>
      </div>
    </div>
  `).join('');
}

// =====================================================
// MODAL HANDLING
// =====================================================

function setupModal() {
  const modalClose = modal.querySelector('.modal-close');
  const modalCloseBtn = modal.querySelector('.modal-close-btn');
  const saveBtn = document.getElementById('saveModalBtn');
  const deleteBtn = document.getElementById('deleteModalBtn');

  modalClose.addEventListener('click', closeModal);
  modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });

  saveBtn.addEventListener('click', saveSuggestionChanges);
  deleteBtn.addEventListener('click', deleteSuggestion);
}

async function openSuggestionModal(suggestionId) {
  currentSuggestionId = suggestionId;

  try {
    const response = await fetch('/api/suggestions/all');
    const suggestions = await response.json();
    const suggestion = suggestions.find(s => s._id === suggestionId);

    if (!suggestion) {
      alert('Suggestion not found');
      return;
    }

    // Populate modal
    document.getElementById('modalTitle').textContent = suggestion.title;
    document.getElementById('modalMessage').textContent = suggestion.message;
    document.getElementById('modalArea').textContent = suggestion.area;
    document.getElementById('modalFloorWing').textContent = `Floor: ${suggestion.floor}, Wing: ${suggestion.wing}`;
    document.getElementById('modalDate').textContent = formatDate(suggestion.submittedAt);
    document.getElementById('modalStatus').value = suggestion.status;
    document.getElementById('modalResponse').value = suggestion.adminResponse || '';

    // Show/hide attachment
    const attachmentRow = document.getElementById('attachmentRow');
    if (suggestion.imagePath) {
      attachmentRow.classList.add('show');
      document.getElementById('modalAttachment').href = suggestion.imagePath;
    } else {
      attachmentRow.classList.remove('show');
    }

    modal.classList.add('show');
  } catch (error) {
    console.error('Error opening modal:', error);
  }
}

function closeModal() {
  modal.classList.remove('show');
  currentSuggestionId = null;
}

async function saveSuggestionChanges() {
  if (!currentSuggestionId) return;

  const status = document.getElementById('modalStatus').value;
  const adminResponse = document.getElementById('modalResponse').value;

  showLoading();

  try {
    const response = await fetch(`/api/suggestions/update/${currentSuggestionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, adminResponse })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert('Suggestion updated successfully');
      closeModal();
      loadDashboardData();
    } else {
      alert('Error updating suggestion: ' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please try again.');
  }

  hideLoading();
}

async function deleteSuggestion() {
  if (!currentSuggestionId) return;

  if (!confirm('Are you sure you want to delete this suggestion?')) return;

  showLoading();

  try {
    const response = await fetch(`/api/suggestions/delete/${currentSuggestionId}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert('Suggestion deleted successfully');
      closeModal();
      loadDashboardData();
    } else {
      alert('Error deleting suggestion: ' + data.message);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Network error. Please try again.');
  }

  hideLoading();
}

// =====================================================
// FILTER BY AREA
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
  const areaButtons = document.querySelectorAll('.area-btn');
  areaButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      areaButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      loadSuggestionsByArea(this.dataset.area);
    });
  });

  // Search and filter in suggestions section
  const searchInput = document.getElementById('searchInput');
  const statusFilter = document.getElementById('statusFilter');

  if (searchInput) {
    searchInput.addEventListener('keyup', filterSuggestions);
  }
  if (statusFilter) {
    statusFilter.addEventListener('change', filterSuggestions);
  }
});

function filterSuggestions() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const statusFilter = document.getElementById('statusFilter').value;

  const filtered = allSuggestions.filter(suggestion => {
    const matchesSearch = suggestion.title.toLowerCase().includes(searchTerm) || 
                          suggestion.area.toLowerCase().includes(searchTerm);
    const matchesStatus = !statusFilter || suggestion.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  displaySuggestions(filtered);
}

// =====================================================
// LOGOUT
// =====================================================

async function logout() {
  try {
    const response = await fetch('/api/admin/logout', {
      method: 'POST'
    });

    if (response.ok) {
      window.location.href = '/';
    }
  } catch (error) {
    console.error('Error logging out:', error);
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getStatusClass(status) {
  return status.toLowerCase().replace(' ', '-');
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function showLoading() {
  document.getElementById('loadingSpinner').style.display = 'flex';
}

function hideLoading() {
  document.getElementById('loadingSpinner').style.display = 'none';
}

function updateCurrentTime() {
  const now = new Date();
  const timeString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  document.getElementById('currentTime').textContent = timeString;
}
