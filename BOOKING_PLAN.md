# Replace Calendly With Lightweight Netlify-Backed Booking Widget

## Summary
Build a custom booking widget directly in the Hugo frontend, backed by one Netlify Function using Netlify Blobs for persistent booking state.

Key UX:
- Flatpickr date picker
- Hourly start-time selection
- Duration dropdown (`1-4` hours, default `1`)
- Form fields: name and phone
- Public schedule showing booked slots with booker name
- Server-side overlap blocking
- Interface language/locale: Danish (`da-DK`)

## Decisions
- Hosting/runtime: Netlify + Hugo
- Storage: Netlify Blobs
- Timezone policy: Europe/Copenhagen
- Start-time granularity: hourly
- Booking horizon: no max future limit
- Conflict policy: hard block
- Public visibility: show booker name
- Admin operations: manual in Netlify (no auth/admin UI)

## Main Components
1. `content/homepage/book.md`
- Replace Calendly embed with booking widget root and short privacy note.

2. `layouts/partials/custom_head.html`
- Include Flatpickr CSS and custom airy widget styles.

3. `layouts/partials/custom_body.html`
- Include Flatpickr JS, Danish locale JS, and widget script.

4. `static/js/booking-widget.js`
- Render booking form and booking list.
- Call Netlify function to fetch/create bookings.
- Show Danish UI copy and validation errors.

5. `netlify/functions/bookings.js`
- `GET /.netlify/functions/bookings?date=YYYY-MM-DD`
- `POST /.netlify/functions/bookings`
- Validate payload, block overlaps, persist to Blob.

6. `netlify.toml`
- Set function directory to `netlify/functions`.

## API Contract
### GET
- Path: `/.netlify/functions/bookings?date=YYYY-MM-DD`
- Response: `{ timezone, bookings: [{ id, date, startHour, durationHours, name }] }`

### POST
- Path: `/.netlify/functions/bookings`
- Request: `{ date, startHour, durationHours, name, phone }`
- Response: `{ ok, booking, bookings }`

## Validation Rules
- Date format: `YYYY-MM-DD`
- Start hour: integer `0..23`
- Duration: integer `1..4`
- Booking cannot pass midnight
- Name and phone are required
- No overlapping bookings on the same date

## Test Scenarios
1. Widget loads with Danish labels and date picker locale.
2. Default duration is 1 hour.
3. Valid booking is stored and visible after refresh.
4. Overlapping booking returns conflict error.
5. Adjacent booking is allowed.
6. Invalid input is rejected by server.
7. Layout works on desktop and mobile.
