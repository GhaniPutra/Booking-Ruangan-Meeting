let token = localStorage.getItem('token');
if (token) {
  checkAuth();
}

async function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) {
      token = data.token;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));
      checkAuth();
    } else {
      document.getElementById('loginMessage').innerHTML = `<div class="message error">${data.message}</div>`;
    }
  } catch (err) {
    console.error(err);
  }
}

function logout() {
  localStorage.clear();
  token = null;
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('dashboard').classList.add('hidden');
}

async function checkAuth() {
  try {
    const res = await fetch('/api/rooms', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      document.getElementById('loginPage').classList.add('hidden');
      document.getElementById('dashboard').classList.remove('hidden');
      showTab('rooms');
      loadRooms();
      loadUsers();
      loadBookings();
    } else {
      logout();
    }
  } catch {
    logout();
  }
}

function showTab(tab) {
  document.querySelectorAll('#contentRooms, #contentUsers, #contentBookings').forEach(el => el.classList.add('hidden'));
  document.getElementById('content' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.remove('hidden');
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('tab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
}

// ========== ROOMS ==========
async function loadRooms() {
  const res = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
  const rooms = await res.json();
  const tbody = document.querySelector('#roomsTable tbody');
  tbody.innerHTML = rooms.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.name}</td><td>${r.capacity}</td>
      <td>
        <button class="btn-warning" onclick='editRoom(${JSON.stringify(r)})'>Edit</button>
        <button class="btn-danger" onclick="deleteRoom(${r.id})">Hapus</button>
      </td>
    </tr>`).join('');
  document.getElementById('filterRoom').innerHTML = '<option value="">Semua Ruangan</option>' + rooms.map(r => `<option value="${r.id}">${r.name}</option>`).join('');
}

function showRoomForm() { 
  document.getElementById('roomFormContainer').classList.remove('hidden'); 
  document.getElementById('roomFormTitle').textContent = 'Tambah Ruangan';
  document.getElementById('roomId').value = '';
  document.getElementById('roomName').value = '';
  document.getElementById('roomCapacity').value = '';
}

function hideRoomForm() { document.getElementById('roomFormContainer').classList.add('hidden'); }

function editRoom(room) {
  document.getElementById('roomFormContainer').classList.remove('hidden');
  document.getElementById('roomFormTitle').textContent = 'Edit Ruangan';
  document.getElementById('roomId').value = room.id;
  document.getElementById('roomName').value = room.name;
  document.getElementById('roomCapacity').value = room.capacity;
}

async function saveRoom() {
  const id = document.getElementById('roomId').value;
  const name = document.getElementById('roomName').value;
  const capacity = document.getElementById('roomCapacity').value;
  const url = id ? `/api/rooms/${id}` : '/api/rooms';
  const method = id ? 'PUT' : 'POST';
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ name, capacity })
  });
  if (res.ok) {
    hideRoomForm();
    loadRooms();
    loadBookings();
  } else {
    const data = await res.json();
    alert(data.message);
  }
}

async function deleteRoom(id) {
  if (!confirm('Hapus ruangan ini?')) return;
  const res = await fetch(`/api/rooms/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  if (res.ok) { loadRooms(); loadBookings(); } else alert('Gagal hapus');
}

// ========== USERS ==========
async function loadUsers() {
  const res = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
  const users = await res.json();
  const tbody = document.querySelector('#usersTable tbody');
  tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.phone||'-'}</td>
      <td>
        <button class="btn-warning" onclick='editUser(${JSON.stringify(u)})'>Edit</button>
        <button class="btn-danger" onclick="deleteUser(${u.id})">Hapus</button>
      </td>
    </tr>`).join('');
}

function showUserForm() { 
  document.getElementById('userFormContainer').classList.remove('hidden');
  document.getElementById('userFormTitle').textContent = 'Tambah User';
  document.getElementById('userId').value = '';
  document.getElementById('userName').value = '';
  document.getElementById('userEmail').value = '';
  document.getElementById('userPassword').value = '';
  document.getElementById('userRole').value = 'customer';
  document.getElementById('userPhone').value = '';
}
function hideUserForm() { document.getElementById('userFormContainer').classList.add('hidden'); }
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

async function saveUser() {
  const id = document.getElementById('userId').value;
  const name = document.getElementById('userName').value;
  const email = document.getElementById('userEmail').value;
  const password = document.getElementById('userPassword').value;
  const role = document.getElementById('userRole').value;
  const phone = document.getElementById('userPhone').value;
  const url = id ? `/api/users/${id}` : '/api/users';
  const method = id ? 'PUT' : 'POST';
  const body = { name, email, role, phone };
  if (!id && password) body.password = password;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(body)
  });
  if (res.ok) { hideUserForm(); loadUsers(); } 
  else { const data = await res.json(); alert(data.message); }
}

async function deleteUser(id) {
  if (!confirm('Hapus user ini?')) return;
  const res = await fetch(`/api/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  if (res.ok) loadUsers(); else alert('Gagal hapus');
}

// ========== BOOKINGS ==========
async function loadBookings() {
  const date = document.getElementById('filterDate').value;
  const room = document.getElementById('filterRoom').value;
  let url = '/api/bookings?';
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
    </tr>`).join('');
}

async function deleteBooking(id) {
  if (!confirm('Batalkan booking ini?')) return;
  const res = await fetch(`/api/bookings/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
  if (res.ok) loadBookings(); else alert('Gagal membatalkan');
}

// ========== BOOKING FORM ==========
function showBookingForm() {
  document.getElementById('bookingFormContainer').classList.remove('hidden');
  document.getElementById('bookingMessage').innerHTML = '';
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('bookingDate').value = today;
  document.getElementById('bookingStart').value = '09:00';
  document.getElementById('bookingEnd').value = '10:00';
  loadCustomerDropdown();
  loadRoomDropdown();
}

function hideBookingForm() {
  document.getElementById('bookingFormContainer').classList.add('hidden');
}

async function loadCustomerDropdown() {
  const res = await fetch('/api/users', { headers: { 'Authorization': `Bearer ${token}` } });
  const users = await res.json();
  const select = document.getElementById('bookingCustomer');
  select.innerHTML = users.map(u => `<option value="${u.id}">${u.name} (${u.email})</option>`).join('');
}

async function loadRoomDropdown() {
  const res = await fetch('/api/rooms', { headers: { 'Authorization': `Bearer ${token}` } });
  const rooms = await res.json();
  const select = document.getElementById('bookingRoom');
  select.innerHTML = rooms.map(r => `<option value="${r.id}">${r.name} (Kapasitas ${r.capacity})</option>`).join('');
}

async function saveBooking() {
  const user_id = document.getElementById('bookingCustomer').value;
  const room_id = document.getElementById('bookingRoom').value;
  const date = document.getElementById('bookingDate').value;
  const start_time = document.getElementById('bookingStart').value;
  const end_time = document.getElementById('bookingEnd').value;

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

  const data = await res.json();
  const msgDiv = document.getElementById('bookingMessage');
  if (res.ok) {
    msgDiv.innerHTML = `<div class="message success">${data.message}</div>`;
    setTimeout(() => {
      hideBookingForm();
      loadBookings();
    }, 1500);
  } else {
    msgDiv.innerHTML = `<div class="message error">${data.message}</div>`;
  }
}

// initial load
if (token) checkAuth();