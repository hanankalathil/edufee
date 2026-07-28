document.addEventListener('DOMContentLoaded', async () => {
  // Set default date in date picker to today
  document.getElementById('att-date').value = new Date().toISOString().substring(0, 10);
  
  // Load batches dynamically based on selected class
  const batchSelect = document.getElementById('att-batch');
  const classSelect = document.getElementById('att-class');
  const subjectSelect = document.getElementById('att-subject');

  async function updateBatches() {
    if (!batchSelect || !classSelect) return;
    try {
      const selectedClass = classSelect.value;
      const batches = await api.getBatches();
      
      // Filter batches associated with the selected class
      const filtered = batches.filter(b => {
        if (!b.class) return true;
        if (b.class === 'All Classes') return true;
        return b.class.split(',').map(c => c.trim()).includes(selectedClass);
      });
      
      let options = '';
      if (filtered.length > 1) {
        options += `<option value="All Batches">All Batches (Combined)</option>`;
      }
      options += filtered.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
      batchSelect.innerHTML = options || `<option value="">No batches for this class</option>`;
      
      if (filtered.length > 1) {
        batchSelect.value = "All Batches";
      } else if (filtered.length > 0) {
        batchSelect.value = filtered[0].name;
      }

      await updateSubjects();

      if (window.initializeCustomSelects) {
        window.initializeCustomSelects();
      }
    } catch (error) {
      console.error('Error loading batches in attendance page:', error);
    }
  }

  async function updateSubjects() {
    if (!subjectSelect || !batchSelect) return;
    try {
      const selectedBatch = batchSelect.value;
      if (!selectedBatch) {
        subjectSelect.innerHTML = `<option value="">Select Batch First</option>`;
        return;
      }

      const batches = await api.getBatches();
      let subjects = new Set();

      if (selectedBatch === 'All Batches') {
        const selectedClass = classSelect.value;
        const filtered = batches.filter(b => {
          if (!b.class || b.class === 'All Classes') return true;
          return b.class.split(',').map(c => c.trim()).includes(selectedClass);
        });
        filtered.forEach(b => {
          if (b.subjects) {
            b.subjects.forEach(s => subjects.add(s));
          }
        });
      } else {
        const batch = batches.find(b => b.name === selectedBatch);
        if (batch && batch.subjects) {
          batch.subjects.forEach(s => subjects.add(s));
        }
      }

      let options = '';
      if (subjects.size > 0) {
        options += `<option value="All Subjects">All Subjects</option>`;
        Array.from(subjects).forEach(s => {
          options += `<option value="${s}">${s}</option>`;
        });
      }
      subjectSelect.innerHTML = options || `<option value="">No subjects found</option>`;

      if (window.initializeCustomSelects) {
        window.initializeCustomSelects();
      }
    } catch (error) {
      console.error('Error loading subjects in attendance page:', error);
    }
  }

  if (classSelect) {
    classSelect.addEventListener('change', updateBatches);
  }
  if (batchSelect) {
    batchSelect.addEventListener('change', updateSubjects);
  }

  await updateBatches();
});

function loadStudentsRedirect() {
  const date = document.getElementById('att-date').value;
  const className = document.getElementById('att-class').value;
  const batch = document.getElementById('att-batch').value;
  const subjectSelect = document.getElementById('att-subject');
  const subject = subjectSelect ? subjectSelect.value : '';

  if (!date || !className || !batch) {
    alert('Please complete all selection fields.');
    return;
  }

  let url = `mark-attendance-list.html?class=${encodeURIComponent(className)}&batch=${encodeURIComponent(batch)}&date=${encodeURIComponent(date)}`;
  if (subject) {
    url += `&subject=${encodeURIComponent(subject)}`;
  }
  window.location.href = url;
}
