document.addEventListener('DOMContentLoaded', () => {
    // Tab Switching Logic
    const tabs = document.querySelectorAll('.wa-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.style.display = 'none');

            // Add active class to clicked tab
            tab.classList.add('active');
            const target = tab.getAttribute('data-target');
            document.getElementById(target).style.display = 'block';
        });
    });

    // Initial setup
    if(tabs.length > 0) {
        tabs[0].click();
    }

    // Template Selection and Preview Logic
    const templates = [
        {
            id: 'attendance_report',
            name: 'Attendance Report',
            content: '*Attendance Report*\nDate: {{Date}}\nClass: {{Class}}\nBatch: {{Batch}}\n-----------------\nTotal Students: 30\nPresent: 28 (93%)\nAbsent: 2\n\n*Absentees:* John, Doe'
        },
        {
            id: 'general_reminder',
            name: 'General Reminder',
            content: 'Hello {{ParentName}},\n\nThis is a reminder from {{TuitionCenter}}.\n\nStudent: {{StudentName}}\nClass: {{Class}}\n\nPlease review your recent updates on the portal.\n\nThank you.'
        }
    ];

    const templateSelect = document.getElementById('template-select');
    const chatPreviewText = document.getElementById('chat-preview-text');
    const previewTime = document.getElementById('preview-time');

    if(templateSelect && chatPreviewText) {
        // Populate templates
        templates.forEach(t => {
            const option = document.createElement('option');
            option.value = t.id;
            option.textContent = t.name;
            templateSelect.appendChild(option);
        });

        // Apply universal custom styling to the dropdown after population
        if (templateSelect.nextElementSibling && templateSelect.nextElementSibling.classList.contains('custom-select-container')) {
            templateSelect.nextElementSibling.remove();
            templateSelect.style.display = '';
        }
        if (window.initializeCustomSelects) {
            window.initializeCustomSelects();
        }

        // Set current time for preview
        const now = new Date();
        previewTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        templateSelect.addEventListener('change', updatePreview);
        
        // Setup mock inputs for variables to make preview interactive
        const inputs = document.querySelectorAll('.mock-variable-input');
        inputs.forEach(input => input.addEventListener('input', updatePreview));

        function updatePreview() {
            const selectedId = templateSelect.value;
            const template = templates.find(t => t.id === selectedId);
            
            if(template) {
                let text = template.content;
                const parentName = document.getElementById('mock-parent-name')?.value || 'Mr. Sharma';
                const studentName = document.getElementById('mock-student-name')?.value || 'Rahul';
                const className = document.getElementById('mock-class')?.value || 'Class 10';
                const batch = document.getElementById('mock-batch')?.value || 'Morning A';
                const date = new Date().toLocaleDateString();
                
                text = text.replace(/{{ParentName}}/g, parentName);
                text = text.replace(/{{StudentName}}/g, studentName);
                text = text.replace(/{{Class}}/g, className);
                text = text.replace(/{{Batch}}/g, batch);
                text = text.replace(/{{TuitionCenter}}/g, 'Techora Academy');
                text = text.replace(/{{Date}}/g, date);

                // Preserve line breaks
                chatPreviewText.innerHTML = text.replace(/\n/g, '<br>');
            } else {
                chatPreviewText.innerHTML = 'Select a template to preview...';
            }
        }
        
        // Initial preview
        updatePreview();
    }

    // Simulate sending messages
    const sendBtn = document.getElementById('send-message-btn');
    const progressContainer = document.getElementById('send-progress-container');
    const progressBar = document.getElementById('send-progress-bar');
    const progressText = document.getElementById('send-progress-text');

    if(sendBtn) {
        sendBtn.addEventListener('click', () => {
            const selectedStudentsCount = document.querySelectorAll('.student-checkbox:checked').length || 1;
            
            if(templateSelect.value === "") {
                alert("Please select a template first.");
                return;
            }

            sendBtn.disabled = true;
            progressContainer.style.display = 'block';
            let current = 0;
            
            progressText.textContent = `Sending 0 of ${selectedStudentsCount}...`;

            const interval = setInterval(() => {
                current++;
                const percentage = (current / selectedStudentsCount) * 100;
                progressBar.style.width = `${percentage}%`;
                progressText.textContent = `Sending ${current} of ${selectedStudentsCount}...`;

                if(current >= selectedStudentsCount) {
                    clearInterval(interval);
                    setTimeout(() => {
                        alert("Messages sent successfully!");
                        progressContainer.style.display = 'none';
                        progressBar.style.width = '0%';
                        sendBtn.disabled = false;
                        sendBtn.innerHTML = 'Send Message';
                        
                        // Increment dashboard counter if we are on dashboard tab
                        const sentStat = document.getElementById('stat-messages-sent');
                        if(sentStat) {
                            sentStat.textContent = parseInt(sentStat.textContent) + selectedStudentsCount;
                        }
                    }, 500);
                }
            }, 800); // simulate delay per message
        });
    }

    // --- Send Tab Functionality ---
    async function initSendTab() {
        try {
            const batchesList = await api.getBatches();
            const targetSelect = document.getElementById('target-audience-select');
            if (targetSelect && batchesList.length > 0) {
                const batchOptions = batchesList.map(b => `<option value="${b._id}">Batch: ${b.name} (${b.class || 'No Class'})</option>`).join('');
                targetSelect.innerHTML += batchOptions;
                targetSelect.innerHTML += '<option value="individual">Individual Student...</option>';
                
                // Re-initialize custom select styling for target-audience-select
                if (targetSelect.nextElementSibling && targetSelect.nextElementSibling.classList.contains('custom-select-container')) {
                    targetSelect.nextElementSibling.remove();
                    targetSelect.style.display = '';
                }
                if (window.initializeCustomSelects) {
                    window.initializeCustomSelects();
                }

                // Automatically update the Class/Batch test variable when target audience is changed
                targetSelect.addEventListener('change', () => {
                    const selectedVal = targetSelect.value;
                    const mockClassInput = document.getElementById('mock-class');
                    if (mockClassInput && selectedVal !== 'all' && selectedVal !== 'individual') {
                        const batch = batchesList.find(b => b._id === selectedVal);
                        if (batch) {
                            mockClassInput.value = `${batch.class || 'No Class'} - ${batch.name}`;
                            // Trigger preview update
                            mockClassInput.dispatchEvent(new Event('input'));
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error loading batches for Send tab:', error);
        }
    }
    initSendTab();

    // --- Templates Tab Functionality ---
    async function initTemplatesTab() {
        try {
            const batchesList = await api.getBatches();
            let timetableSettings = await api.getTimetableSettings();
            timetableSettings.batches = timetableSettings.batches || {};

            const attBatchSelect = document.getElementById('att-batch-select');
            const attFieldsDiv = document.getElementById('att-batch-settings-fields');
            const attNoBatchesDiv = document.getElementById('att-batch-no-batches');
            
            if (batchesList.length === 0) {
              if (attBatchSelect) attBatchSelect.innerHTML = '<option value="">No batches available</option>';
              if (attFieldsDiv) attFieldsDiv.style.display = 'none';
              if (attNoBatchesDiv) attNoBatchesDiv.style.display = 'block';
            } else {
              if (attBatchSelect) {
                  attBatchSelect.innerHTML = batchesList.map(b => `<option value="${b._id}">${b.name} (${b.class || 'No Class'})</option>`).join('');
              }
              if (attFieldsDiv) attFieldsDiv.style.display = 'flex';
              if (attNoBatchesDiv) attNoBatchesDiv.style.display = 'none';
              
              window.onAttBatchChanged = () => {
                const batchId = attBatchSelect.value;
                const bSettings = timetableSettings.batches[batchId] || {};
                const defaultTemplate = `*Attendance Report*\nDate: {{date}}\nClass: {{class}}\nBatch: {{batch}}\n---------------------\nTotal Students: {{total}}\nPresent: {{present}} ({{presentPercent}}%)\nAbsent: {{absent}}\n\n*Absentees:* {{absentsList}}`;
                document.getElementById('att-template-text').value = bSettings.attendanceTemplate || defaultTemplate;
              };
              
              if (attBatchSelect) window.onAttBatchChanged();
            }

            // Variable Badge Click Logic
            const templateArea = document.getElementById('template-text');
            const variables = document.querySelectorAll('.template-editor .variable-badge');
            
            variables.forEach(badge => {
              badge.addEventListener('click', () => {
                const start = templateArea.selectionStart;
                const end = templateArea.selectionEnd;
                const text = templateArea.value;
                const placeholder = badge.getAttribute('data-var');
                
                templateArea.value = text.substring(0, start) + placeholder + text.substring(end);
                templateArea.focus();
                templateArea.setSelectionRange(start + placeholder.length, start + placeholder.length);
              });
            });

            const attTemplateArea = document.getElementById('att-template-text');
            const groupVariables = document.querySelectorAll('.group-var');
            
            groupVariables.forEach(badge => {
              badge.addEventListener('click', () => {
                if (!attTemplateArea) return;
                const start = attTemplateArea.selectionStart;
                const end = attTemplateArea.selectionEnd;
                const text = attTemplateArea.value;
                const placeholder = badge.getAttribute('data-var');
                
                attTemplateArea.value = text.substring(0, start) + placeholder + text.substring(end);
                attTemplateArea.focus();
                attTemplateArea.setSelectionRange(start + placeholder.length, start + placeholder.length);
              });
            });

            // Re-initialize custom selects for dynamically added options
            if (attBatchSelect && attBatchSelect.nextElementSibling && attBatchSelect.nextElementSibling.classList.contains('custom-select-container')) {
              attBatchSelect.nextElementSibling.remove();
              attBatchSelect.style.display = '';
            }
            if (window.initializeCustomSelects) {
              window.initializeCustomSelects();
            }

        } catch (error) {
            console.error('Error loading template settings:', error);
        }
    }

    initTemplatesTab();

    window.saveAttTemplateSettings = async () => {
        const batchSelect = document.getElementById('att-batch-select');
        if (!batchSelect || !batchSelect.value) {
            alert("No batch selected.");
            return;
        }
        const batchId = batchSelect.value;
        const template = document.getElementById('att-template-text').value;

        try {
            const currentSettings = await api.getTimetableSettings();
            currentSettings.batches = currentSettings.batches || {};
            currentSettings.batches[batchId] = currentSettings.batches[batchId] || {};
            currentSettings.batches[batchId].attendanceTemplate = template;

            await api.saveTimetableSettings(currentSettings);
            alert("Attendance template for this batch saved successfully!");
        } catch (error) {
            alert("Failed to save template: " + error.message);
        }
    };

    window.saveSettings = async () => {
        // Mock save logic for Message Template Editor
        alert("Message Template configurations saved successfully!");
    };
});
