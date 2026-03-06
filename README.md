# Guldbæk Tennisklub Website

Hugo website for Guldbæk Tennisklub, based on the `hugo-scroll` theme.

## Tech
- Hugo
- Theme: `themes/hugo-scroll` (git submodule)
- Content format: Markdown in `content/homepage/`
- Booking backend: Netlify Function + Netlify Blobs
- Booking frontend: Vanilla JS + Flatpickr

## Local Development

### Prerequisites
- Hugo extended installed locally
- Node.js (for Netlify function dependencies)
- Netlify CLI (recommended for function testing)

Install dependencies:
```bash
npm install
```

### Run Hugo only
```bash
hugo server -D
```

### Run with Netlify functions (recommended)
```bash
npx netlify dev
```

Open the local URL printed by Netlify (typically `http://localhost:8888`).

## Build
```bash
hugo --minify
```

The generated site is output to `public/`.

## Content Editing
- Main sections are in `content/homepage/*.md`.
- Section order on the page is controlled by front matter `weight`.
- Site-wide settings (title, metadata, theme, etc.) are in `config.toml`.

## Booking Widget
- Booking section file: `content/homepage/book.md`
- Frontend script: `static/js/booking-widget.js`
- Styling/includes: `layouts/partials/custom_head.html` and `layouts/partials/custom_body.html`
- Backend API: `netlify/functions/bookings.js`

Behavior:
- Danish booking interface (`da-DK` locale)
- Hourly starts (`00:00` to `23:00`)
- Duration dropdown `1-4` hours
- Required fields: name and phone
- Name is shown publicly in booking list for a day
- Overlapping bookings are blocked server-side

## Netlify Config
- `netlify.toml` points functions to `netlify/functions`.
- Booking data is stored in Netlify Blobs store `tennisklub-bookings`.

## Theme Submodule
This project uses a git submodule for the theme.

Initialize/update submodules after cloning:
```bash
git submodule update --init --recursive
```
