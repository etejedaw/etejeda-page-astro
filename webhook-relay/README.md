# ghost-deploy-relay

Cloudflare Worker que traduce el webhook de Ghost en un deploy del sitio.

Ghost no puede autenticarse ante GitHub (no manda headers custom). Este Worker
recibe el webhook, valida un secreto que viaja en la query string (`?key=`) y
dispara el workflow de deploy vía la API `repository_dispatch` de GitHub,
agregando el token requerido.

```
Ghost (post.published) --POST--> este Worker --repository_dispatch--> GitHub Actions --> wrangler deploy
```

Es un Worker **aparte** del sitio y se despliega **a mano** (no necesita CI). El
auto-deploy del sitio no lo toca: corre `wrangler deploy` desde la raíz del repo,
que lee el `wrangler.jsonc` de la raíz; esta carpeta la ignora.

## Deploy (una sola vez)

Desde esta carpeta (`webhook-relay/`):

```sh
# 1. Desplegar el Worker
npx wrangler deploy

# 2. Cargar los secretos (se guardan cifrados en Cloudflare, no en el código)
npx wrangler secret put GITHUB_TOKEN     # PAT fine-grained, este repo, Contents: write
npx wrangler secret put WEBHOOK_SECRET   # string aleatorio; el mismo va en la URL de Ghost
```

La primera vez `wrangler` pedirá login en el navegador. El deploy imprime la URL
pública, algo como `https://ghost-deploy-relay.<subdominio>.workers.dev`.

## Configurar el webhook en Ghost

Ghost Admin -> Settings -> Integrations -> Add custom integration -> Add webhook:

- **Event:** Post published (opcional: también updated / unpublished / deleted)
- **Target URL:** la URL del Worker con el secreto en la query:
  `https://ghost-deploy-relay.<subdominio>.workers.dev/?key=<WEBHOOK_SECRET>`
- **Secret:** dejar vacío (no se usa; el secreto va en la URL)

## Probar

Publica un post de prueba y verifica que corre el Action:

```sh
gh run list --limit 1
```

Si responde 403, el `key` de la URL en Ghost y el `WEBHOOK_SECRET` del Worker no
coinciden. Si el Action no arranca, revisa que el token tenga permiso
`Contents: write` y acceso a este repo.
