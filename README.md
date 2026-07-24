# etejeda.dev

Personal site and portfolio built with [Astro](https://astro.build). It is a
fully static site; the blog content is pulled from a self-hosted
[Ghost](https://ghost.org) CMS at build time via `GHOST_URL` and
`GHOST_CONTENT_API_KEY`.

## Commands

All commands are run from the root of the project, from a terminal:

| Command           | Action                                      |
| :---------------- | :------------------------------------------ |
| `npm install`     | Installs dependencies                       |
| `npm run dev`     | Starts local dev server at `localhost:4321` |
| `npm run build`   | Build the production site to `./dist/`      |
| `npm run preview` | Preview the build locally, before deploying |
| `npm run lint`    | Run ESLint with `--fix`                     |
| `npm run format`  | Run Prettier over the project               |

## Deployment

### Current: Cloudflare Workers (static assets)

The site is served as a Cloudflare Worker using Workers Static Assets (not
Cloudflare Pages). `wrangler.jsonc` defines the Worker (`name`, and `assets`
pointing to `./dist`).

Deploys run automatically via GitHub Actions (`.github/workflows/deploy.yml`) on
every push to `main`: the workflow builds with `astro build` and runs
`wrangler deploy` (Direct Upload, so Cloudflare never accesses the repo). The
same workflow can be triggered manually (`workflow_dispatch`) or externally
(`repository_dispatch`, see below).

HTTP response headers (security and caching) live in `public/_headers`, which
Cloudflare applies to the deployed assets. This replaces the header rules that
used to live in `nginx.conf`.

### Ghost publish triggers a redeploy (webhook relay)

Because posts are pulled at build time, publishing a new post requires a
rebuild. `webhook-relay/` is a small separate Cloudflare Worker that bridges
Ghost and GitHub:

1. Ghost fires a webhook on `post.published` to the relay.
2. The relay validates a shared secret passed in the query string (`?key=`).
3. It calls the GitHub `repository_dispatch` API, which runs the site deploy
   workflow.

The relay auto-deploys via `.github/workflows/deploy-relay.yml` when files under
`webhook-relay/` change. Its secrets (`GITHUB_TOKEN`, `WEBHOOK_SECRET`) are set
once in the Cloudflare dashboard and persist across deploys. See
`webhook-relay/README.md` for setup details.

### Legacy: CapRover / Docker (no longer used)

The site used to run on a VPS with CapRover: a Docker image (`Dockerfile`) served
by nginx (`nginx.conf`), described by `captain-definition`. These files are kept
for reference and as a fallback, but they are not part of the current Cloudflare
deploy. `.dockerignore` excludes the Cloudflare-only files (`public/_headers`,
`webhook-relay`, `.github`) from that build so they never end up in the nginx
image.
