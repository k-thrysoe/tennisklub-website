# AGENTS.md

## Project Context
- This repository is the Hugo website for **Guldbæk Tennisklub**.
- The site is configured as a single-page style site using the `hugo-scroll` theme (`config.toml`).
- Booking is handled with an embedded Calendly popup widget in `content/homepage/book.md`.

## Stack And Structure
- Static site generator: Hugo
- Main config: `config.toml`
- Content pages: `content/homepage/*.md`
- Static assets: `static/`
- Theme: git submodule at `themes/hugo-scroll`

## Run And Build
- Start local dev server: `hugo server -D`
- Build production site: `hugo --minify`

## Editing Guidelines
- Keep section content in `content/homepage/` and control section order with front matter `weight`.
- Do not edit theme source unless a change cannot be done via site content/config.
- For booking updates, change only the Calendly URL/options in `content/homepage/book.md`.
- Keep `config.toml` as the source of truth for site-wide metadata and params.

## Repository Hygiene
- `public/` and Hugo generated artifacts should remain untracked.
- Keep `.gitignore` aligned with Hugo output and local development files.
- Do not commit local IDE/system files.
