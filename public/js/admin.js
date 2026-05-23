// Ambil token yang mungkin tersimpan di localStorage
let token = localStorage.getItem('token');
// Jika token sudah tersedia, langsung cek status otentikasi
if (token) {
  checkAuth();
}

// Fungsi login menangani proses login admin
async function login() {
  const email = document.getElementById('loginEmail').value; // Ambil email dari input
  const password = document.getElementById('loginPassword').value; // Ambil password dari input
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST', // Metode request
      headers: { 'Content-Type': 'application/json' }, // Header JSON
      body: JSON.stringify({ email, password }) // Body sebagai JSON
    });
    const data = await res.json(); // Parsing respons JSON
    if (res.ok) {
      token = data.token; // Simpan token dari server
      localStorage.setItem('token', token); // Simpan token di localStorage
      localStorage.setItem('user', JSON.stringify(data.user)); // Simpan user info di localStorage
      checkAuth(); // Cek ulang otentikasi dan tampilkan dashboard
    } else {
      document.getElementById('loginMessage').innerHTML = `<div class="message error">${data.message}</div>`; // Tampilkan error
    }
  } catch (err) {
    console.error(err); // Log error jika fetch gagal
  }
}

// Fungsi logout menghapus data sesi dan kembali ke halaman login
function logout() {
  localStorage.clear(); // Hapus semua data lokal
  token = null; // Reset token di memori
  document.getElementById('loginPage').classList.remove('hidden'); // Tampilkan login
  document.getElementById('dashboard').classList.add('hidden'); // Sembunyikan dashboard
}

// Fungsi checkAuth mengonfirmasi token valid dengan API
async function checkAuth() {
  try {
    const res = await fetch('/api/rooms', {
      headers: { 'Authorization': `Bearer ${token}` } // Sertakan token dalam header
    });
    if (res.ok) {
      document.getElementById('loginPage').classList.add('hidden'); // Sembunyikan login
      document.getElementById('dashboard').classList.remove('hidden'); // Tampilkan dashboard
      showTab('rooms'); // Default tab ruangan
      loadRooms(); // Muat data ruangan
      loadUsers(); // Muat data user
      loadBookings(); // Muat data booking
    } else {
      logout(); // Token tidak valid, logout
    }
  } catch {
    logout(); // Jika terjadi error jaringan, logout
  }
}

// Fungsi untuk mengganti tab konten
function showTab(tab) {
  document.querySelectorAll('#contentRooms, #contentUsers, #contentBookings').forEach(el => el.classList.add('hidden')); // Sembunyikan semua tab
  document.getElementById('content' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.remove('hidden'); // Tampilkan tab yang dipilih
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active')); // Reset status aktif semua tab
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active'); // Tandai tab aktif
}

// ========== ROOMS ==========
// Muat data ruangan dan tampilkan di tabel
async function loadRooms() {
  const res = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } }); // Request daftar ruangan
  const rooms = await res.json(); // Parsing JSON
  const tbody = document.querySelector('#roomsTable tbody'); // Elemen tbody tabel ruangan
  tbody.innerHTML = rooms.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.name}</td><td>${r.capacity}</td>
      <td>
        <button class="btn-warning" onclick='editRoom(${JSON.stringify(r)})'>Edit</button>
        <button class="btn-danger" onclick="deleteRoom(${r.id})">Hapus</button>
      </td>
    </tr>`).join(''); // Bangun HTML baris tabel
  document.getElementById('filterRoom').innerHTML = '<option value="">Semua Ruangan</option>' + rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join(''); // Update opsi filter ruangan
}

// Tampilkan form tambah ruangan
function showRoomForm() {
  document.getElementById('roomFormContainer').classList.remove('hidden'); // Tampilkan form
  document.getElementById('roomFormTitle').textContent = 'Tambah Ruangan'; // Set judul form
  document.getElementById('roomId').value = ''; // Reset id
  document.getElementById('roomName').value = ''; // Reset nama
  document.getElementById('roomCapacity').value = ''; // Reset kapasitas
}

// Sembunyikan form ruangan
function hideRoomForm() {
  document.getElementById('roomFormContainer').classList.add('hidden');
}

// Isi form ruangan saat edit
function editRoom(room) {
  document.getElementById('roomFormContainer').classList.remove('hidden'); // Tampilkan form
  document.getElementById('roomFormTitle').textContent = 'Edit Ruangan'; // Ubah judul form
  document.getElementById('roomId').value = room.id; // Set id
  document.getElementById('roomName').value = room.name; // Set nama
  document.getElementById('roomCapacity').value = room.capacity; // Set kapasitas
}

// Simpan ruangan baru atau update ruangan
async function saveRoom() {
  const id = document.getElementById('roomId').value; // Ambil id bila edit
  const name = document.getElementById('roomName').value; // Ambil nama ruangan
  const capacity = document.getElementById('roomCapacity').value; // Ambil kapasitas
  const url = id ? `/api/rooms/${id}` : '/api/rooms'; // Tentukan endpoint
  const method = id ? 'PUT' : 'POST'; // Tentukan method
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name, capacity }) // Kirim payload
  });
  if (res.ok) {
    hideRoomForm(); // Sembunyikan form
    loadRooms(); // Refresh daftar ruangan
    loadBookings(); // Refresh booking karena relasi dapat berubah
  } else {
    const data = await res.json();
    alert(data.message); // Tampilkan error sederhana
  }
}

// Hapus ruangan melalui API
async function deleteRoom(id) {
  if (!confirm('Hapus ruangan ini?')) return; // Konfirmasi pengguna
  const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  if (res.ok) {
    loadRooms(); // Refresh daftar ruangan
    loadBookings(); // Refresh booking
  } else {
    alert('Gagal hapus'); // Notifikasi simple jika gagal
  }
}

// ========== USERS ==========
// Muat data users dan tampilkan di tabel
async function loadUsers() {
  const res = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
  const users = await res.json(); // Parsing JSON
  const tbody = document.querySelector('#usersTable tbody'); // Elemen tbody tabel users
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.phone||'-'}</td>
      <td>
        <button class="btn-warning" onclick='editUser(${JSON.stringify(u)})'>Edit</button>
        <button class="btn-danger" onclick="deleteUser(${u.id})">Hapus</button>
      </td>
    </tr>`).join(''); // Bangun baris tabel user
}

// Tampilkan form tambah user
function showUserForm() {
  document.getElementById('userFormContainer').classList.remove('hidden'); // Tampilkan form
  document.getElementById('userFormTitle').textContent = 'Tambah User';
  document.getElementById('userId').value = '';
  document.getElementById('userName').value = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('userPassword').value = '';
  document.getElementById('userRole').value = 'customer';
  document.getElementById('userPhone').value = '';
}

// Sembunyikan form user
function hideUserForm() {
  document.getElementById('userFormContainer').classList.add('hidden');
}

// Isi form user saat edit
function editUser(u) {
  document.getElementById('userFormContainer').classList.remove('hidden');
  document.getElementById('userFormTitle').textContent = 'Edit User';
  document.getElementById('userId').value = u.id;
  document.getElementById('userName').value = u.name;
  document.getElementById('userEmail').value = u.email;
  document.getElementById('userPassword').value = '';
  document.getElementById('userRole').value = u.role;
  document.getElementById('userPhone').value = u.phone||'';
}

// Simpan user baru atau update user
async function saveUser() {
  const id = document.getElementById('userId').value; // Ambil id user bila edit
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  const role = document.getElementById('userRole').value;
  const phone = document.getElementById('userPhone').value;
  const url = id ? `/api/users/${id}` : '/api/users';
  const method = id ? 'PUT' : 'POST';
  const body = { name, email, role, phone }; // Payload dasar
  if (!id && password) body.password = password; // Hanya kirim password untuk create
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  if (res.ok) {
    hideUserForm(); // Sembunyikan form jika berhasil
    loadUsers(); // Refresh daftar users
  } else {
    const data = await res.json();
    alert(data.message); // Notifikasi jika gagal
  }
}

// Hapus user via API
async function deleteUser(id) {
  if (!confirm('Hapus user ini?')) return; // Konfirmasi hapus
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  if (res.ok) {
    loadUsers(); // Refresh daftar user
  } else {
    alert('Gagal hapus');
  }
}

// ========== BOOKINGS ==========
// Muat daftar booking dan tampilkan di tabel
async function loadBookings() {
  const date = document.getElementById('filterDate').value; // Filter tanggal
  const room = document.getElementById('filterRoom').value; // Filter ruangan
  let url = '/api/bookings?'; // Endpoint booking
  if (date) url += `date=${date}&`;
  if (room) url += `room_id=${room}&`;
  const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
  const bookings = await res.json();
  const tbody = document.querySelector('#bookingsTable tbody');
  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.id}</td><td>${b.room_name}</td><td>${b.customer_name} (${b.customer_email})</td>
      <td>${b.date}</td><td>${b.start_time}</td><td>${b.end_time}</td>
      <td>
        <button class="btn-danger" onclick="deleteBooking(${b.id})">Batalkan</button>
      </td>
    </tr>`).join(''); // Bangun baris tabel booking
}

// Batalkan booking via API
async function deleteBooking(id) {
  if (!confirm('Batalkan booking ini?')) return; // Konfirmasi pengguna
  const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  if (res.ok) {
    loadBookings(); // Refresh daftar booking
  } else {
    alert('Gagal membatalkan');
  }
}

// ========== BOOKING FORM ==========
// Buka form booking dan isi beberapa nilai awal
function showBookingForm() {
  document.getElementById('bookingFormContainer').classList.remove('hidden'); // Tampilkan form booking
  document.getElementById('bookingMessage').innerHTML = ''; // Kosongkan pesan
  const today = new Date().toISOString().split('T')[0]; // Tanggal hari ini
  document.getElementById('bookingDate').value = today; // Set tanggal default
  document.getElementById('bookingStart').value = '09:00'; // Set jam mulai default
  document.getElementById('bookingEnd').value = '10:00'; // Set jam selesai default
  loadCustomerDropdown(); // Muat opsi customer
  loadRoomDropdown(); // Muat opsi ruangan
}

// Sembunyikan form booking
function hideBookingForm() {
  document.getElementById('bookingFormContainer').classList.add('hidden');
}

// Muat daftar pengguna ke dropdown customer
async function loadCustomerDropdown() {
  const res = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
  const users = await res.json();
  const select = document.getElementById('bookingCustomer');
  select.innerHTML = users.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('');
}

// Muat daftar ruangan ke dropdown ruangan
async function loadRoomDropdown() {
  const res = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
  const rooms = await res.json();
  const select = document.getElementById('bookingRoom');
  select.innerHTML = rooms.map(r => `<option value="${r.id}">${r.name} (Kapasitas ${r.capacity})</option>`).join('');
}

// Simpan booking baru
async function saveBooking() {
  const user_id = document.getElementById('bookingCustomer').value; // Ambil nilai customer
  const room_id = document.getElementById('bookingRoom').value; // Ambil nilai ruangan
  const date = document.getElementById('bookingDate').value; // Ambil nilai tanggal
  const start_time = document.getElementById('bookingStart').value; // Ambil nilai jam mulai
  const end_time = document.getElementById('bookingEnd').value; // Ambil nilai jam selesai

  const res = await fetch('/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      user_id: parseInt(user_id),
      room_id: parseInt(room_id),
      date,
      start_time,
      end_time
    })
  });

  const data = await res.json(); // Parsing respons server
  const msgDiv = document.getElementById('bookingMessage');
  if (res.ok) {
    msgDiv.innerHTML = `<div class="message success">${data.message}</div>`; // Tampilkan pesan sukses
    setTimeout(() => {
      hideBookingForm(); // Tutup form otomatis
      loadBookings(); // Refresh daftar booking
    }, 1500);
  } else {
    msgDiv.innerHTML = `<div class="message error">${data.message}</div>`; // Tampilkan error
  }
}

// Initial load saat halaman terbuka dan token tersedia
if (token) checkAuth();
