# PG Booking Web Application

A simple web application for PG/room booking with an admin panel.

## Features

- View available PG rooms.
- Book a room with customer details and check-in date.
- Admin panel to:
  - Add rooms
  - View all bookings
  - Delete rooms
- Token-protected admin APIs (`x-admin-token` header).
- JSON file storage (`data/db.json`) for quick setup.

## Tech Stack

- Node.js
- Express
- Vanilla HTML/CSS/JavaScript

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

3. Open:
   - Booking UI: `http://localhost:3000`
   - Admin panel: `http://localhost:3000/admin.html`

## Configuration

- `PORT` (default: `3000`)
- `ADMIN_TOKEN` (default: `admin123`)

Example:

```bash
ADMIN_TOKEN=my-secret-token npm start
```

## API Endpoints

### Public

- `GET /api/rooms` – list rooms
- `POST /api/bookings` – create booking

### Admin (requires `x-admin-token`)

- `GET /api/admin/bookings` – list bookings
- `POST /api/admin/rooms` – add room
- `PATCH /api/admin/rooms/:id` – update room
- `DELETE /api/admin/rooms/:id` – delete room
