export interface File {
	name: string;
	description: string;
	abbreviation: string;
	color: string;
	path: string;
}

export interface Configuration {
	"Daily Ops": {
		callsigns: string[];
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
}
