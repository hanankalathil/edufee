document.addEventListener('DOMContentLoaded', async () => {
  // Set default date in date picker to today
  document.getElementById('att-date').value = new Date().toISOString().substring(0, 10);
  
  // Load batches dynamically
  const batchSelect = document.getElementById('att-batch');
  if (batchSelect) {
    try {
      const batches = await api.getBatches();
      batchSelect.innerHTML = batches.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
      
      if (window.initializeCustomSelects) {
        window.initializeCustomSelects();
      }
    } catch (error) {
      console.error('Error loading batches in attendance page:', error);
    }
  }
});

function loadStudentsRedirect() {
  const date = document.getElementById('att-date').value;
  const className = document.getElementById('att-class').value;
  const batch = document.getElementById('att-batch').value;

  if (!date || !className || !batch) {
    alert('Please complete all selection fields.');
    return;
  }

  // Redirect to mark-attendance-list.html
  window.location.href = `mark-attendance-list.html?class=${encodeURIComponent(className)}&batch=${encodeURIComponent(batch)}&date=${encodeURIComponent(date)}`;
}
