// ==========================================================================
// 1. STATE MANAGEMENT
// ==========================================================================
let token = localStorage.getItem('token');
let currentUser = JSON.parse(localStorage.getItem('user'));
let currentView = 'landing'; // 'landing', 'auth', 'dashboard'
let currentDashboardTab = ''; // e.g., 'pesanRuangan', 'bookingSaya' or 'overview'

// Initial load check
document.addEventListener('DOMContentLoaded', () => {
  setupNavbarScroll();
  setupMobileNav();
  setupScrollReveal();
  displayCurrentDate();
  
  if (token && currentUser) {
    applyRoleTheme(currentUser.role);
    navigateTo('dashboard');
  } else {
    navigateTo('landing');
  }
});

// Scroll reveal via IntersectionObserver
function setupScrollReveal() {
  const revealEls = document.querySelectorAll('.glass-box-card, .section-title-wrap, .hero-badge, .hero-content h1, .hero-description, .hero-actions, .hero-visual');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach(el => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
    }
    obs.observe(el);
  });
}


function setupMobileNav() {
  const navToggle = document.getElementById('mobileNavToggle');
  const navbar = document.getElementById('floatingNavbar');
  const navLinks = document.querySelectorAll('.nav-menu a');
  const authButtons = document.querySelectorAll('.nav-buttons .btn');

  if (!navToggle || !navbar) return;

  navToggle.addEventListener('click', () => {
    const isOpen = navbar.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navbar.classList.contains('nav-open')) {
        navbar.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  authButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (navbar.classList.contains('nav-open')) {
        navbar.classList.remove('nav-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && navbar.classList.contains('nav-open')) {
      navbar.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
}


// Display date in dashboard header
function displayCurrentDate() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', options);
  const el = document.getElementById('currentDateDisplay');
  if (el) el.textContent = dateStr;
}

// Navbar scrolled class toggle
function setupNavbarScroll() {
  const nav = document.getElementById('floatingNavbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// ==========================================================================
// 2. ROUTING & VIEW CONTROLLER
// ==========================================================================
function navigateTo(viewName) {
  currentView = viewName;
  
  const landing = document.getElementById('landingPageView');
  const auth = document.getElementById('authPageView');
  const dash = document.getElementById('dashboardPageView');
  const navbar = document.getElementById('floatingNavbar');
  
  landing.classList.add('hidden');
  auth.classList.add('hidden');
  dash.classList.add('hidden');
  navbar.classList.remove('hidden');
  
  if (viewName === 'landing') {
    landing.classList.remove('hidden');
  } else if (viewName === 'auth') {
    auth.classList.remove('hidden');
  } else if (viewName === 'dashboard') {
    dash.classList.remove('hidden');
    navbar.classList.add('hidden'); // Hide landing header in dashboard
    setupDashboardUI();
  }
}

function showAuthPage(tabName) {
  navigateTo('auth');
  toggleAuthTab(tabName);
}

function toggleAuthTab(tabName) {
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const formTitle = document.getElementById('authFormTitle');
  const formSubtitle = document.getElementById('authFormSubtitle');
  
  // Clear messages
  document.getElementById('authMessage').innerHTML = '';
  
  if (tabName === 'login') {
    tabLoginBtn.classList.add('active');
    tabRegisterBtn.classList.remove('active');
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    formTitle.textContent = 'Selamat Datang';
    formSubtitle.textContent = 'Masuk ke portal Anda untuk memesan atau mengelola ruangan.';
  } else {
    tabLoginBtn.classList.remove('active');
    tabRegisterBtn.classList.add('active');
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    formTitle.textContent = 'Daftar Akun';
    formSubtitle.textContent = 'Buat akun Anda secara gratis untuk mulai memesan ruang rapat.';
  }
}

// Apply visual accent color themes
function applyRoleTheme(role) {
  if (role === 'admin') {
    document.body.classList.add('theme-admin');
  } else {
    document.body.classList.remove('theme-admin');
  }
}

// ==========================================================================
// 3. AUTHENTICATION (API INTEGRATION)
// ==========================================================================
async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const alertContainer = document.getElementById('authMessage');
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      token = data.token;
      currentUser = data.user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(currentUser));
      
      alertContainer.innerHTML = `
        <div class="alert-box alert-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Login berhasil! Mengalihkan...</span>
        </div>`;
      
      applyRoleTheme(currentUser.role);
      
      setTimeout(() => {
        navigateTo('dashboard');
        // Clear forms
        document.getElementById('loginForm').reset();
      }, 1000);
    } else {
      alertContainer.innerHTML = `
        <div class="alert-box alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>${data.message}</span>
        </div>`;
    }
  } catch (err) {
    console.error(err);
    alertContainer.innerHTML = `
      <div class="alert-box alert-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Terjadi kesalahan koneksi server.</span>
      </div>`;
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const phone = document.getElementById('registerPhone').value;
  const password = document.getElementById('registerPassword').value;
  const alertContainer = document.getElementById('authMessage');
  
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, phone })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      alertContainer.innerHTML = `
        <div class="alert-box alert-success">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>Registrasi berhasil! Silakan masuk dengan email Anda.</span>
        </div>`;
      
      setTimeout(() => {
        toggleAuthTab('login');
        document.getElementById('registerForm').reset();
        document.getElementById('loginEmail').value = email;
      }, 2000);
    } else {
      alertContainer.innerHTML = `
        <div class="alert-box alert-error">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>${data.message}</span>
        </div>`;
    }
  } catch (err) {
    console.error(err);
    alertContainer.innerHTML = `
      <div class="alert-box alert-error">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Terjadi kesalahan saat registrasi.</span>
      </div>`;
  }
}

function handleLogout() {
  localStorage.clear();
  token = null;
  currentUser = null;
  document.body.classList.remove('theme-admin');
  navigateTo('landing');
}

// ==========================================================================
// 4. ROLE-BASED DASHBOARD CONTROLLER
// ==========================================================================
function setupDashboardUI() {
  if (!currentUser) return;
  
  // Set User Profile UI in sidebar
  document.getElementById('sidebarUserName').textContent = currentUser.name;
  document.getElementById('sidebarUserAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
  
  const roleBadge = document.getElementById('sidebarUserRole');
  roleBadge.textContent = currentUser.role === 'admin' ? 'Administrator' : 'Customer';
  roleBadge.className = 'user-profile-role ' + (currentUser.role === 'admin' ? 'role-admin' : 'role-customer');
  
  // Toggle sidebar options based on role
  const customerElements = document.querySelectorAll('.customer-only');
  const adminElements = document.querySelectorAll('.admin-only');
  
  if (currentUser.role === 'admin') {
    customerElements.forEach(el => el.classList.add('hidden'));
    adminElements.forEach(el => el.classList.remove('hidden'));
    switchDashboardTab('overview');
  } else {
    customerElements.forEach(el => el.classList.remove('hidden'));
    adminElements.forEach(el => el.classList.add('hidden'));
    switchDashboardTab('pesanRuangan');
  }
}

function switchDashboardTab(tabName) {
  currentDashboardTab = tabName;
  
  // Update Active tab styling on sidebar buttons
  document.querySelectorAll('.sidebar-menu-btn').forEach(btn => btn.classList.remove('active'));
  
  // Update Active tab styling on mobile bottom nav buttons
  document.querySelectorAll('.mobile-bottom-nav-btn').forEach(btn => btn.classList.remove('active'));

  // Hide all tab contents
  document.querySelectorAll('.dashboard-tab-content').forEach(tab => tab.classList.add('hidden'));
  
  // Define tab mappings, update header title & subtitle
  const titleEl = document.getElementById('viewportTitle');
  const subtitleEl = document.getElementById('viewportSubtitle');
  
  if (tabName === 'pesanRuangan') {
    document.getElementById('menuBtnPesanRuangan').classList.add('active');
    const mobileBtn = document.getElementById('mobileMenuBtnPesanRuangan');
    if (mobileBtn) mobileBtn.classList.add('active');
    document.getElementById('tabContentPesanRuangan').classList.remove('hidden');
    titleEl.textContent = 'Pesan Ruangan';
    subtitleEl.textContent = 'Pilih dan lakukan booking pada ruangan rapat premium yang tersedia.';
    loadCustomerRooms();
  } 
  else if (tabName === 'bookingSaya') {
    document.getElementById('menuBtnBookingSaya').classList.add('active');
    const mobileBtn = document.getElementById('mobileMenuBtnBookingSaya');
    if (mobileBtn) mobileBtn.classList.add('active');
    document.getElementById('tabContentBookingSaya').classList.remove('hidden');
    titleEl.textContent = 'Booking Saya';
    subtitleEl.textContent = 'Lacak status reservasi dan jadwal pertemuan yang telah Anda daftarkan.';
    loadCustomerBookings();
  } 
  else if (tabName === 'overview') {
    document.getElementById('menuBtnOverview').classList.add('active');
    const mobileBtn = document.getElementById('mobileMenuBtnOverview');
    if (mobileBtn) mobileBtn.classList.add('active');
    document.getElementById('tabContentOverview').classList.remove('hidden');
    titleEl.textContent = 'Ringkasan';
    subtitleEl.textContent = 'Monitor aktivitas penggunaan ruangan dan portal.';
    loadAdminMetrics();
  } 
  else if (tabName === 'kelolaRuangan') {
    document.getElementById('menuBtnKelolaRuangan').classList.add('active');
    const mobileBtn = document.getElementById('mobileMenuBtnKelolaRuangan');
    if (mobileBtn) mobileBtn.classList.add('active');
    document.getElementById('tabContentKelolaRuangan').classList.remove('hidden');
    titleEl.textContent = 'Kelola Ruangan';
    subtitleEl.textContent = 'Tambah, ubah, atau hapus meeting room dari inventaris sistem.';
    loadAdminRooms();
  } 
  else if (tabName === 'kelolaPengguna') {
    document.getElementById('menuBtnKelolaPengguna').classList.add('active');
    const mobileBtn = document.getElementById('mobileMenuBtnKelolaPengguna');
    if (mobileBtn) mobileBtn.classList.add('active');
    document.getElementById('tabContentKelolaPengguna').classList.remove('hidden');
    titleEl.textContent = 'Kelola Pengguna';
    subtitleEl.textContent = 'Administrasi data user umum (customer) dan administrator.';
    loadAdminUsers();
  } 
  else if (tabName === 'semuaBooking') {
    document.getElementById('menuBtnSemuaBooking').classList.add('active');
    const mobileBtn = document.getElementById('mobileMenuBtnSemuaBooking');
    if (mobileBtn) mobileBtn.classList.add('active');
    document.getElementById('tabContentSemuaBooking').classList.remove('hidden');
    titleEl.textContent = 'Semua Booking';
    subtitleEl.textContent = 'Tinjau, setujui, tolak, atau buat jadwal booking di seluruh ruangan.';
    
    // Set default date filter to today
    document.getElementById('filterDate').value = new Date().toISOString().split('T')[0];
    loadAdminRoomsDropdown(); // Load rooms in filter
    loadAdminBookings();
  }
}


// ==========================================================================
// 5. CUSTOMER PORTAL ACTION HANDLERS
// ==========================================================================
async function loadCustomerRooms() {
  const container = document.getElementById('customerRoomsGrid');
  container.innerHTML = '<p style="padding: 20px; text-align: center;">Memuat ruangan...</p>';
  
  try {
    const res = await fetch('/api/rooms', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const rooms = await res.json();
    
    if (res.ok) {
      if (rooms.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--text-muted);">Tidak ada ruangan yang terdaftar.</p>';
        return;
      }
      
      container.innerHTML = rooms.map((r, idx) => {
        // Choose distinct background visual gradient for room variety
        const gradientStyles = [
          'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
          'linear-gradient(135deg, #1e3a8a 0%, #a855f7 100%)',
          'linear-gradient(135deg, #4338ca 0%, #10b981 100%)',
          'linear-gradient(135deg, #1e3a8a 0%, #f97316 100%)',
          'linear-gradient(135deg, #4f46e5 0%, #ec4899 100%)'
        ];
        const selectedGradient = gradientStyles[idx % gradientStyles.length];
        
        return `
          <div class="glass-box-card room-preview-card room-dashboard-card">
            <div>
              <div class="room-preview-image" style="background: ${selectedGradient}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                <span class="room-preview-badge">Kapasitas ${r.capacity} Pax</span>
              </div>
              <div class="room-preview-info">
                <h3 style="margin-bottom: 12px;">${escapeHtml(r.name)}</h3>
                <div class="room-amenities">
                  <span class="amenity-tag">Ultra High-Speed Wifi</span>
                  <span class="amenity-tag">AC</span>
                  <span class="amenity-tag">Smart TV/Projector</span>
                </div>
              </div>
            </div>
            <div style="padding: 0 24px 24px;">
              <button class="btn btn-accent" style="width: 100%;" onclick="openBookingFormModal(false, ${r.id})">Booking Ruangan</button>
            </div>
          </div>`;
      }).join('');
    } else {
      container.innerHTML = `<p style="padding: 20px; text-align: center; color: var(--danger);">Gagal memuat ruangan: ${rooms.message}</p>`;
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = '<p style="padding: 20px; text-align: center; color: var(--danger);">Terjadi kesalahan saat memuat ruangan.</p>';
  }
}

async function loadCustomerBookings() {
  const tbody = document.querySelector('#customerBookingsTable tbody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Memuat booking...</td></tr>';
  
  try {
    // API returns only user bookings when role is customer
    const res = await fetch('/api/bookings?my_bookings=true', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const bookings = await res.json();
    
    if (res.ok) {
      if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px 20px;">Anda belum melakukan booking apa pun.</td></tr>';
        return;
      }
      
      tbody.innerHTML = bookings.map((b, idx) => {
        let statusBadge = '';
        if (b.status === 'pending') {
          statusBadge = '<span class="badge badge-pending">Menunggu</span>';
        } else if (b.status === 'approved') {
          statusBadge = '<span class="badge badge-approved">Disetujui</span>';
        } else {
          statusBadge = '<span class="badge badge-rejected">Ditolak</span>';
        }
        
        return `
          <tr>
            <td data-label="No">${idx + 1}</td>
            <td data-label="Ruangan" style="font-weight: 700;">${escapeHtml(b.room_name)}</td>
            <td data-label="Tanggal">${formatDateIndo(b.date)}</td>
            <td data-label="Mulai">${b.start_time.substring(0, 5)}</td>
            <td data-label="Selesai">${b.end_time.substring(0, 5)}</td>
            <td data-label="Status">${statusBadge}</td>
            <td data-label="Aksi">
              <div class="table-actions">
                <button class="btn btn-icon btn-icon-danger" onclick="handleDeleteBooking(${b.id})" title="Batalkan Booking">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </td>
          </tr>`;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger);">Gagal memuat: ${bookings.message}</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--danger);">Terjadi kesalahan koneksi database.</td></tr>';
  }
}

// ==========================================================================
// 6. ADMIN PORTAL ACTION HANDLERS
// ==========================================================================
async function loadAdminMetrics() {
  try {
    // Load rooms, users, bookings parallelly
    const [resRooms, resUsers, resBookings] = await Promise.all([
      fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/bookings', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);
    
    if (resRooms.ok && resUsers.ok && resBookings.ok) {
      const rooms = await resRooms.json();
      const users = await resUsers.json();
      const bookings = await resBookings.json();
      
      document.getElementById('metricTotalRooms').textContent = rooms.length;
      document.getElementById('metricTotalUsers').textContent = users.length;
      
      // Calculate active bookings (e.g. approved + pending bookings)
      const activeBookings = bookings.filter(b => b.status === 'approved' || b.status === 'pending');
      document.getElementById('metricActiveBookings').textContent = activeBookings.length;
    }
  } catch (err) {
    console.error("Failed to load metrics:", err);
  }
}

async function loadAdminRooms() {
  const tbody = document.querySelector('#adminRoomsTable tbody');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Memuat ruangan...</td></tr>';
  
  try {
    const res = await fetch('/api/rooms', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const rooms = await res.json();
    
    if (res.ok) {
      if (rooms.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Tidak ada data ruangan.</td></tr>';
        return;
      }
      
      tbody.innerHTML = rooms.map(r => `
        <tr>
          <td data-label="ID">${r.id}</td>
          <td data-label="Nama Ruangan" style="font-weight: 700;">${escapeHtml(r.name)}</td>
          <td data-label="Kapasitas (Pax)">${r.capacity} Pax</td>
          <td data-label="Aksi">
            <div class="table-actions">
              <button class="btn btn-icon" onclick='openRoomFormModal(${JSON.stringify(r)})' title="Edit Ruangan">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="btn btn-icon btn-icon-danger" onclick="handleDeleteRoom(${r.id})" title="Hapus Ruangan">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
              </button>
            </div>
          </td>
        </tr>`).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--danger);">Gagal: ${rooms.message}</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--danger);">Koneksi terputus.</td></tr>';
  }
}

async function loadAdminUsers() {
  const tbody = document.querySelector('#adminUsersTable tbody');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Memuat pengguna...</td></tr>';
  
  try {
    const res = await fetch('/api/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const users = await res.json();
    
    if (res.ok) {
      if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Tidak ada data user.</td></tr>';
        return;
      }
      
      tbody.innerHTML = users.map(u => {
        const roleLabel = u.role === 'admin' ? '<span class="badge badge-approved">Admin</span>' : '<span class="badge badge-pending">Customer</span>';
        
        return `
          <tr>
            <td data-label="ID">${u.id}</td>
            <td data-label="Nama Lengkap" style="font-weight: 700;">${escapeHtml(u.name)}</td>
            <td data-label="Email">${escapeHtml(u.email)}</td>
            <td data-label="Hak Akses">${roleLabel}</td>
            <td data-label="Telepon">${escapeHtml(u.phone || '-')}</td>
            <td data-label="Aksi">
              <div class="table-actions">
                <button class="btn btn-icon" onclick='openUserFormModal(${JSON.stringify(u)})' title="Edit User">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn btn-icon btn-icon-danger" onclick="handleDeleteUser(${u.id})" title="Hapus User">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
            </td>
          </tr>`;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger);">Gagal: ${users.message}</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--danger);">Koneksi terputus.</td></tr>';
  }
}

async function loadAdminRoomsDropdown() {
  const filterSelect = document.getElementById('filterRoom');
  
  try {
    const res = await fetch('/api/rooms', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const rooms = await res.json();
    if (res.ok) {
      filterSelect.innerHTML = '<option value="">Semua Ruangan</option>' + rooms.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
    }
  } catch (err) {
    console.error("Failed to load room dropdown filters:", err);
  }
}

async function loadAdminBookings() {
  const tbody = document.querySelector('#adminBookingsTable tbody');
  tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Memuat semua booking...</td></tr>';
  
  const date = document.getElementById('filterDate').value;
  const room = document.getElementById('filterRoom').value;
  
  let url = '/api/bookings?';
  if (date) url += `date=${date}&`;
  if (room) url += `room_id=${room}&`;
  
  try {
    const res = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const bookings = await res.json();
    
    if (res.ok) {
      if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-muted); padding: 30px 20px;">Tidak ada booking terdaftar untuk kriteria ini.</td></tr>';
        return;
      }
      
      tbody.innerHTML = bookings.map(b => {
        let statusBadge = '';
        let actionButtons = '';
        
        if (b.status === 'pending') {
          statusBadge = '<span class="badge badge-pending">Menunggu</span>';
          actionButtons = `
            <button class="btn btn-icon btn-icon-success" onclick="handleUpdateBookingStatus(${b.id}, 'approved')" title="Setujui Booking">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
            </button>
            <button class="btn btn-icon btn-icon-danger" onclick="handleUpdateBookingStatus(${b.id}, 'rejected')" title="Tolak Booking">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>`;
        } else if (b.status === 'approved') {
          statusBadge = '<span class="badge badge-approved">Disetujui</span>';
        } else {
          statusBadge = '<span class="badge badge-rejected">Ditolak</span>';
        }
        
        // Always add Cancel button (which deletes the booking)
        actionButtons += `
          <button class="btn btn-icon btn-icon-danger" onclick="handleDeleteBooking(${b.id}, 'admin')" title="Hapus Booking">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </button>`;
          
        return `
          <tr>
            <td data-label="ID">${b.id}</td>
            <td data-label="Ruangan" style="font-weight: 700;">${escapeHtml(b.room_name)}</td>
            <td data-label="Pemesan">
              <div style="font-weight: 600;">${escapeHtml(b.customer_name)}</div>
              <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml(b.customer_email)}</div>
            </td>
            <td data-label="Tanggal">${formatDateIndo(b.date)}</td>
            <td data-label="Mulai">${b.start_time.substring(0, 5)}</td>
            <td data-label="Selesai">${b.end_time.substring(0, 5)}</td>
            <td data-label="Status">${statusBadge}</td>
            <td data-label="Aksi">
              <div class="table-actions">
                ${actionButtons}
              </div>
            </td>
          </tr>`;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--danger);">Gagal: ${bookings.message}</td></tr>`;
    }
  } catch (err) {
    console.error(err);
    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--danger);">Terjadi kesalahan server.</td></tr>';
  }
}

// ==========================================================================
// 7. BOOKING FORM DIALOGS (CUSTOMER & ADMIN)
// ==========================================================================
async function openBookingFormModal(isAdminView = false, preselectedRoomId = null) {
  const modal = document.getElementById('bookingModalOverlay');
  const customerField = document.getElementById('bookingCustomerField');
  const roomSelect = document.getElementById('bookingRoom');
  const customerSelect = document.getElementById('bookingCustomer');
  const msgContainer = document.getElementById('bookingModalMessage');
  
  modal.classList.add('active');
  msgContainer.innerHTML = '';
  document.getElementById('bookingForm').reset();
  
  // Set default date to today
  document.getElementById('bookingDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('bookingStart').value = '09:00';
  document.getElementById('bookingEnd').value = '10:00';
  
  // Load rooms into modal dropdown
  try {
    const resRooms = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
    const rooms = await resRooms.json();
    if (resRooms.ok) {
      roomSelect.innerHTML = rooms.map(r => `<option value="${r.id}">${escapeHtml(r.name)} (Kapasitas ${r.capacity} Pax)</option>`).join('');
      if (preselectedRoomId) {
        roomSelect.value = preselectedRoomId;
      }
    }
  } catch (err) {
    console.error("Failed to load rooms for modal:", err);
  }
  
  // Handle Admin view customer choice
  if (isAdminView && currentUser.role === 'admin') {
    customerField.classList.remove('hidden');
    customerSelect.required = true;
    try {
      const resUsers = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
      const users = await resUsers.json();
      if (resUsers.ok) {
        customerSelect.innerHTML = users.map(u => `<option value="${u.id}">${escapeHtml(u.name)} (${escapeHtml(u.email)})</option>`).join('');
      }
    } catch (err) {
      console.error("Failed to load users for modal:", err);
    }
  } else {
    customerField.classList.add('hidden');
    customerSelect.required = false;
  }
}

function closeBookingFormModal() {
  document.getElementById('bookingModalOverlay').classList.remove('active');
}

async function handleSaveBooking(event) {
  event.preventDefault();
  const room_id = document.getElementById('bookingRoom').value;
  const date = document.getElementById('bookingDate').value;
  const start_time = document.getElementById('bookingStart').value;
  const end_time = document.getElementById('bookingEnd').value;
  const msgContainer = document.getElementById('bookingModalMessage');
  
  const payload = {
    room_id: parseInt(room_id),
    date,
    start_time,
    end_time
  };
  
  // Admin specifies user_id, customer is set by token automatically
  if (currentUser.role === 'admin' && !document.getElementById('bookingCustomerField').classList.contains('hidden')) {
    const user_id = document.getElementById('bookingCustomer').value;
    payload.user_id = parseInt(user_id);
  }
  
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (res.ok) {
      msgContainer.innerHTML = `
        <div class="alert-box alert-success" style="margin-top: 14px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span>${data.message}</span>
        </div>`;
      
      setTimeout(() => {
        closeBookingFormModal();
        if (currentUser.role === 'admin') {
          loadAdminBookings();
        } else {
          switchDashboardTab('bookingSaya');
        }
      }, 1500);
    } else {
      msgContainer.innerHTML = `
        <div class="alert-box alert-error" style="margin-top: 14px;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>${data.message}</span>
        </div>`;
    }
  } catch (err) {
    console.error(err);
    msgContainer.innerHTML = `
      <div class="alert-box alert-error" style="margin-top: 14px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>Terjadi kesalahan saat memproses booking.</span>
      </div>`;
  }
}

async function handleDeleteBooking(id, roleContext = 'customer') {
  if (!confirm('Apakah Anda yakin ingin membatalkan/menghapus booking ini?')) return;
  
  try {
    const res = await fetch(`/api/bookings/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    
    if (res.ok) {
      alert(data.message);
      if (roleContext === 'admin') {
        loadAdminBookings();
      } else {
        loadCustomerBookings();
      }
    } else {
      alert(`Gagal membatalkan booking: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan koneksi.');
  }
}

async function handleUpdateBookingStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status: newStatus })
    });
    
    const data = await res.json();
    if (res.ok) {
      loadAdminBookings();
      loadAdminMetrics();
    } else {
      alert(`Gagal memperbarui status: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert('Kesalahan jaringan.');
  }
}

// ==========================================================================
// 8. ROOM CRUD DIALOGS (ADMIN ONLY)
// ==========================================================================
function openRoomFormModal(roomObj = null) {
  const modal = document.getElementById('roomModalOverlay');
  const title = document.getElementById('roomModalTitle');
  
  modal.classList.add('active');
  document.getElementById('roomForm').reset();
  
  if (roomObj) {
    title.textContent = 'Edit Ruangan';
    document.getElementById('roomId').value = roomObj.id;
    document.getElementById('roomName').value = roomObj.name;
    document.getElementById('roomCapacity').value = roomObj.capacity;
  } else {
    title.textContent = 'Tambah Ruangan';
    document.getElementById('roomId').value = '';
  }
}

function closeRoomFormModal() {
  document.getElementById('roomModalOverlay').classList.remove('active');
}

async function handleSaveRoom(event) {
  event.preventDefault();
  const id = document.getElementById('roomId').value;
  const name = document.getElementById('roomName').value;
  const capacity = document.getElementById('roomCapacity').value;
  
  const url = id ? `/api/rooms/${id}` : '/api/rooms';
  const method = id ? 'PUT' : 'POST';
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name, capacity: parseInt(capacity) })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      closeRoomFormModal();
      loadAdminRooms();
      loadAdminMetrics();
    } else {
      alert(`Gagal menyimpan ruangan: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan jaringan.');
  }
}

async function handleDeleteRoom(id) {
  if (!confirm('Hapus ruangan ini? Semua jadwal booking terkait ruangan ini akan ikut terhapus.')) return;
  
  try {
    const res = await fetch(`/api/rooms/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    
    if (res.ok) {
      loadAdminRooms();
      loadAdminMetrics();
    } else {
      alert(`Gagal menghapus ruangan: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert('Koneksi terputus.');
  }
}

// ==========================================================================
// 9. USER CRUD DIALOGS (ADMIN ONLY)
// ==========================================================================
function openUserFormModal(userObj = null) {
  const modal = document.getElementById('userModalOverlay');
  const title = document.getElementById('userModalTitle');
  const passGroup = document.getElementById('userPasswordGroup');
  
  modal.classList.add('active');
  document.getElementById('userForm').reset();
  
  if (userObj) {
    title.textContent = 'Edit User';
    passGroup.classList.add('hidden'); // Hide password field on edit to keep it secure
    document.getElementById('userPassword').required = false;
    
    document.getElementById('userId').value = userObj.id;
    document.getElementById('userName').value = userObj.name;
    document.getElementById('userEmail').value = userObj.email;
    document.getElementById('userRole').value = userObj.role;
    document.getElementById('userPhone').value = userObj.phone || '';
  } else {
    title.textContent = 'Tambah User';
    passGroup.classList.remove('hidden');
    document.getElementById('userPassword').required = true;
    document.getElementById('userId').value = '';
  }
}

function closeUserFormModal() {
  document.getElementById('userModalOverlay').classList.remove('active');
}

async function handleSaveUser(event) {
  event.preventDefault();
  const id = document.getElementById('userId').value;
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const role = document.getElementById('userRole').value;
  const phone = document.getElementById('userPhone').value;
  const password = document.getElementById('userPassword').value;
  
  const url = id ? `/api/users/${id}` : '/api/users';
  const method = id ? 'PUT' : 'POST';
  
  const payload = { name, email, role, phone };
  if (!id && password) payload.password = password; // Only send password on create
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    const data = await res.json();
    
    if (res.ok) {
      closeUserFormModal();
      loadAdminUsers();
      loadAdminMetrics();
    } else {
      alert(`Gagal menyimpan user: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert('Terjadi kesalahan jaringan.');
  }
}

async function handleDeleteUser(id) {
  if (currentUser && currentUser.id === id) {
    alert('Anda tidak dapat menghapus akun Anda sendiri.');
    return;
  }
  
  if (!confirm('Hapus user ini? Seluruh booking yang dibuat oleh user ini juga akan terhapus.')) return;
  
  try {
    const res = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    
    if (res.ok) {
      loadAdminUsers();
      loadAdminMetrics();
    } else {
      alert(`Gagal menghapus user: ${data.message}`);
    }
  } catch (err) {
    console.error(err);
    alert('Koneksi terputus.');
  }
}

// ==========================================================================
// 10. HELPER UTILITY FUNCTIONS
// ==========================================================================
function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function formatDateIndo(dateStr) {
  if (!dateStr) return '';
  // Convert YYYY-MM-DD to Indonesian format (e.g. 24 Mei 2026)
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  // Avoid time-zone offset bugs when parsing date string
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const day = parseInt(parts[2], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const year = parts[0];
  
  return `${day} ${months[monthIdx]} ${year}`;
}
