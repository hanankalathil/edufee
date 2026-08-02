document.addEventListener('DOMContentLoaded', () => {
  // Set Admin display name
  const user = api.getUser();
  if (user) {
    document.getElementById('admin-display-name').textContent = user.name;
  }

  fetchDashboardData();
  initCommandPalette();
});

async function fetchDashboardData() {
  try {
    const data = await api.getDashboardStats();

    // Set metrics
    document.getElementById('stat-total-students').textContent = data.metrics.totalStudents;
    document.getElementById('stat-total-collections').textContent = `₹${data.metrics.totalCollections.toLocaleString('en-IN')}`;
    document.getElementById('stat-pending-fees').textContent = `₹${data.metrics.pendingFees.toLocaleString('en-IN')}`;
    document.getElementById('stat-overdue-fees').textContent = `₹${data.metrics.overdueFees.toLocaleString('en-IN')}`;

    // Render Recent Payments
    renderRecentPayments(data.recentPayments);

    // Render Chart
    renderChart(data.revenueChart);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
  }
}

function renderRecentPayments(payments) {
  const tbody = document.getElementById('recent-payments-table');
  if (!tbody) return;

  if (!payments || payments.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--text-muted);">No payment records found.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = payments.map(p => `
    <tr>
      <td style="font-weight: 600;">${p.studentName}</td>
      <td>${p.billingPeriod.includes('Monthly') ? 'Monthly Fee' : p.billingPeriod}</td>
      <td>${p.billingPeriod}</td>
      <td style="color: #10b981; font-weight: 600;">₹${p.amountPaid}</td>
      <td>${new Date(p.paymentDate).toLocaleDateString()}</td>
      <td><span class="badge" style="background: rgba(37, 99, 235, 0.08); color: var(--color-primary);">${p.paymentMethod}</span></td>
      <td>
        <button class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="api.downloadReceipt('${p.feeId}', '${p._id}')">
          <i class="fa-solid fa-download"></i> Receipt
        </button>
      </td>
    </tr>
  `).join('');
}

let myChart = null;
function renderChart(chartData) {
  const ctx = document.getElementById('revenueChart');
  if (!ctx) return;

  if (myChart) {
    myChart.destroy();
  }

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

  // Create gradient fill
  const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
  gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.labels.length > 0 ? chartData.labels : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Monthly Revenue',
        data: chartData.data.length > 0 ? chartData.data : [0, 0, 0, 0, 0, 0],
        borderColor: '#2563eb',
        backgroundColor: gradient,
        tension: 0.4,
        fill: true,
        borderWidth: 3,
        pointBackgroundColor: isDark ? '#1e293b' : '#ffffff',
        pointBorderColor: '#2563eb',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? '#0f172a' : '#ffffff',
          titleColor: isDark ? '#f1f5f9' : '#0f172a',
          bodyColor: isDark ? '#cbd5e1' : '#475569',
          borderColor: isDark ? '#334155' : '#e2e8f0',
          borderWidth: 1,
          padding: 12,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return '₹' + context.parsed.y.toLocaleString();
            }
          }
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          grid: {
            color: gridColor,
            borderDash: [5, 5],
            drawBorder: false,
          },
          ticks: {
            color: textColor,
            font: {
              family: 'Plus Jakarta Sans'
            },
            padding: 10
          }
        },
        y: {
          grid: {
            color: gridColor,
            borderDash: [5, 5],
            drawBorder: false,
          },
          ticks: {
            color: textColor,
            font: {
              family: 'Plus Jakarta Sans'
            },
            padding: 10,
            callback: function(value) {
              return '₹' + value.toLocaleString();
            }
          }
        }
      }
    }
  });
}

// Command Palette Logic
function initCommandPalette() {
  const searchContainer = document.querySelector('.search-container');
  const searchInputTop = document.querySelector('.search-input');
  const cpOverlay = document.getElementById('command-palette');
  const cpInput = document.getElementById('cp-input');
  const cpTags = document.querySelectorAll('.cp-tag');
  const cpItems = document.querySelectorAll('.cp-item');
  const cpCount = document.querySelector('.cp-count');

  if (!cpOverlay || !searchContainer) return;

  function openCP() {
    cpOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => cpInput.focus(), 100);
  }

  function closeCP() {
    cpOverlay.classList.remove('active');
    document.body.style.overflow = '';
    cpInput.value = '';
    filterItems();
  }

  searchContainer.addEventListener('click', openCP);
  searchInputTop.addEventListener('focus', openCP);

  cpOverlay.addEventListener('click', (e) => {
    if (e.target === cpOverlay) closeCP();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && cpOverlay.classList.contains('active')) {
      closeCP();
    }
    
    // Keyboard Navigation
    if (cpOverlay.classList.contains('active')) {
      const activeItems = Array.from(cpItems).filter(item => item.style.display !== 'none');
      const currentIndex = activeItems.findIndex(item => item.classList.contains('active'));
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentIndex < activeItems.length - 1) {
          if (currentIndex >= 0) activeItems[currentIndex].classList.remove('active');
          activeItems[currentIndex + 1].classList.add('active');
          activeItems[currentIndex + 1].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentIndex > 0) {
          activeItems[currentIndex].classList.remove('active');
          activeItems[currentIndex - 1].classList.add('active');
          activeItems[currentIndex - 1].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (currentIndex >= 0) {
          activeItems[currentIndex].click();
        }
      }
    }
  });

  cpInput.addEventListener('input', filterItems);

  cpTags.forEach(tag => {
    tag.addEventListener('click', () => {
      cpTags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');
      filterItems();
    });
  });

  function filterItems() {
    const query = cpInput.value.toLowerCase();
    const activeTag = document.querySelector('.cp-tag.active').textContent.toLowerCase();
    let count = 0;
    
    let firstVisible = true;

    cpItems.forEach(item => {
      item.classList.remove('active');
      const title = item.querySelector('.cp-item-title').textContent.toLowerCase();
      const desc = item.querySelector('.cp-item-desc').textContent.toLowerCase();
      const tags = item.getAttribute('data-tags');

      const matchesQuery = title.includes(query) || desc.includes(query);
      const matchesTag = tags.includes(activeTag) || activeTag === 'all';

      if (matchesQuery && matchesTag) {
        item.style.display = 'flex';
        count++;
        if (firstVisible) {
          item.classList.add('active');
          firstVisible = false;
        }
      } else {
        item.style.display = 'none';
      }
    });

    if (cpCount) cpCount.textContent = count;
  }
}

