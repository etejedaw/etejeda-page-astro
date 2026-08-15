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
