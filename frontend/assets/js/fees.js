document.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;

  if (currentPath.endsWith('fees.html')) {
    initFeesPage();
  }

  if (currentPath.endsWith('fee-history.html')) {
    initFeeHistoryPage();
  }
});

/* ==========================================
   1. FEES BILLING & INVOICES
   ========================================== */
async function initFeesPage() {
  const searchInput = document.getElementById('fees-search');
  const paymentForm = document.getElementById('payment-form');
  
  let currentPage = 1;
  const pageSize = 10;

  // Load and render invoices
  const render = async () => {
    const invoices = await api.getFees({
      search: searchInput ? searchInput.value : ''
    });
    
    // Sort: Unpaid first, then Partial, then Paid
    const statusOrder = { 'Unpaid': 1, 'Partial': 2, 'Paid': 3 };
    invoices.sort((a, b) => {
      const orderA = statusOrder[a.status] || 99;
      const orderB = statusOrder[b.status] || 99;
      return orderA - orderB;
    });
    
    const totalEntries = invoices.length;
    const totalPages = Math.ceil(totalEntries / pageSize) || 1;
    
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalEntries);
    const pageInvoices = invoices.slice(startIndex, endIndex);

    renderInvoicesTable(pageInvoices);
    
    renderPagination(
      currentPage,
      totalPages,
      totalEntries === 0 ? 0 : startIndex + 1,
      endIndex,
      totalEntries,
      (newPage) => {
        currentPage = newPage;
        render();
      }
    );
  };

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentPage = 1;
      render();
    });
  }

  // Initial render
  render();

  // Payment Form Submit
  if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const feeId = document.getElementById('modal-fee-id').value;
      const paymentData = {
        amountPaid: document.getElementById('amountPaid').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        transactionId: '',
        remarks: document.getElementById('remarks').value
      };

      try {
        const { payment } = await api.collectPayment(feeId, paymentData);
        await alert('Payment posted successfully.');
        closePaymentModal();
        render();

        // Optional: download receipt immediately
        if (await confirm('Do you want to download/print the receipt?')) {
          api.downloadReceipt(feeId, payment._id);
        }
      } catch (error) {
        await alert('Error posting payment: ' + error.message);
      }
    });
  }

  // Dynamic remaining balance update
  const amountPaidInput = document.getElementById('amountPaid');
  if (amountPaidInput) {
    amountPaidInput.addEventListener('input', () => {
      if (window.updateRemainingBalance) {
        window.updateRemainingBalance();
      }
    });
    amountPaidInput.addEventListener('change', () => {
      if (window.updateRemainingBalance) {
        window.updateRemainingBalance();
      }
    });
  }
  
  // Custom Dropdown for Fee Type
  const feeTypeInput = document.getElementById('bulkFeeType');
  const customDropdown = document.getElementById('customFeeTypeDropdown');
  if (feeTypeInput && customDropdown) {
    const dropdownItems = customDropdown.querySelectorAll('.dropdown-item');

    feeTypeInput.addEventListener('focus', () => {
      customDropdown.classList.add('show');
    });

    feeTypeInput.addEventListener('input', () => {
      const filter = feeTypeInput.value.toLowerCase();
      let hasVisible = false;
      dropdownItems.forEach(item => {
        if (item.textContent.toLowerCase().includes(filter)) {
          item.style.display = 'block';
          hasVisible = true;
        } else {
          item.style.display = 'none';
        }
      });
      if (hasVisible) {
        customDropdown.classList.add('show');
      } else {
        customDropdown.classList.remove('show');
      }
    });

    // Handle selection
    dropdownItems.forEach(item => {
      item.addEventListener('mousedown', (e) => {
        // use mousedown to fire before input blur
        feeTypeInput.value = item.textContent;
        customDropdown.classList.remove('show');
      });
    });

    feeTypeInput.addEventListener('blur', () => {
      customDropdown.classList.remove('show');
    });
  }

  // Issue Fee Form Submit
  const issueFeeForm = document.getElementById('issue-fee-form');
  if (issueFeeForm) {
    issueFeeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const feeData = {
        feeType: document.getElementById('bulkFeeType').value,
        billingPeriod: 'N/A', // Removed from UI
        totalAmount: document.getElementById('bulkTotalAmount').value,
        dueDate: document.getElementById('bulkDueDate').value,
        discount: 0,
        fine: 0
      };
      
      const filters = {
        batch: document.getElementById('bulkBatch').value
      };

      try {
        await api.issueBulkFees(filters, feeData);
        await alert('Fees issued successfully to all matching students.');
        closeIssueFeeModal();
        render();
      } catch (error) {
        await alert('Error issuing fees: ' + error.message);
      }
    });
  }

}

window.openIssueFeeModal = async () => {
  const modal = document.getElementById('issue-fee-modal');
  const batchSelect = document.getElementById('bulkBatch');
  
  if (batchSelect) {
    batchSelect.innerHTML = '<option value="All Batches">All Batches (Everyone)</option>';
    try {
      const batches = await api.getBatches();
      batches.forEach(b => {
        const opt = document.createElement('option');
        opt.value = b.name;
        opt.textContent = `${b.name} (${b.class})`;
        batchSelect.appendChild(opt);
      });
      if (window.initializeCustomSelects) {
        window.initializeCustomSelects();
      }
    } catch (e) {
      console.error('Failed to load batches', e);
    }
  }

  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
};

window.closeIssueFeeModal = () => {
  const modal = document.getElementById('issue-fee-modal');
  modal.classList.remove('active');
  setTimeout(() => {
    if (!modal.classList.contains('active')) {
      modal.style.display = 'none';
    }
  }, 250);
  document.getElementById('issue-fee-form').reset();
};

function renderPagination(currentPage, totalPages, displayStart, displayEnd, totalEntries, onPageChange, containerId = 'fees-pagination-container') {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (totalEntries === 0) {
    container.innerHTML = '';
    container.style.display = 'none';
    return;
  }

  container.style.display = 'flex';

  let buttonsHtml = '';
  
  // Previous button
  buttonsHtml += `
    <button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">
      <i class="fa-solid fa-chevron-left"></i>
    </button>
  `;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    buttonsHtml += `
      <button class="pagination-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>
    `;
  }

  // Next button
  buttonsHtml += `
    <button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">
      <i class="fa-solid fa-chevron-right"></i>
    </button>
  `;

  container.innerHTML = `
    <div class="pagination-info">
      Showing ${displayStart} to ${displayEnd} of ${totalEntries} entries
    </div>
    <div class="pagination-buttons">
      ${buttonsHtml}
    </div>
  `;

  // Attach event handlers
  container.querySelectorAll('.pagination-btn').forEach(btn => {
    btn.onclick = () => {
      const page = parseInt(btn.getAttribute('data-page'));
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        onPageChange(page);
      }
    };
  });
}

function renderInvoicesTable(invoices) {
  const tbody = document.getElementById('fees-table-body');
  if (!tbody) return;

  if (invoices.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No invoice records found.</td></tr>`;
    return;
  }

  tbody.innerHTML = invoices.map(f => {
    if (!f.student) return '';
    let statusClass = 'badge-unpaid';
    if (f.status === 'Paid') statusClass = 'badge-paid';
    if (f.status === 'Partial') statusClass = 'badge-partial';

    return `
      <tr>
        <td>
          <div style="font-weight: 600;">${f.student.name}</div>
          <span style="font-size: 0.75rem; color: var(--text-muted);">${f.student.studentId}</span>
        </td>
        <td>
          <span style="font-size: 0.85rem; font-weight: 500;">${f.feeType}</span>
        </td>
        <td style="font-weight: 600;">₹${f.netAmount}</td>
        <td style="font-weight: 600; color: ${f.dueAmount > 0 ? '#ef4444' : 'inherit'}">₹${f.dueAmount}</td>
        <td><span class="badge ${statusClass}">${f.status}</span></td>
        <td>
          <div class="table-actions">
            ${f.dueAmount > 0 ? `
              <button class="btn btn-pay" onclick="openPaymentModal('${f._id}', ${f.dueAmount})">Pay</button>
            ` : `
              <div class="pay-placeholder"></div>
            `}
            <button class="btn btn-receipt" onclick="api.downloadReceipt('${f._id}')">
              <i class="fa-solid fa-download"></i> Receipt
            </button>
            <button class="btn btn-whatsapp" onclick="shareInvoiceWhatsApp('${f._id}')">
              <i class="fa-brands fa-whatsapp"></i> Send
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.updateRemainingBalance = () => {
  const balanceDisplay = document.getElementById('modal-balance-display');
  const amountPaidInput = document.getElementById('amountPaid');
  const remainingDisplay = document.getElementById('modal-remaining-display');
  if (!balanceDisplay || !amountPaidInput || !remainingDisplay) return;

  const outstanding = Number(balanceDisplay.dataset.outstanding) || 0;
  const paidAmount = Number(amountPaidInput.value) || 0;
  const remaining = Math.max(0, outstanding - paidAmount);
  remainingDisplay.textContent = `₹${remaining.toLocaleString('en-IN')}`;
  
  if (remaining === 0) {
    remainingDisplay.style.color = '#22c55e'; // Green for fully paid
  } else if (remaining === outstanding) {
    remainingDisplay.style.color = '#ef4444'; // Red for unpaid/no payment entered
  } else {
    remainingDisplay.style.color = '#f97316'; // Orange for partial payment
  }
};

window.openPaymentModal = (feeId, dueAmount) => {
  const amount = Number(dueAmount) || 0;
  document.getElementById('modal-fee-id').value = feeId;
  const balanceDisplay = document.getElementById('modal-balance-display');
  balanceDisplay.textContent = `₹${amount.toLocaleString('en-IN')}`;
  balanceDisplay.dataset.outstanding = amount;
  
  document.getElementById('amountPaid').value = amount;
  document.getElementById('amountPaid').max = amount;
  
  window.updateRemainingBalance();
  
  const modal = document.getElementById('payment-modal');
  modal.style.display = 'flex';
  setTimeout(() => {
    modal.classList.add('active');
  }, 10);
};

window.closePaymentModal = () => {
  const modal = document.getElementById('payment-modal');
  modal.classList.remove('active');
  setTimeout(() => {
    if (!modal.classList.contains('active')) {
      modal.style.display = 'none';
    }
  }, 250);
  document.getElementById('payment-form').reset();
};


/* ==========================================
   2. FEE PAYMENT HISTORY AUDIT LOG
   ========================================== */
async function initFeeHistoryPage() {
  const searchInput = document.getElementById('txn-search');

  let currentPage = 1;
  const pageSize = 10;

  const render = async () => {
    const fees = await api.getFees({
      search: searchInput ? searchInput.value : ''
    });

    const recentPayments = [];
    fees.forEach(f => {
      if (!f.student) return;
      f.paymentHistory.forEach(p => {
        recentPayments.push({
          ...p,
          feeId: f._id,
          studentName: f.student.name,
          studentId: f.student.studentId,
          feeType: f.feeType,
          billingPeriod: f.billingPeriod
        });
      });
    });

    recentPayments.sort((a,b) => new Date(b.paymentDate) - new Date(a.paymentDate));
    
    const totalEntries = recentPayments.length;
    const totalPages = Math.ceil(totalEntries / pageSize) || 1;
    
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
    
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalEntries);
    const pagePayments = recentPayments.slice(startIndex, endIndex);

    renderAuditTable(pagePayments);
    
    renderPagination(
      currentPage,
      totalPages,
      totalEntries === 0 ? 0 : startIndex + 1,
      endIndex,
      totalEntries,
      (newPage) => {
        currentPage = newPage;
        render();
      },
      'audit-pagination-container'
    );
  };

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentPage = 1;
      render();
    });
  }
  render();
}

function renderAuditTable(payments) {
  const tbody = document.getElementById('audit-table-body');
  if (!tbody) return;

  if (payments.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">No transactions posted yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = payments.map(p => `
    <tr>
      <td>
        <div style="font-weight: 600;">${p.studentName}</div>
        <span style="font-size: 0.75rem; color: var(--text-muted);">${p.studentId}</span>
      </td>
      <td>${p.feeType}</td>
      <td>${p.billingPeriod}</td>
      <td style="color: #10b981; font-weight: 600;">₹${p.amountPaid}</td>
      <td>${new Date(p.paymentDate).toLocaleString()}</td>
      <td><span class="badge" style="background: rgba(37,99,235,0.05); color: var(--color-primary);">${p.paymentMethod}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-secondary" onclick="api.downloadReceipt('${p.feeId}', '${p._id}')">
            <i class="fa-solid fa-download"></i> Receipt
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

/* ==========================================
   3. WHATSAPP PDF GENERATION & SHARING
   ========================================== */
window.shareInvoiceWhatsApp = async (feeId) => {
  try {
    const fees = await api.getFees();
    const fee = fees.find(f => f._id === feeId);
    if (!fee) return alert('Invoice not found');
    const student = fee.student;
    if (!student) return alert('Student details not found');

    // Create a temporary element to render the receipt
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.innerHTML = generateReceiptHTML(fee, student);
    document.body.appendChild(tempDiv);

    // PDF configuration options
    const opt = {
      margin: 10,
      filename: `Invoice_${student.name.replace(/\s+/g, '_')}_${fee.billingPeriod.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Generate PDF Blob using html2pdf
    const worker = html2pdf().set(opt).from(tempDiv);
    const pdfBlob = await worker.output('blob');

    // Clean up temporary element
    document.body.removeChild(tempDiv);

    const fileName = `Invoice_${student.name.replace(/\s+/g, '_')}_${fee.billingPeriod.replace(/\s+/g, '_')}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    const whatsappNumber = student.whatsappNumber ? student.whatsappNumber.replace(/\D/g, '') : '';

    // Check if Web Share API is available and can share this file
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: `Invoice - ${student.name}`,
        text: `Dear Parent, please find attached the invoice for ${student.name} for ${fee.billingPeriod}.`
      });
    } else {
      // Fallback: Download the file and redirect to WhatsApp Web
      const downloadUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      // Tell user to drag the downloaded file into WhatsApp
      alert(`Invoice PDF "${fileName}" downloaded successfully.\n\nOpening WhatsApp. Please upload the downloaded PDF file to the chat.`);

      const textMessage = encodeURIComponent(`Dear Parent, please find attached the invoice for ${student.name} for ${fee.billingPeriod}.`);
      let waUrl = `https://api.whatsapp.com/send?text=${textMessage}`;
      if (whatsappNumber) {
        waUrl = `https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${textMessage}`;
      }
      window.open(waUrl, '_blank');
    }
  } catch (error) {
    console.error('Error generating and sharing PDF:', error);
    alert('Failed to generate or share PDF: ' + error.message);
  }
};

function generateReceiptHTML(fee, student) {
  let p = fee.paymentHistory[fee.paymentHistory.length - 1] || {
    paymentDate: new Date().toISOString(),
    transactionId: 'N/A',
    amountPaid: fee.paidAmount
  };
  
  return `
    <div style="font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; padding: 30px; background: #fff; border-radius: 12px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0;">
      <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 20px;">
        <div>
          <h2 style="color: #2563eb; font-family: 'Outfit', sans-serif; margin: 0 0 4px 0; font-weight: 800; font-size: 1.5rem;">Techora EduFee</h2>
          <p style="font-size: 0.8rem; color: #64748b; margin: 0;">Smart Education Management Platform</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 0;">techora.in</p>
        </div>
        <div style="text-align: right;">
          <h3 style="font-family: 'Outfit', sans-serif; margin: 0; font-weight: 700; font-size: 1.1rem;">PAYMENT RECEIPT</h3>
          <p style="font-size: 0.8rem; color: #64748b; margin: 4px 0 0 0;">Date: ${new Date(p.paymentDate).toLocaleDateString()}</p>
          <p style="font-size: 0.8rem; color: #64748b; margin: 2px 0 0 0;">Txn Ref: ${p.transactionId || 'N/A'}</p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
        <div>
          <h4 style="text-decoration: underline; font-size: 0.8rem; margin: 0 0 8px 0; color: #64748b; text-transform: uppercase;">Billed To:</h4>
          <p style="margin: 0 0 4px 0; font-size: 0.9rem;"><strong>${student.name}</strong></p>
          <p style="margin: 0 0 2px 0; font-size: 0.8rem; color: #475569;">Student ID: ${student.studentId}</p>
          <p style="margin: 0 0 2px 0; font-size: 0.8rem; color: #475569;">Class: ${student.class} | Batch: ${student.batch}</p>
          <p style="margin: 0; font-size: 0.8rem; color: #475569;">Parent: ${student.parentName}</p>
        </div>
        <div>
          <h4 style="text-decoration: underline; font-size: 0.8rem; margin: 0 0 8px 0; color: #64748b; text-transform: uppercase;">Invoice Details:</h4>
          <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: #475569;"><strong>Fee Type:</strong> ${fee.feeType}</p>
          <p style="margin: 0 0 4px 0; font-size: 0.85rem; color: #475569;"><strong>Billing Period:</strong> ${fee.billingPeriod}</p>
          <p style="margin: 0; font-size: 0.85rem; color: #475569;"><strong>Due Date:</strong> ${new Date(fee.dueDate).toLocaleDateString()}</p>
        </div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
        <thead>
          <tr style="background: #0f172a; color: #fff;">
            <th style="padding: 8px 10px; font-size: 0.8rem; text-align: left;">Description</th>
            <th style="padding: 8px 10px; font-size: 0.8rem; text-align: right;">Amount (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem;">Tuition Fees / Base Charges</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; text-align: right;">₹${fee.totalAmount.toFixed(2)}</td>
          </tr>
          ${fee.discount > 0 ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem;">Discounts / Scholarships (-)</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; text-align: right; color: #10b981;">₹${fee.discount.toFixed(2)}</td>
          </tr>
          ` : ''}
          ${fee.fine > 0 ? `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem;">Fines / Late Penalties (+)</td>
            <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 0.85rem; text-align: right; color: #ef4444;">₹${fee.fine.toFixed(2)}</td>
          </tr>
          ` : ''}
        </tbody>
      </table>

      <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 6px; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; width: 220px;">
          <span>Net Charges:</span>
          <span>₹${fee.netAmount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; width: 220px; color: #10b981; font-weight: 600;">
          <span>Amount Paid:</span>
          <span>₹${fee.paidAmount.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; width: 220px; border-top: 1px solid #e2e8f0; padding-top: 6px; font-weight: 700;">
          <span>Remaining Due:</span>
          <span style="color: #ef4444;">₹${fee.dueAmount.toFixed(2)}</span>
        </div>
      </div>

      <div style="margin-top: 30px; text-align: center; font-size: 0.7rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px;">
        <p style="margin: 0 0 4px 0;">This is a computer-generated transaction receipt and requires no signature.</p>
        <p style="margin: 0;">Thank you for using Techora EduFee.</p>
      </div>
    </div>
  `;
}

