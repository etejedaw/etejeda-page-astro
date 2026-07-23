interface Env {
	GITHUB_TOKEN: string;
	WEBHOOK_SECRET: string;
}

const REPO = "etejedaw/etejeda-page-astro";
const EVENT_TYPE = "ghost-publish";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method !== "POST")
			return new Response("Method not allowed", { status: 405 });

		const url = new URL(request.url);
		if (url.searchParams.get("key") !== env.WEBHOOK_SECRET)
			return new Response("Forbidden", { status: 403 });

		const res = await fetch(
			`https://api.github.com/repos/${REPO}/dispatches`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${env.GITHUB_TOKEN}`,
					Accept: "application/vnd.github+json",
					"User-Agent": "ghost-deploy-relay",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ event_type: EVENT_TYPE })
			}
		);

		if (!res.ok)
			return new Response(`GitHub dispatch failed: ${res.status}`, {
				status: 502
			});

		return new Response("Deploy triggered", { status: 202 });
	}
} satisfies ExportedHandler<Env>;
