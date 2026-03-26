// =====================================================
// MAIN FORM SUBMISSION SCRIPT
// =====================================================

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('suggestionForm');
  const imageInput = document.getElementById('image');
  const filePreview = document.getElementById('filePreview');
  const successMessage = document.getElementById('successMessage');
  const errorMessage = document.getElementById('errorMessage');

  // Load statistics
  loadStatistics();

  // File preview
  imageInput.addEventListener('change', function() {
    if (this.files.length > 0) {
      const file = this.files[0];
      const fileSize = (file.size / (1024 * 1024)).toFixed(2);
      
      filePreview.innerHTML = `
        <p><strong>${file.name}</strong> (${fileSize} MB)</p>
      `;
      filePreview.classList.add('show');
    } else {
      filePreview.classList.remove('show');
    }
  });

  // Form submission
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    // Clear previous messages
    successMessage.style.display = 'none';
    errorMessage.style.display = 'none';
    clearErrors();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare form data
    const formData = new FormData(form);

    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoader.style.display = 'inline-block';

    try {
      const response = await fetch('/api/suggestions/submit', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Show success message
        document.getElementById('successText').textContent = data.message;
        successMessage.style.display = 'block';
        
        // Reset form
        form.reset();
        filePreview.classList.remove('show');

        // Redirect after 2 seconds
        setTimeout(() => {
          window.location.href = '/confirmation';
        }, 2000);
      } else {
        showError(data.message || 'Error submitting suggestion');
      }
    } catch (error) {
      console.error('Error:', error);
      showError('Network error. Please try again.');
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      btnText.style.display = 'inline-block';
      btnLoader.style.display = 'none';
    }
  });

  // Form validation
  function validateForm() {
    const title = document.getElementById('title').value.trim();
    const message = document.getElementById('message').value.trim();
    const area = document.getElementById('area').value;
    const wing = document.getElementById('wing').value;
    let isValid = true;

    if (!title) {
      showFieldError('title', 'Title is required');
      isValid = false;
    } else if (title.length < 5) {
      showFieldError('title', 'Title must be at least 5 characters');
      isValid = false;
    }

    if (!message) {
      showFieldError('message', 'Message is required');
      isValid = false;
    } else if (message.length < 10) {
      showFieldError('message', 'Message must be at least 10 characters');
      isValid = false;
    }

    if (!area) {
      showFieldError('area', 'Please select an area');
      isValid = false;
    }

    if (!wing) {
      showFieldError('wing', 'Please select a wing');
      isValid = false;
    }

    // Validate image if selected
    if (document.getElementById('image').files.length > 0) {
      const file = document.getElementById('image').files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (file.size > maxSize) {
        showFieldError('image', 'File size must be less than 5MB');
        isValid = false;
      }
    }

    return isValid;
  }

  function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
    }
  }

  function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
      el.classList.remove('show');
      el.textContent = '';
    });
  }

  function showError(message) {
    document.getElementById('errorText').textContent = message;
    errorMessage.classList.add('show');
    errorMessage.style.display = 'block';
  }

  // Load and display statistics
  async function loadStatistics() {
    try {
      const response = await fetch('/api/suggestions/stats');
      const stats = await response.json();

      document.getElementById('totalSuggestions').textContent = stats.total;
      document.getElementById('resolvedSuggestions').textContent = stats.resolved;
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }
});
