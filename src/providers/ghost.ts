const GHOST_URL = import.meta.env.GHOST_URL;
const GHOST_KEY = import.meta.env.GHOST_CONTENT_API_KEY;

interface GhostPost {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	url: string;
	feature_image: string | null;
	feature_image_alt: string | null;
	published_at: string;
	tags: { name: string; slug: string }[];
}

interface GhostResponse {
	posts: GhostPost[];
	meta: { pagination: { total: number } };
}

const cache = new Map<string, Promise<GhostResponse | null>>();

function ghostFetch(
	endpoint: string,
	params: Record<string, string> = {}
): Promise<GhostResponse | null> {
	if (import.meta.env.DEV) return request(endpoint, params);

	const key = `${endpoint}?${new URLSearchParams(params)}`;
	let pending = cache.get(key);
	if (!pending) {
		pending = request(endpoint, params);
		cache.set(key, pending);
	}
	return pending;
}

async function request(
	endpoint: string,
	params: Record<string, string>
): Promise<GhostResponse | null> {
	if (!GHOST_URL || !GHOST_KEY) {
		console.warn(
			"[ghost] Faltan GHOST_URL y/o GHOST_CONTENT_API_KEY, se omite el blog"
		);
		return null;
	}

	const searchParams = new URLSearchParams({ key: GHOST_KEY, ...params });
	try {
		const res = await fetch(
			`${GHOST_URL}/ghost/api/content/${endpoint}?${searchParams}`
		);
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		return await res.json();
	} catch (error) {
		const reason = error instanceof Error ? error.message : error;
		console.warn(`[ghost] No se pudo consultar ${endpoint}: ${reason}`);
		return null;
	}
}

export async function getRecentPosts(limit = 3): Promise<GhostPost[] | null> {
	const data = await ghostFetch("posts", {
		limit: String(limit),
		include: "tags",
		fields: "id,title,slug,excerpt,url,feature_image,feature_image_alt,published_at"
	});
	return data?.posts ?? null;
}

export async function isBlogAvailable(): Promise<boolean> {
	const posts = await getRecentPosts();
	return posts !== null && posts.length > 0;
}

export async function getTotalPosts(): Promise<number | null> {
	const data = await ghostFetch("posts", { limit: "1" });
	return data?.meta.pagination.total ?? null;
}

export async function getPostCountByTag(
	tagSlug: string
): Promise<number | null> {
	const data = await ghostFetch("posts", {
		limit: "1",
		filter: `tag:${tagSlug}`
	});
	return data?.meta.pagination.total ?? null;
}

export type { GhostPost };
