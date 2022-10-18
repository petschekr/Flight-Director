export interface File {
	name: string;
	description: string;
	abbreviation: string;
	color: string;
	path: string;
	searchTerms?: string; // Comma separated
}

export interface Configuration {
	callsigns: {
		callsign: string;
		path: string;
	}[];

	tabs: {
		// name: string;
		// files: File[];
		"Daily Ops": {
			[fileGroup: string]: File[];
		};
		"Manuals": {
			[fileGroup: string]: File[];
		};
		"Operational Reference": {
			[fileGroup: string]: File[];
		};
		"Other": {
			[fileGroup: string]: File[];
		};
	};
}
