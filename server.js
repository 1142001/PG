const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'admin123';
const DATA_FILE = path.join(__dirname, 'data', 'db.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const defaultData = {
  rooms: [
    {
      id: 'R1',
      name: 'Deluxe Single Room',
      location: 'Koramangala, Bengaluru',
      price: 8500,
      availableBeds: 2,
      amenities: ['WiFi', 'Food', 'Laundry']
    },
    {
      id: 'R2',
      name: 'Shared Double Room',
      location: 'HSR Layout, Bengaluru',
      price: 6500,
      availableBeds: 4,
      amenities: ['WiFi', 'Power Backup']
    }
  ],
  bookings: []
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
  }
}

function loadData() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Unauthorized admin request' });
  }
  return next();
}

app.get('/api/rooms', (_req, res) => {
  const data = loadData();
  res.json(data.rooms);
});

app.post('/api/bookings', (req, res) => {
  const { roomId, customerName, phone, checkInDate, months } = req.body;

  if (!roomId || !customerName || !phone || !checkInDate || !months) {
    return res.status(400).json({ message: 'Missing required booking fields' });
  }

  const data = loadData();
  const room = data.rooms.find((item) => item.id === roomId);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  if (room.availableBeds <= 0) {
    return res.status(400).json({ message: 'No beds available for this room' });
  }

  room.availableBeds -= 1;
  const booking = {
    id: `B${Date.now()}`,
    roomId,
    customerName,
    phone,
    checkInDate,
    months: Number(months),
    totalPrice: Number(months) * room.price,
    createdAt: new Date().toISOString()
  };

  data.bookings.push(booking);
  saveData(data);

  return res.status(201).json({ message: 'Booking created', booking });
});

app.get('/api/admin/bookings', requireAdmin, (_req, res) => {
  const data = loadData();
  res.json(data.bookings);
});

app.post('/api/admin/rooms', requireAdmin, (req, res) => {
  const { name, location, price, availableBeds, amenities } = req.body;

  if (!name || !location || !price || !availableBeds) {
    return res.status(400).json({ message: 'Missing required room fields' });
  }

  const data = loadData();
  const room = {
    id: `R${Date.now()}`,
    name,
    location,
    price: Number(price),
    availableBeds: Number(availableBeds),
    amenities: Array.isArray(amenities) ? amenities : []
  };

  data.rooms.push(room);
  saveData(data);

  return res.status(201).json({ message: 'Room added', room });
});

app.patch('/api/admin/rooms/:id', requireAdmin, (req, res) => {
  const data = loadData();
  const room = data.rooms.find((item) => item.id === req.params.id);

  if (!room) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const allowedFields = ['name', 'location', 'price', 'availableBeds', 'amenities'];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      room[field] = req.body[field];
    }
  });

  saveData(data);
  return res.json({ message: 'Room updated', room });
});

app.delete('/api/admin/rooms/:id', requireAdmin, (req, res) => {
  const data = loadData();
  const roomIndex = data.rooms.findIndex((item) => item.id === req.params.id);

  if (roomIndex === -1) {
    return res.status(404).json({ message: 'Room not found' });
  }

  const [deletedRoom] = data.rooms.splice(roomIndex, 1);
  saveData(data);

  return res.json({ message: 'Room deleted', room: deletedRoom });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`PG booking app running on http://localhost:${PORT}`);
});
