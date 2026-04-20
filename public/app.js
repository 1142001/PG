async function loadRooms() {
  const container = document.getElementById('rooms');
  const response = await fetch('/api/rooms');
  const rooms = await response.json();

  container.innerHTML = rooms
    .map(
      (room) => `
      <div class="card">
        <h3>${room.name}</h3>
        <p><strong>ID:</strong> ${room.id}</p>
        <p><strong>Location:</strong> ${room.location}</p>
        <p><strong>Price:</strong> ₹${room.price}/month</p>
        <p><strong>Available Beds:</strong> ${room.availableBeds}</p>
        <p><strong>Amenities:</strong> ${room.amenities.join(', ')}</p>
      </div>
    `
    )
    .join('');
}

document.getElementById('bookingForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.target;
  const message = document.getElementById('bookingMsg');

  const payload = Object.fromEntries(new FormData(form).entries());

  const response = await fetch('/api/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    message.className = 'error';
    message.textContent = result.message || 'Booking failed';
    return;
  }

  message.className = 'success';
  message.textContent = `${result.message}. Booking ID: ${result.booking.id}`;
  form.reset();
  loadRooms();
});

loadRooms();
