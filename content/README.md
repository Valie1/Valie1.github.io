# VALIE Content

The public portfolio is driven by `content/portfolio.json`.

## Editing content

Edit `content/portfolio.json` directly, then run:

```bash
npm run content:check
```

## Publishing

- `published` projects are visible on the portfolio.
- `draft` projects remain hidden from the public site.
- `order` controls the public sequence.

## Media

Use optimized local files under `public/media/` or deployed CDN/object-storage URLs for large final video.

## SEO

Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain before building or deploying.
