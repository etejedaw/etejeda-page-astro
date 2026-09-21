export interface MenuLink {
	href: string;
	label: string;
	meta?: string;
	current?: boolean;
}

export interface MenuGroup {
	title?: string;
	links: MenuLink[];
}
