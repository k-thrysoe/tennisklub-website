# AGENTS.md

## Project Context
- This repository is the Hugo website for **Guldbæk Tennisklub**.
- The site is configured as a single-page style site using the `hugo-scroll` theme (`config.toml`).
- Booking is handled by a custom booking widget:
  - frontend in `content/homepage/book.md` + `static/js/booking-widget.js`
  - backend in `netlify/functions/bookings.js` using Netlify Blobs

## Stack And Structure
- Static site generator: Hugo
- Main config: `config.toml`
- Content pages: `content/homepage/*.md`
- Static assets: `static/`
- Site-specific template overrides: `layouts/partials/`
- Netlify functions: `netlify/functions/`
- Theme: git submodule at `themes/hugo-scroll`

## Run And Build
- Install function deps: `npm install`
- Start Hugo only: `hugo server -D`
- Start with functions: `npx netlify dev`
- Build production site: `hugo --minify`

## Editing Guidelines
- Keep section content in `content/homepage/` and control section order with front matter `weight`.
- Do not edit theme source unless a change cannot be done via site content/config.
- Booking UI text should remain Danish and use `da-DK` locale behavior.
- Keep booking validation rules aligned between frontend and backend:
  - hourly starts
  - duration 1-4 hours
  - no overlap

## Repository Hygiene
- `public/`, `resources/_gen/`, and local build artifacts should remain untracked.
- Keep `.gitignore` aligned with Hugo + Netlify + Node local files.
- Do not commit local IDE/system files.
