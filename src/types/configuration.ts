import type * as HeroIcons from '@heroicons/vue/24/outline';
export type IconName = keyof typeof HeroIcons;

export namespace Sidebar {
	export type Tab = FileList | AllFiles | Performance | ATLC | Cavok | Settings;
	export type Entry = Tab | Spacer;
	interface CommonTab {
		component: string;
		icon: IconName;
		name: string;
		href: string;
	}
	export interface FileList extends CommonTab {
		component: "FileList";
		description: string;
	}
	export interface AllFiles extends CommonTab {
		component: "AllFiles";
	}
	export interface Performance extends CommonTab {
		component: "Performance";
	}
	export interface ATLC extends CommonTab {
		component: "ATLC";
	}
	export interface Cavok extends CommonTab {
		component: "Cavok";
		cavokDomain: string;
		cavokChannel: string;
	}
	export interface Settings extends CommonTab {
		component: "Settings";
	}
	export interface Spacer {
		component: "Spacer";
	}
}

export interface Card {
	name: string;
	description: string;
	abbreviation: string;
	color: string;
	type?: "Local" | "SharePoint" | "Markdown";
	path?: string;
	rawPath?: string;
	sharePoint?: {
		baseUrl: string;
		collection: {
			type: "List" | "Folder";
			name: string;
		};
		multiple: boolean;
		searchExpression: string;
		searchSize: number;
		cachePath: string;
	};
	markdown?: {
		template: string;
	};
	searchTerms?: string; // Comma separated
}

export interface Configuration {
	name?: string;

	feedbackLocation: string;

	callsigns: {
		callsign: string;
		path: string;
	}[];

	sidebarTab: Sidebar.Entry[];

	tabs: {
		[tabName: string]: {
			[fileGroup: string]: Card[];
		};
	};

	unsaved?: boolean;
}
