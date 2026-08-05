document.addEventListener('DOMContentLoaded', () => {
  initEduPage();
});

let allTests = [];
let allBatches = [];
let allStudents = [];
let parsedCSVRecords = [];
let currentRosterPage = 1;
const rosterItemsPerPage = 10;
let currentGradebookPage = 1;
const gradebookItemsPerPage = 10;
let gradebookFilteredRows = [];

async function initEduPage() {
  try {
    allBatches = await api.getBatches();
    allStudents = await api.getStudents();
    
    // Populate class and batch dropdowns
    await populateClassDropdowns();
    populateBatchesDropdowns();

    // Load tests
    await refreshTestsData();

    // Set selectors listeners
    setupSelectors();

    // Set roster keyboard navigation and auto progress updates
    setupRosterEvents();

    // Modal submit handler
    document.getElementById('new-test-form').addEventListener('submit', handleTestFormSubmit);

    // Initial table renders
    renderManageTests();
    renderGradebook();

    // Gradebook search listener
    document.getElementById('gradebook-search').addEventListener('input', renderGradebook);

    // Initialize custom selects on load
    if (window.initializeCustomSelects) {
      window.initializeCustomSelects();
    }

    // Watch for URL parameters (e.g. if arriving from dashboard quick actions)
    const urlParams = new URLSearchParams(window.location.search);
    const initialTab = urlParams.get('tab');
    if (initialTab) {
      switchEduTab(initialTab);
    }
  } catch (error) {
    console.error('Error initializing Educational Details page:', error);
  }
}

async function populateClassDropdowns() {
  const classSelect = document.getElementById('new-test-class');
  if (!classSelect) return;
  try {
    const classes = await api.getClasses();
    classSelect.innerHTML = '<option value="">Select Class...</option>' + 
      classes.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
  } catch (e) {
    console.error('Error loading classes:', e);
  }
}

function populateBatchesDropdowns() {
  const batchSelectors = [
    document.getElementById('marks-batch'),
    document.getElementById('new-test-batch'),
    document.getElementById('gradebook-batch')
  ];

  const optionsHTML = '<option value="">Select Batch...</option>' + 
    allBatches.map(b => `<option value="${b.name}">${b.name}</option>`).join('');

  batchSelectors.forEach(select => {
    if (select) {
      if (select.id === 'gradebook-batch') {
        select.innerHTML = '<option value="">All Batches</option>' + 
          allBatches.map(b => `<option value="${b.name}">${b.name}</option>`).join('');
      } else {
        select.innerHTML = optionsHTML;
      }
    }
  });

  if (window.initializeCustomSelects) {
    window.initializeCustomSelects();
  }
}

async function refreshTestsData() {
  allTests = await api.getTests();
}

window.handleNewTestClassChange = async () => {
  const classVal = document.getElementById('new-test-class').value;
  const container = document.getElementById('new-test-batch-container');
  
  if (!classVal) {
    container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">Please select a class first.</p>';
  } else {
    try {
      const batches = await api.getBatches();
      const filteredBatches = batches.filter(b => b.class === classVal);
      if (filteredBatches.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">No batches found for this class.</p>';
      } else {
        container.innerHTML = filteredBatches.map(b => `
          <label class="batch-pill-checkbox">
            <input type="checkbox" class="new-test-batch-cb" value="${b.name}" onchange="window.handleNewTestBatchChange()" style="display: none;">
            <span>${b.name}</span>
          </label>
        `).join('');
      }
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  }
  window.handleNewTestBatchChange(); // reset subjects
};

window.handleNewTestBatchChange = async () => {
  const checkboxes = document.querySelectorAll('.new-test-batch-cb:checked');
  const batchNames = Array.from(checkboxes).map(cb => cb.value);
  const singleGroup = document.getElementById('single-subject-group');
  const multiGroup = document.getElementById('multi-subject-group');
  const multiList = document.getElementById('multi-subject-list');
  
  if (batchNames.length === 0) {
    singleGroup.style.display = 'block';
    multiGroup.style.display = 'none';
    document.getElementById('new-test-subject').required = true;
    document.getElementById('new-test-max-marks').required = true;
    return;
  }
  
  try {
    const batches = await api.getBatches();
    const selectedBatches = batches.filter(b => batchNames.includes(b.name));
    
    let allSubjects = [];
    selectedBatches.forEach(b => {
      if (b.subjects && b.subjects.length > 0) {
        allSubjects.push(...b.subjects);
      }
    });
    allSubjects = [...new Set(allSubjects)]; // Unique subjects
    
    if (allSubjects.length > 0) {
      singleGroup.style.display = 'none';
      multiGroup.style.display = 'block';
      document.getElementById('new-test-subject').required = false;
      document.getElementById('new-test-max-marks').required = false;
      
      multiList.innerHTML = allSubjects.map((sub, idx) => `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 6px 0; border-bottom: 1px solid var(--border-color);">
          <label style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; cursor: pointer; user-select: none; color: var(--text-main);">
            <input type="checkbox" class="exam-subject-checkbox" value="${sub}" checked style="width: 16px; height: 16px; accent-color: var(--color-primary);">
            <span>${sub}</span>
          </label>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">Max:</span>
            <input type="number" class="form-control-compact exam-subject-max-marks" placeholder="Max Marks" value="100" min="1" max="1000" style="width: 80px; padding: 4px 8px;" required>
          </div>
        </div>
      `).join('');
    } else {
      singleGroup.style.display = 'block';
      multiGroup.style.display = 'none';
      document.getElementById('new-test-subject').required = true;
      document.getElementById('new-test-max-marks').required = true;
    }
  } catch (err) {
    console.error('Error fetching batch subjects:', err);
  }
};

function setupSelectors() {
  const batchSel = document.getElementById('marks-batch');
  const testSel = document.getElementById('marks-test');
  const subjectSel = document.getElementById('marks-subject');

  batchSel.addEventListener('change', () => {
    populateTestDropdown();
    loadRoster();
  });
  testSel.addEventListener('change', () => {
    // Only proceed if a valid test is selected from the datalist
    const testId = window.getSelectedTestId();
    if (testId) {
      populateSubjectDropdownFromTest();
      loadRoster();
    } else {
      document.getElementById('roster-container').innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;" id="roster-placeholder">Select Batch and Test to view students.</p>';
      document.getElementById('save-marks-container').style.display = 'none';
      if (document.getElementById('roster-actions-bar')) document.getElementById('roster-actions-bar').style.display = 'none';
    }
  });
  subjectSel.addEventListener('change', loadRoster);

  const newTestBatchSel = document.getElementById('new-test-batch');
  if (newTestBatchSel) {
    newTestBatchSel.addEventListener('change', window.handleNewTestBatchChange);
  }
}

window.getSelectedTestId = () => {
  const testSel = document.getElementById('marks-test');
  if (!testSel) return null;
  return testSel.value || null;
};

window.setTestInputValue = (testId) => {
  const testSel = document.getElementById('marks-test');
  if (!testSel || !testId) return;
  testSel.value = testId;
};

function populateTestDropdown() {
  const batchVal = document.getElementById('marks-batch').value;
  const testSel = document.getElementById('marks-test');
  const subjectSel = document.getElementById('marks-subject');

  if (!batchVal) {
    testSel.innerHTML = '<option value="">Select Test / Exam...</option>';
    testSel.disabled = true;
    subjectSel.innerHTML = '<option value="">Select Subject...</option>';
    subjectSel.disabled = true;
    if (window.initializeCustomSelects) window.initializeCustomSelects();
    return;
  } else {
    testSel.disabled = false;
  }

  // Filter tests matching Batch only
  const filtered = allTests.filter(t => {
    return Array.isArray(t.batch) ? t.batch.includes(batchVal) : t.batch === batchVal;
  });
  
  const optionsHtml = filtered.map(t => {
    const maxMarks = t.subjects ? t.subjects.reduce((sum, s) => sum + Number(s.maxMarks), 0) : t.maxMarks;
    return `<option value="${t._id}">${t.name} (${maxMarks} Marks)</option>`;
  }).join('');
  
  testSel.innerHTML = '<option value="">Select Test / Exam...</option>' + optionsHtml;
  
  // Reset subject dropdown
  subjectSel.innerHTML = '<option value="">Select Subject...</option>';
  
  if (window.initializeCustomSelects) {
    window.initializeCustomSelects();
  }
}

function populateSubjectDropdownFromTest() {
  const testId = window.getSelectedTestId();
  const subjectSel = document.getElementById('marks-subject');

  if (!testId) {
    subjectSel.innerHTML = '<option value="">Select Subject...</option>';
    subjectSel.disabled = true;
    if (window.initializeCustomSelects) window.initializeCustomSelects();
    return;
  } else {
    subjectSel.disabled = false;
  }

  const selectedTest = allTests.find(t => t._id === testId);
  if (!selectedTest) return;

  if (selectedTest.subjects && Array.isArray(selectedTest.subjects) && selectedTest.subjects.length > 0) {
    // It's a multi-subject exam. We just offer "All Subjects" so the user can see/upload marks for all at once.
    subjectSel.innerHTML = `<option value="ALL">All Subjects (Multi-Subject Exam)</option>`;
    subjectSel.value = "ALL";
  } else if (selectedTest.subject) {
    // Single subject exam
    subjectSel.innerHTML = `<option value="">Select Subject...</option><option value="${selectedTest.subject}">${selectedTest.subject}</option>`;
    subjectSel.value = selectedTest.subject; // Auto-select single subject
  } else {
    subjectSel.innerHTML = '<option value="">Select Subject...</option>';
  }
  
  if (window.initializeCustomSelects) window.initializeCustomSelects();
}

async function loadRoster() {
  const batchVal = document.getElementById('marks-batch').value;
  const testId = window.getSelectedTestId();
  const rosterContainer = document.getElementById('roster-container');
  const saveContainer = document.getElementById('save-marks-container');
  const maxMarksBadge = document.getElementById('max-marks-badge');
  const actionsBar = document.getElementById('roster-actions-bar');

  if (!batchVal || !testId) {
    rosterContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;" id="roster-placeholder">Select Batch and Test to view students.</p>';
    saveContainer.style.display = 'none';
    if (actionsBar) actionsBar.style.display = 'none';
    return;
  }

  // Load selected test
  let test;
  try {
    test = await api.getTest(testId);
  } catch (err) {
    console.error(err);
    return;
  }

  const totalMax = test.subjects ? test.subjects.reduce((sum, s) => sum + Number(s.maxMarks), 0) : test.maxMarks;
  if (maxMarksBadge) {
    maxMarksBadge.textContent = `Max Marks: ${totalMax}`;
  }

  // Filter students enrolled in this Batch
  const filteredStudents = allStudents.filter(s => s.batch === batchVal);

  if (filteredStudents.length === 0) {
    rosterContainer.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 40px;">No students enrolled in this Batch.</p>';
    saveContainer.style.display = 'none';
    if (actionsBar) actionsBar.style.display = 'none';
    return;
  }

  if (actionsBar) {
    actionsBar.style.display = 'flex';
  }

  rosterContainer.innerHTML = filteredStudents.map(s => {
    // Check if score exists
    const record = test.records ? test.records.find(r => r.studentId === s._id) : null;
    const scoreVal = record ? record.marks : '';
    const remarkVal = record ? record.remarks : '';

    let marksInputsHTML = '';
    if (test.subjects && Array.isArray(test.subjects)) {
      marksInputsHTML = test.subjects.map(sub => {
        const subScore = (record && record.marks && record.marks[sub.name] !== undefined) ? record.marks[sub.name] : '';
        return `
          <div class="marks-input-col" style="display: flex; flex-direction: column; min-width: 90px; background: var(--bg-body); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color);">
            <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted); display: block; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${sub.name}">${sub.name}</span>
            <div style="display: flex; align-items: center; gap: 4px;">
              <input type="number" class="form-control-compact student-score-input" data-subject="${sub.name}" min="0" max="${sub.maxMarks}" placeholder="Marks" value="${subScore}" style="width: 100%; padding: 6px 8px;" required>
              <span class="max-marks-label" style="font-size: 0.75rem;">/${sub.maxMarks}</span>
            </div>
          </div>
        `;
      }).join('');
    } else {
      marksInputsHTML = `
        <div class="marks-input-col" style="display: flex; align-items: center; gap: 8px; background: var(--bg-body); padding: 10px 12px; border-radius: 8px; border: 1px solid var(--border-color);">
          <span style="font-size: 0.75rem; font-weight: 600; color: var(--text-muted);">Marks:</span>
          <input type="number" class="form-control-compact student-score-input" min="0" max="${test.maxMarks}" placeholder="Marks" value="${scoreVal}" style="width: 80px;" required>
          <span class="max-marks-label">/ ${test.maxMarks}</span>
        </div>
      `;
    }

    return `
      <div class="student-marks-row" data-student-id="${s._id}" style="display: flex; flex-direction: column; gap: 16px; align-items: stretch; padding: 20px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap;">
          <div class="student-info-col" style="flex: unset;">
            <div class="student-avatar-small">${s.name.charAt(0)}</div>
            <div>
              <h4 style="margin: 0; font-size: 1rem; color: var(--text-main);">${s.name}</h4>
              <span style="font-size: 0.8rem; color: var(--text-muted);">${s.studentId}</span>
            </div>
          </div>
          <div class="remarks-input-col" style="flex: 1; min-width: 250px; max-width: 400px; margin-left: auto;">
            <input type="text" class="form-control-compact student-remark-input" placeholder="Remark / Comment (Optional)" value="${remarkVal}">
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 12px; background: var(--bg-body); padding: 16px; border-radius: 8px; border: 1px solid var(--border-color);">
          ${marksInputsHTML}
        </div>
      </div>
    `;
  }).join('');

  saveContainer.style.display = 'flex';
  updateRosterProgress();
  
  // Clear search input if exists
  const searchInput = document.getElementById('roster-search-input');
  if (searchInput) {
    searchInput.value = '';
  }

  currentRosterPage = 1;
  window.updateRosterPagination();
}

window.filterRoster = () => {
  const query = document.getElementById('roster-search-input').value.toLowerCase();
  const rows = document.querySelectorAll('.student-marks-row');
  
  rows.forEach(row => {
    const name = row.querySelector('h4').textContent.toLowerCase();
    const id = row.querySelector('span:nth-child(2)').textContent.toLowerCase();
    
    if (name.includes(query) || id.includes(query)) {
      row.classList.remove('hidden-by-search');
    } else {
      row.classList.add('hidden-by-search');
    }
  });

  currentRosterPage = 1;
  window.updateRosterPagination();
};

function updateRosterProgress() {
  const rows = document.querySelectorAll('.student-marks-row');
  let filled = 0;
  rows.forEach(row => {
    const scoreInputs = row.querySelectorAll('.student-score-input');
    let rowFilled = true;
    scoreInputs.forEach(input => {
      if (input.value.trim() === '') {
        rowFilled = false;
      }
    });
    if (scoreInputs.length > 0 && rowFilled) {
      filled++;
    }
  });
  const total = rows.length;
  const progressText = document.getElementById('roster-progress-text');
  if (progressText) {
    progressText.textContent = `${filled} / ${total} Entered`;
  }
}

window.updateRosterPagination = () => {
  const allRows = document.querySelectorAll('.student-marks-row');
  const visibleRows = Array.from(allRows).filter(r => !r.classList.contains('hidden-by-search'));
  const totalItems = visibleRows.length;
  const totalPages = Math.ceil(totalItems / rosterItemsPerPage) || 1;
  
  if (currentRosterPage > totalPages) currentRosterPage = totalPages;
  if (currentRosterPage < 1) currentRosterPage = 1;
  
  const startIndex = (currentRosterPage - 1) * rosterItemsPerPage;
  const endIndex = Math.min(startIndex + rosterItemsPerPage, totalItems);
  
  allRows.forEach(row => {
    row.style.display = 'none';
  });
  
  for (let i = startIndex; i < endIndex; i++) {
    visibleRows[i].style.display = 'flex';
  }
  
  const paginationContainer = document.getElementById('roster-pagination-container');
  if (totalItems > 0 && paginationContainer) {
    paginationContainer.style.display = 'flex';
    document.getElementById('roster-pagination-info').textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`;
    
    let buttonsHTML = `<button class="page-btn" onclick="goToRosterPage(${currentRosterPage - 1})" ${currentRosterPage === 1 ? 'disabled' : ''}><i class="fa-solid fa-angle-left"></i></button>`;
    
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentRosterPage - 1 && p <= currentRosterPage + 1)) {
        buttonsHTML += `<button class="page-btn ${p === currentRosterPage ? 'active' : ''}" onclick="goToRosterPage(${p})">${p}</button>`;
      } else if (p === currentRosterPage - 2 || p === currentRosterPage + 2) {
        buttonsHTML += `<span style="color: var(--text-muted); align-self: end; margin: 0 4px;">...</span>`;
      }
    }
    
    buttonsHTML += `<button class="page-btn" onclick="goToRosterPage(${currentRosterPage + 1})" ${currentRosterPage === totalPages ? 'disabled' : ''}><i class="fa-solid fa-angle-right"></i></button>`;
    
    document.getElementById('roster-pagination-controls').innerHTML = buttonsHTML;
  } else if (paginationContainer) {
    paginationContainer.style.display = 'none';
  }
};

window.goToRosterPage = (page) => {
  currentRosterPage = page;
  window.updateRosterPagination();
  const titleEl = document.getElementById('roster-title');
  if (titleEl) titleEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

function setupRosterEvents() {
  const container = document.getElementById('roster-container');
  if (!container) return;
  
  // Listen for changes to update progress pill
  container.addEventListener('input', (e) => {
    if (e.target.classList.contains('student-score-input')) {
      updateRosterProgress();
    }
  });
  
  // Keyboard navigation
  container.addEventListener('keydown', (e) => {
    if (e.target.classList.contains('student-score-input') || e.target.classList.contains('student-remark-input')) {
      const currentInput = e.target;
      const isScore = currentInput.classList.contains('student-score-input');
      const currentRow = currentInput.closest('.student-marks-row');
      if (!currentRow) return;
      
      const rows = Array.from(document.querySelectorAll('.student-marks-row'));
      const currentIndex = rows.indexOf(currentRow);
      
      if (e.key === 'ArrowDown' || (e.key === 'Enter' && isScore)) {
        e.preventDefault();
        const nextRow = rows[currentIndex + 1];
        if (nextRow) {
          const nextInput = isScore ? nextRow.querySelector('.student-score-input') : nextRow.querySelector('.student-remark-input');
          if (nextInput) nextInput.focus();
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prevRow = rows[currentIndex - 1];
        if (prevRow) {
          const prevInput = isScore ? prevRow.querySelector('.student-score-input') : prevRow.querySelector('.student-remark-input');
          if (prevInput) prevInput.focus();
        }
      }
    }
  });
}

window.quickFillZero = () => {
  const rows = document.querySelectorAll('.student-marks-row');
  let count = 0;
  rows.forEach(row => {
    const inputs = row.querySelectorAll('.student-score-input');
    inputs.forEach(input => {
      if (input && input.value.trim() === '') {
        input.value = 0;
        input.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
        setTimeout(() => { input.style.backgroundColor = ''; }, 1000);
        count++;
      }
    });
  });
  updateRosterProgress();
  if (count > 0) {
    alert(`Filled ${count} empty mark fields with 0.`);
  } else {
    alert("All student marks are already filled.");
  }
};

window.clearAllRosterMarks = () => {
  if (confirm("Are you sure you want to clear all score and remark fields in the current list? This won't save until you click 'Save Student Marks'.")) {
    const rows = document.querySelectorAll('.student-marks-row');
    rows.forEach(row => {
      row.querySelectorAll('.student-score-input').forEach(i => i.value = '');
      row.querySelector('.student-remark-input').value = '';
    });
    updateRosterProgress();
  }
};

window.downloadCSVTemplate = () => {
  const batchVal = document.getElementById('marks-batch').value;
  const subjectVal = document.getElementById('marks-subject').value;
  const testSel = document.getElementById('marks-test');
  const testId = window.getSelectedTestId();
  if (!batchVal || !testId) {
    alert("Please select a test first.");
    return;
  }
  const test = allTests.find(t => t._id === testId);
  const testName = test ? test.name : "Test";
  const isMultiSubject = test && test.subjects && Array.isArray(test.subjects);
  
  const filteredStudents = allStudents.filter(s => s.batch === batchVal);
  
  // Build CSV header
  let csvHeader = "Student ID,Student Name";
  if (isMultiSubject) {
    test.subjects.forEach(sub => {
      csvHeader += `,"${sub.name} (Max: ${sub.maxMarks})"`;
    });
  } else {
    csvHeader += ",Marks";
  }
  csvHeader += ",Remarks\n";
  let csvContent = csvHeader;
  
  filteredStudents.forEach(s => {
    const rowEl = document.querySelector(`.student-marks-row[data-student-id="${s._id}"]`);
    let remarkVal = "";
    if (rowEl) {
      remarkVal = rowEl.querySelector('.student-remark-input').value;
    }
    const escapedRemarks = remarkVal.replace(/"/g, '""');
    let rowLine = `"${s.studentId}","${s.name.replace(/"/g, '""')}"`;
    
    if (isMultiSubject) {
      test.subjects.forEach(sub => {
        let scoreVal = "";
        if (rowEl) {
          const input = rowEl.querySelector(`.student-score-input[data-subject="${sub.name}"]`);
          if (input) scoreVal = input.value;
        }
        rowLine += `,"${scoreVal}"`;
      });
    } else {
      let scoreVal = "";
      if (rowEl) scoreVal = rowEl.querySelector('.student-score-input').value;
      rowLine += `,"${scoreVal}"`;
    }
    rowLine += `,"${escapedRemarks}"\n`;
    csvContent += rowLine;
  });
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${batchVal}_${testName.replace(/[^a-z0-9]/gi, '_')}_Template.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

window.handleCSVUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    parseAndApplyCSV(text);
    event.target.value = '';
  };
  reader.readAsText(file);
};

function parseAndApplyCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i+1];
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push("");
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      lines.push(row);
      row = [""];
    } else {
      row[row.length - 1] += char;
    }
  }
  if (row.length > 1 || row[0] !== "") {
    lines.push(row);
  }
  
  if (lines.length < 2) {
    alert("Invalid CSV format. File is empty or missing headers.");
    return;
  }
  
  const headers = lines[0].map(h => h.trim().toLowerCase());
  const idIdx = headers.indexOf("student id");
  const remarksIdx = headers.indexOf("remarks");
  
  const testId = window.getSelectedTestId();
  const test = allTests.find(t => t._id === testId);
  const isMultiSubject = test && test.subjects && Array.isArray(test.subjects);
  
  // For multi-subject, find column indices for each subject
  let subjectColMap = {};
  if (isMultiSubject) {
    test.subjects.forEach(sub => {
      const searchName = sub.name.toLowerCase();
      const colIdx = headers.findIndex(h => h.startsWith(searchName));
      if (colIdx !== -1) {
        subjectColMap[sub.name] = { colIdx, maxMarks: sub.maxMarks };
      }
    });
    if (Object.keys(subjectColMap).length === 0) {
      alert("CSV headers do not match any subject names. Please use the downloaded template.");
      return;
    }
  } else {
    const marksIdx = headers.indexOf("marks");
    if (idIdx === -1 || marksIdx === -1) {
      alert("CSV must contain 'Student ID' and 'Marks' columns.");
      return;
    }
    subjectColMap = { _single: { colIdx: marksIdx, maxMarks: Number(test.maxMarks) } };
  }
  
  if (idIdx === -1) {
    alert("CSV must contain a 'Student ID' column.");
    return;
  }
  
  
  parsedCSVRecords = [];
  const rowsData = lines.slice(1);
  
  rowsData.forEach((row, idx) => {
    if (row.length < 2 || (row.length === 1 && row[0] === "")) return;
    
    const studentIdVal = row[idIdx] ? row[idIdx].trim() : "";
    const remarksVal = remarksIdx !== -1 && row[remarksIdx] ? row[remarksIdx].trim() : "";
    
    if (!studentIdVal) return;
    
    let recordObj = {
      rowIndex: idx + 2,
      studentId: studentIdVal,
      remarks: remarksVal,
      marks: {},
      isValid: true,
      errors: [],
      matchedStudent: null
    };
    
    const student = allStudents.find(s => s.studentId.toLowerCase() === studentIdVal.toLowerCase());
    if (!student) {
      recordObj.isValid = false;
      recordObj.errors.push(`Student ID '${studentIdVal}' not found.`);
    } else {
      recordObj.matchedStudent = student;
      const rowEl = document.querySelector(`.student-marks-row[data-student-id="${student._id}"]`);
      if (!rowEl) {
        recordObj.isValid = false;
        recordObj.errors.push(`Student '${student.name}' is not in the current roster.`);
      }
    }
    
    for (const [subName, info] of Object.entries(subjectColMap)) {
      const marksVal = row[info.colIdx] ? row[info.colIdx].trim() : "";
      if (marksVal !== "") {
        const parsedMarks = Number(marksVal);
        if (isNaN(parsedMarks) || parsedMarks < 0 || parsedMarks > info.maxMarks) {
          recordObj.isValid = false;
          recordObj.errors.push(`Invalid marks for ${subName !== '_single' ? subName : 'subject'} (Max: ${info.maxMarks}).`);
        }
        recordObj.marks[subName] = marksVal;
      }
    }
    
    parsedCSVRecords.push(recordObj);
  });
  
  renderCSVPreview(subjectColMap);
}

function renderCSVPreview(subjectColMap) {
  const section = document.getElementById('csv-preview-section');
  const thead = document.getElementById('csv-preview-thead');
  const tbody = document.getElementById('csv-preview-tbody');
  
  section.style.display = 'block';
  
  let headerHtml = '<tr><th>Row</th><th>Student ID</th>';
  for (const subName of Object.keys(subjectColMap)) {
    headerHtml += `<th>${subName === '_single' ? 'Marks' : subName}</th>`;
  }
  headerHtml += '<th>Status / Errors</th></tr>';
  thead.innerHTML = headerHtml;
  
  let bodyHtml = '';
  parsedCSVRecords.forEach(rec => {
    const trStyle = rec.isValid ? '' : 'background: rgba(239, 68, 68, 0.05); border-left: 3px solid #ef4444;';
    let rowHtml = `<tr style="${trStyle}">
      <td>${rec.rowIndex}</td>
      <td><strong>${rec.studentId}</strong>${rec.matchedStudent ? `<br><span style="font-size: 0.8rem; color: var(--text-muted);">${rec.matchedStudent.name}</span>` : ''}</td>`;
    
    for (const subName of Object.keys(subjectColMap)) {
      const val = rec.marks[subName] !== undefined ? rec.marks[subName] : '-';
      rowHtml += `<td>${val}</td>`;
    }
    
    if (rec.isValid) {
      rowHtml += `<td><span style="color: #10b981; font-weight: 600;"><i class="fa-solid fa-check"></i> Valid</span></td>`;
    } else {
      rowHtml += `<td><div style="color: #ef4444; font-size: 0.85rem;">${rec.errors.join('<br>')}</div></td>`;
    }
    
    rowHtml += '</tr>';
    bodyHtml += rowHtml;
  });
  
  tbody.innerHTML = bodyHtml;
}

window.applyCSVToRoster = () => {
  let successCount = 0;
  
  parsedCSVRecords.forEach(rec => {
    if (!rec.isValid || !rec.matchedStudent) return;
    
    const rowEl = document.querySelector(`.student-marks-row[data-student-id="${rec.matchedStudent._id}"]`);
    if (!rowEl) return;
    
    for (const [subName, marksVal] of Object.entries(rec.marks)) {
      let scoreInput;
      if (subName === '_single') {
        scoreInput = rowEl.querySelector('.student-score-input');
      } else {
        scoreInput = rowEl.querySelector(`.student-score-input[data-subject="${subName}"]`);
      }
      if (scoreInput && marksVal !== "") {
        scoreInput.value = marksVal;
        scoreInput.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        setTimeout(() => { scoreInput.style.backgroundColor = ''; }, 2000);
      }
    }
    
    if (rec.remarks) {
      const remarkInput = rowEl.querySelector('.student-remark-input');
      if (remarkInput) {
        remarkInput.value = rec.remarks;
        remarkInput.style.backgroundColor = 'rgba(16, 185, 129, 0.1)';
        setTimeout(() => { remarkInput.style.backgroundColor = ''; }, 2000);
      }
    }
    
    successCount++;
  });
  
  updateRosterProgress();
  closeCSVUploadModal();
  alert(`Successfully applied ${successCount} valid rows to the roster.`);
};

window.openCSVUploadModal = () => {
  document.getElementById('csv-upload-modal').classList.add('active');
  document.getElementById('csv-preview-section').style.display = 'none';
  parsedCSVRecords = [];
};

window.closeCSVUploadModal = () => {
  document.getElementById('csv-upload-modal').classList.remove('active');
  const fileInput = document.getElementById('csv-file-input');
  if (fileInput) fileInput.value = '';
};


window.resetRoster = () => {
  loadRoster();
};

window.saveRosterMarks = async () => {
  const testId = window.getSelectedTestId();
  if (!testId) return;

  const rows = document.querySelectorAll('.student-marks-row');
  const records = [];
  let hasError = false;

  const test = allTests.find(t => t._id === testId);
  const isMultiSubject = test.subjects && Array.isArray(test.subjects);

  rows.forEach(row => {
    if (hasError) return;
    const studentId = row.getAttribute('data-student-id');
    const remarkInput = row.querySelector('.student-remark-input');
    const remarks = remarkInput.value.trim();

    if (isMultiSubject) {
      const marksMap = {};
      const scoreInputs = row.querySelectorAll('.student-score-input');
      scoreInputs.forEach(input => {
        const subjectName = input.getAttribute('data-subject');
        const max = Number(input.max);
        const val = input.value.trim() === '' ? 0 : Number(input.value);
        if (val < 0 || val > max) {
          alert(`Invalid score for subject "${subjectName}". Marks must be between 0 and ${max}.`);
          input.focus();
          hasError = true;
          return;
        }
        marksMap[subjectName] = val;
      });
      if (!hasError) {
        records.push({ studentId, marks: marksMap, remarks });
      }
    } else {
      const scoreInput = row.querySelector('.student-score-input');
      const max = Number(test.maxMarks);
      const marks = scoreInput.value.trim() === '' ? 0 : Number(scoreInput.value);
      if (marks < 0 || marks > max) {
        alert(`Invalid score for student. Marks must be between 0 and ${max}.`);
        scoreInput.focus();
        hasError = true;
        return;
      }
      records.push({ studentId, marks, remarks });
    }
  });

  if (hasError) return;

  try {
    test.records = records;
    await api.saveTest(test);
    alert('Student marks saved successfully!');
    
    // Refresh tables
    await refreshTestsData();
    renderManageTests();
    renderGradebook();
  } catch (err) {
    alert('Failed to save marks: ' + err.message);
  }
};

// Tabs switching
window.switchEduTab = (tabName) => {
  const tabs = document.querySelectorAll('.edu-tab-btn');
  tabs.forEach(t => t.classList.remove('active'));

  const panels = document.querySelectorAll('.tab-panel');
  panels.forEach(p => p.classList.remove('active'));

  if (tabName === 'enter-marks') {
    tabs[0].classList.add('active');
    document.getElementById('tab-enter-marks').classList.add('active');
  } else if (tabName === 'manage-tests') {
    tabs[1].classList.add('active');
    document.getElementById('tab-manage-tests').classList.add('active');
    renderManageTests();
  } else if (tabName === 'gradebook') {
    tabs[2].classList.add('active');
    document.getElementById('tab-gradebook').classList.add('active');
    renderGradebook();
  }
};

// Manage Tests Tab
function renderManageTests() {
  const tbody = document.getElementById('tests-table-body');
  if (!tbody) return;

  const searchInput = document.getElementById('manage-tests-search');
  const query = searchInput ? searchInput.value.toLowerCase() : '';

  const filteredTests = allTests.filter(t => {
    if (!query) return true;
    
    // Check name, class, batch
    if (t.name && t.name.toLowerCase().includes(query)) return true;
    if (t.class && t.class.toLowerCase().includes(query)) return true;
    if (t.batch && t.batch.toLowerCase().includes(query)) return true;
    
    // Check subjects
    if (t.subjects && Array.isArray(t.subjects)) {
      return t.subjects.some(s => s.name.toLowerCase().includes(query));
    } else if (t.subject) {
      return t.subject.toLowerCase().includes(query);
    }
    
    return false;
  });

  if (filteredTests.length === 0) {
    if (query) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">No tests match your search query.</td></tr>';
    } else {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">No tests scheduled. Create a new test profile above.</td></tr>';
    }
    return;
  }

  tbody.innerHTML = filteredTests.map(t => {
    const isMultiSubject = t.subjects && Array.isArray(t.subjects);
    
    // Calculate subject display and total max marks
    let subjectDisplay = '';
    let totalMaxMarks = 0;
    if (isMultiSubject) {
      const subjectsToShow = t.subjects.slice(0, 10);
      const extraCount = t.subjects.length - 10;
      
      subjectDisplay = subjectsToShow.map(s => `<span class="badge" style="display: inline-block; background: var(--bg-hover); color: var(--text-main); font-size: 0.8rem; margin: 3px; padding: 6px 12px; border-radius: 12px; font-weight: 600; border: 1px solid var(--border-color);">${s.name} (${s.maxMarks})</span>`).join(' ');
      
      if (extraCount > 0) {
        subjectDisplay += ` <span class="badge" style="display: inline-block; background: var(--color-primary); color: #ffffff; font-size: 0.8rem; margin: 3px; padding: 6px 12px; border-radius: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">+${extraCount} More</span>`;
      }
      
      totalMaxMarks = t.subjects.reduce((sum, s) => sum + Number(s.maxMarks), 0);
    } else {
      subjectDisplay = `<span class="badge" style="display: inline-block; background: var(--bg-hover); color: var(--text-main); font-size: 0.8rem; margin: 3px; padding: 6px 12px; border-radius: 12px; font-weight: 600; border: 1px solid var(--border-color);">${t.subject || 'N/A'}</span>`;
      totalMaxMarks = Number(t.maxMarks) || 0;
    }

    // Calculate average class marks
    let classAvgText = 'N/A';
    if (t.records && t.records.length > 0) {
      if (isMultiSubject) {
        let totalObtained = 0;
        let totalMax = 0;
        t.records.forEach(r => {
          t.subjects.forEach(sub => {
            totalObtained += (r.marks && r.marks[sub.name] !== undefined) ? Number(r.marks[sub.name]) : 0;
            totalMax += Number(sub.maxMarks);
          });
        });
        classAvgText = totalMax > 0 ? ((totalObtained / totalMax) * 100).toFixed(1) + '%' : 'N/A';
      } else {
        const sum = t.records.reduce((acc, r) => acc + Number(r.marks), 0);
        classAvgText = ((sum / t.records.length) / t.maxMarks * 100).toFixed(1) + '%';
      }
    }

    return `
      <tr style="transition: all 0.2s ease;">
        <td style="font-weight: 600; color: var(--text-main);">${t.name}</td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 4px; align-items: flex-start;">
            <span class="badge" style="font-size: 0.75rem; background: rgba(245, 158, 11, 0.1); color: #d97706; padding: 4px 8px; border-radius: 8px;">${t.class}</span>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 500;">${t.batch}</span>
          </div>
        </td>
        <td><div style="display: flex; flex-wrap: wrap; gap: 4px; max-width: 250px;">${subjectDisplay}</div></td>
        <td><strong style="color: var(--text-main);">${totalMaxMarks}</strong></td>
        <td style="color: var(--text-muted); font-weight: 500;">${new Date(t.date).toLocaleDateString()}</td>
        <td style="color: var(--color-primary); font-weight: 700; font-size: 0.95rem;">${classAvgText}</td>
        <td>
          <div style="display: flex; gap: 8px; align-items: center;">
            <button class="btn" style="padding: 6px 14px; font-size: 0.8rem; border-radius: 20px; background: rgba(43, 90, 246, 0.1); color: var(--color-primary); border: 1px solid rgba(43, 90, 246, 0.2); font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='var(--color-primary)'; this.style.color='#fff';" onmouseout="this.style.background='rgba(43, 90, 246, 0.1)'; this.style.color='var(--color-primary)';" onclick="editTest('${t._id}')">
              <i class="fa-solid fa-pen-to-square"></i> Enter Marks
            </button>
            <button class="btn" style="padding: 6px 12px; font-size: 0.85rem; border-radius: 20px; background: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.1); transition: all 0.2s;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff';" onmouseout="this.style.background='rgba(239, 68, 68, 0.1)'; this.style.color='#ef4444';" onclick="deleteTestRecord('${t._id}')" title="Delete Test">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.editTest = async (id) => {
  const t = allTests.find(x => x._id === id);
  if (!t) return;

  document.getElementById('marks-batch').value = t.batch;
  
  // Re-populate batches selection, then set batch
  document.getElementById('marks-batch').value = t.batch;
  
  // Set subject - use first subject for multi-subject tests
  if (t.subjects && Array.isArray(t.subjects) && t.subjects.length > 0) {
    document.getElementById('marks-subject').value = t.subjects[0].name;
  } else {
    document.getElementById('marks-subject').value = t.subject;
  }
  
  // Re-populate test dropdown
  populateTestDropdown();
  window.setTestInputValue(t._id);
  
  // Load roster
  loadRoster();

  // Switch to Enter Marks tab
  switchEduTab('enter-marks');
};

window.deleteTestRecord = (id) => {
  document.getElementById('delete-test-id').value = id;
  document.getElementById('delete-confirm-modal').classList.add('active');
};

window.closeDeleteConfirmModal = () => {
  document.getElementById('delete-confirm-modal').classList.remove('active');
  document.getElementById('delete-test-id').value = '';
};

window.confirmDeleteTest = async () => {
  const id = document.getElementById('delete-test-id').value;
  if (!id) return;
  
  const btn = document.getElementById('confirm-delete-test-btn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';
  
  try {
    await api.deleteTest(id);
    
    closeDeleteConfirmModal();
    // Reset button
    btn.disabled = false;
    btn.textContent = 'Delete';
    
    await refreshTestsData();
    renderManageTests();
    renderGradebook();
  } catch (err) {
    alert('Failed to delete test: ' + err.message);
    btn.disabled = false;
    btn.textContent = 'Delete';
  }
};

// Gradebook Tab
async function renderGradebook() {
  const tbody = document.getElementById('gradebook-table-body');
  if (!tbody) return;

  const searchVal = document.getElementById('gradebook-search').value.toLowerCase();
  const batchVal = document.getElementById('gradebook-batch') ? document.getElementById('gradebook-batch').value : '';
  const rows = [];

  for (const s of allStudents) {
    if (batchVal && s.batch !== batchVal) {
      continue;
    }
    if (searchVal && !s.name.toLowerCase().includes(searchVal) && !s.studentId.toLowerCase().includes(searchVal)) {
      continue;
    }

    const performance = await api.getStudentPerformance(s._id);
    rows.push({
      student: s,
      testsTaken: performance.testsTaken,
      averagePercentage: performance.averagePercentage
    });
  }

  gradebookFilteredRows = rows;
  currentGradebookPage = 1;
  window.updateGradebookPagination();
}

window.updateGradebookPagination = () => {
  const tbody = document.getElementById('gradebook-table-body');
  if (!tbody) return;
  
  const totalItems = gradebookFilteredRows.length;
  const totalPages = Math.ceil(totalItems / gradebookItemsPerPage) || 1;
  
  if (currentGradebookPage > totalPages) currentGradebookPage = totalPages;
  if (currentGradebookPage < 1) currentGradebookPage = 1;
  
  const startIndex = (currentGradebookPage - 1) * gradebookItemsPerPage;
  const endIndex = Math.min(startIndex + gradebookItemsPerPage, totalItems);
  
  const paginatedRows = gradebookFilteredRows.slice(startIndex, endIndex);

  if (totalItems === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No students found.</td></tr>';
    const paginationContainer = document.getElementById('gradebook-pagination-container');
    if (paginationContainer) paginationContainer.style.display = 'none';
    return;
  }

  tbody.innerHTML = paginatedRows.map(r => {
    const s = r.student;
    let colorClass = 'color: #ef4444;'; // < 50%
    if (r.averagePercentage >= 75) {
      colorClass = 'color: #10b981;'; // >= 75%
    } else if (r.averagePercentage >= 50) {
      colorClass = 'color: #f59e0b;'; // 50% - 74%
    }

    return `
      <tr>
        <td style="font-weight: 600;">${s.name}</td>
        <td>${s.studentId}</td>
        <td>${s.class}</td>
        <td>${s.batch}</td>
        <td>${r.testsTaken}</td>
        <td style="${colorClass} font-weight: 700; font-size: 1rem;">${r.averagePercentage}%</td>
        <td>
          <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="window.location.href='student-profile.html?id=${s._id}'">
            <i class="fa-solid fa-user"></i> View Profile
          </button>
        </td>
      </tr>
    `;
  }).join('');
  
  const paginationContainer = document.getElementById('gradebook-pagination-container');
  if (paginationContainer) {
    paginationContainer.style.display = 'flex';
    document.getElementById('gradebook-pagination-info').textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} entries`;
    
    let buttonsHTML = `<button class="page-btn" onclick="goToGradebookPage(${currentGradebookPage - 1})" ${currentGradebookPage === 1 ? 'disabled' : ''}><i class="fa-solid fa-angle-left"></i></button>`;
    
    for (let p = 1; p <= totalPages; p++) {
      if (p === 1 || p === totalPages || (p >= currentGradebookPage - 1 && p <= currentGradebookPage + 1)) {
        buttonsHTML += `<button class="page-btn ${p === currentGradebookPage ? 'active' : ''}" onclick="goToGradebookPage(${p})">${p}</button>`;
      } else if (p === currentGradebookPage - 2 || p === currentGradebookPage + 2) {
        buttonsHTML += `<span style="color: var(--text-muted); align-self: end; margin: 0 4px;">...</span>`;
      }
    }
    
    buttonsHTML += `<button class="page-btn" onclick="goToGradebookPage(${currentGradebookPage + 1})" ${currentGradebookPage === totalPages ? 'disabled' : ''}><i class="fa-solid fa-angle-right"></i></button>`;
    
    document.getElementById('gradebook-pagination-controls').innerHTML = buttonsHTML;
  }
};

window.goToGradebookPage = (page) => {
  currentGradebookPage = page;
  window.updateGradebookPagination();
};

// Modal handling
window.openNewTestModal = () => {
  // Set default date to today
  document.getElementById('new-test-date').value = new Date().toISOString().substring(0, 10);
  
  // Set modal fields based on active selections in the selector grid
  const currentBatch = document.getElementById('marks-batch').value;
  
  // Set title
  document.getElementById('modal-title').textContent = "Create Test Profile";
  document.getElementById('save-test-btn').textContent = "Create Profile";
  document.getElementById('modal-test-id').value = '';

  // Reset single/multi subject groups to defaults
  const singleGroup = document.getElementById('single-subject-group');
  const multiGroup = document.getElementById('multi-subject-group');
  if (singleGroup) singleGroup.style.display = 'block';
  if (multiGroup) multiGroup.style.display = 'none';
  document.getElementById('new-test-subject').required = true;
  document.getElementById('new-test-max-marks').required = true;
  
  document.getElementById('new-test-modal').classList.add('active');
  
  // Initialize custom select styling
  if (window.initializeCustomSelects) {
    window.initializeCustomSelects();
  }

  // Pre-fill batches based on class, then check current batch
  window.handleNewTestClassChange().then(() => {
    if (currentBatch) {
      const cb = document.querySelector(`.new-test-batch-cb[value="${currentBatch}"]`);
      if (cb) {
        cb.checked = true;
        window.handleNewTestBatchChange();
      }
    }
  });
};

window.closeNewTestModal = () => {
  document.getElementById('new-test-modal').classList.remove('active');
  document.getElementById('new-test-form').reset();
  document.getElementById('modal-test-id').value = '';
  // Reset subject groups
  const singleGroup = document.getElementById('single-subject-group');
  const multiGroup = document.getElementById('multi-subject-group');
  if (singleGroup) singleGroup.style.display = 'block';
  if (multiGroup) multiGroup.style.display = 'none';
};

async function handleTestFormSubmit(e) {
  e.preventDefault();

  const id = document.getElementById('modal-test-id').value;
  const name = document.getElementById('new-test-name').value;
  const className = document.getElementById('new-test-class').value;
  const checkboxes = document.querySelectorAll('.new-test-batch-cb:checked');
  const batch = Array.from(checkboxes).map(cb => cb.value);
  const date = document.getElementById('new-test-date').value;

  // Determine if multi-subject mode is active
  const multiGroup = document.getElementById('multi-subject-group');
  const isMultiSubject = multiGroup && multiGroup.style.display !== 'none';

  let testData;

  if (isMultiSubject) {
    // Gather checked subjects and their max marks
    const checkboxes = document.querySelectorAll('.exam-subject-checkbox');
    const maxInputs = document.querySelectorAll('.exam-subject-max-marks');
    const subjects = [];
    checkboxes.forEach((cb, idx) => {
      if (cb.checked) {
        const subName = cb.value;
        const subMax = Number(maxInputs[idx].value) || 100;
        subjects.push({ name: subName, maxMarks: subMax });
      }
    });

    if (subjects.length === 0) {
      alert('Please select at least one subject for this exam.');
      return;
    }

    testData = {
      name,
      class: className,
      batch,
      subjects,
      date,
      records: []
    };
  } else {
    const subject = document.getElementById('new-test-subject').value;
    const maxMarks = Number(document.getElementById('new-test-max-marks').value);
    
    if (!subject) {
      alert('Please select a subject.');
      return;
    }
    if (!maxMarks || maxMarks <= 0) {
      alert('Please enter valid max marks.');
      return;
    }

    testData = {
      name,
      class: className,
      batch,
      subject,
      maxMarks,
      date,
      records: []
    };
  }

  if (id) {
    testData._id = id;
    // Retain existing records if updating
    const existing = allTests.find(t => t._id === id);
    if (existing) {
      testData.records = existing.records;
    }
  }

  try {
    const saved = await api.saveTest(testData);
    alert(id ? 'Test profile updated successfully!' : 'Test profile created successfully!');
    closeNewTestModal();

    // Refresh and sync selections
    await refreshTestsData();
    
    // Auto-select the newly created test in Enter Marks
    document.getElementById('marks-batch').value = saved.batch;
    if (saved.subject) {
      document.getElementById('marks-subject').value = saved.subject;
    } else if (saved.subjects && saved.subjects.length > 0) {
      document.getElementById('marks-subject').value = saved.subjects[0].name;
    }
    populateTestDropdown();
    window.setTestInputValue(saved._id);
    
    loadRoster();
    renderManageTests();
    renderGradebook();
  } catch (err) {
    alert('Failed to save test: ' + err.message);
  }
}
