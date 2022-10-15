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
	"All Files": {
		files: File[]; // Just to satisfy type checker; TOML file does not contain this entry
	};
}
