const GHOST_URL = import.meta.env.GHOST_URL;
const GHOST_KEY = import.meta.env.GHOST_CONTENT_API_KEY;

if (!GHOST_URL || !GHOST_KEY) {
	throw new Error(
		"Faltan las variables de entorno GHOST_URL y/o GHOST_CONTENT_API_KEY"
	);
}

const API_BASE = `${GHOST_URL}/ghost/api/content`;

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

async function ghostFetch(
	endpoint: string,
	params: Record<string, string> = {}
): Promise<GhostResponse> {
	const searchParams = new URLSearchParams({ key: GHOST_KEY, ...params });
	const res = await fetch(`${API_BASE}/${endpoint}?${searchParams}`);
	if (!res.ok) throw new Error(`Ghost API error: ${res.status}`);
	return res.json();
}

export async function getRecentPosts(limit = 3): Promise<GhostPost[]> {
	const data = await ghostFetch("posts", {
		limit: String(limit),
		include: "tags",
		fields: "id,title,slug,excerpt,url,feature_image,feature_image_alt,published_at"
	});
	return data.posts;
}

export async function getTotalPosts(): Promise<number> {
	const data = await ghostFetch("posts", { limit: "1" });
	return data.meta.pagination.total;
}

export async function getPostCountByTag(tagSlug: string): Promise<number> {
	const data = await ghostFetch("posts", {
		limit: "1",
		filter: `tag:${tagSlug}`
	});
	return data.meta.pagination.total;
}

export type { GhostPost };
