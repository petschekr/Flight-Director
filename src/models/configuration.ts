import type * as HeroIcons from '@heroicons/vue/24/outline';
export type IconName = keyof typeof HeroIcons;
export type Component = "FileList" | "AllFiles" | "Performance" | "ATLC" | "Settings" | "Spacer";

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

	sidebarTab: {
		component: Component;
		icon?: IconName;
		name?: string;
		href?: string;
		description?: string;
	}[];

	tabs: {
		[tabName: string]: {
			[fileGroup: string]: Card[];
		};
	};

	unsaved?: boolean;
}

export interface DragIndexEntry {
	name: string;
	multiple: boolean;
	drag: number;
}
export interface Performance {
	DAFIFLocation: string;

	Propeller: {
		feathered: number;
		unfeathered: number;
	};
	"Drag Index": DragIndexEntry[];
	"Glide Speed": {
		[dragIndex: string]: {
			weight: number;
			speed: number;
		}[];
	};
	"Glide Range": {
		[dragIndex: string]: {
			altitude: number;
			range: number;
		}[];
	}
}
