# Guldbæk Tennisklub Website

Hugo website for Guldbæk Tennisklub, based on the `hugo-scroll` theme.

## Tech
- Hugo
- Theme: `themes/hugo-scroll` (git submodule)
- Content format: Markdown in `content/homepage/`

## Local Development

### Prerequisites
- Hugo extended installed locally

### Run
```bash
hugo server -D
```

Open the local URL printed by Hugo (normally `http://localhost:1313`).

## Build
```bash
hugo --minify
```

The generated site is output to `public/`.

## Content Editing
- Main sections are in `content/homepage/*.md`.
- Section order on the page is controlled by front matter `weight`.
- Site-wide settings (title, metadata, theme, etc.) are in `config.toml`.

## Booking Widget (Calendly)
- Booking section file: `content/homepage/book.md`
- The Calendly popup is embedded directly in that file.
- Update the Calendly link/options there if booking setup changes.

## Theme Submodule
This project uses a git submodule for the theme.

Initialize/update submodules after cloning:
```bash
git submodule update --init --recursive
```

## CMS
Forestry CMS was previously used for content editing:
- https://app.forestry.io/
