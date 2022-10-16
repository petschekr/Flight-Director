export interface File {
	name: string;
	description: string;
	abbreviation: string;
	color: string;
	path: string;
	searchTerms?: string; // Comma separated
}

export interface Configuration {
	root: string;
	callsigns: string[];

	tabs: {
		// name: string;
		// files: File[];
		"Daily Ops": {
			files: File[];
		};
		"Manuals": {
			files: File[];
		};
		"Operational Reference": {
			files: File[];
		};
		"Other": {
			files: File[];
		};
	};
}
