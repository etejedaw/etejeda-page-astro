import { getCollection } from "astro:content";
import type { MenuGroup } from "./menu";

interface SortableProject {
	title: string;
	year?: string;
}

export function byYearDesc(a: SortableProject, b: SortableProject): number {
	return (
		(b.year ?? "").localeCompare(a.year ?? "") ||
		a.title.localeCompare(b.title)
	);
}

export async function getProjectsMenu(
	currentSlug?: string
): Promise<MenuGroup[]> {
	const projects = await getCollection("projects", ({ data }) => !data.draft);
	const groups = new Map<string, MenuGroup>();

	for (const project of projects.sort((a, b) => byYearDesc(a.data, b.data))) {
		const slug = project.id.replace(/\.md$/, "");
		const year = project.data.year ?? "Otros";
		const group = groups.get(year) ?? { title: year, links: [] };
		group.links.push({
			href: `/projects/${slug}`,
			label: project.data.title,
			meta: project.data.category,
			current: slug === currentSlug
		});
		groups.set(year, group);
	}

	return [...groups.values()];
}
