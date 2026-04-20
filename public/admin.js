const adminToken = prompt('Enter admin token', 'admin123') || '';

async function fetchRooms() {
  const response = await fetch('/api/rooms');
  const rooms = await response.json();

  const container = document.getElementById('adminRooms');
  container.innerHTML = rooms
    .map(
      (room) => `
      <div class="card">
        <h3>${room.name}</h3>
        <p><strong>ID:</strong> ${room.id}</p>
        <p>${room.location}</p>
        <p>₹${room.price}/month • Beds: ${room.availableBeds}</p>
        <button onclick="deleteRoom('${room.id}')">Delete</button>
      </div>
      `
    )
    .join('');
}

async function fetchBookings() {
  const response = await fetch('/api/admin/bookings', {
    headers: { 'x-admin-token': adminToken }
  });

  const container = document.getElementById('bookings');
  if (!response.ok) {
    container.innerHTML = '<p class="error">Unauthorized: invalid admin token.</p>';
    return;
  }

  const bookings = await response.json();

  if (!bookings.length) {
    container.innerHTML = '<p>No bookings yet.</p>';
    return;
  }

  container.innerHTML = bookings
    .map(
      (booking) => `
      <div class="card">
        <p><strong>${booking.customerName}</strong> (${booking.phone})</p>
        <p>Room ID: ${booking.roomId}</p>
        <p>Check-in: ${booking.checkInDate}</p>
        <p>Months: ${booking.months}, Total: ₹${booking.totalPrice}</p>
      </div>
      `
    )
    .join('');
}

async function deleteRoom(roomId) {
  const response = await fetch(`/api/admin/rooms/${roomId}`, {
    method: 'DELETE',
    headers: { 'x-admin-token': adminToken }
  });

  if (!response.ok) {
    alert('Failed to delete room.');
    return;
  }

  fetchRooms();
}

document.getElementById('roomForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = document.getElementById('roomMsg');
  const payload = Object.fromEntries(new FormData(event.target).entries());

  payload.amenities = payload.amenities
    ? payload.amenities.split(',').map((item) => item.trim()).filter(Boolean)
    : [];

  const response = await fetch('/api/admin/rooms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-token': adminToken
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    message.className = 'error';
    message.textContent = result.message || 'Failed to add room';
    return;
  }

  message.className = 'success';
  message.textContent = 'Room added successfully';
  event.target.reset();
  fetchRooms();
});

fetchRooms();
fetchBookings();
