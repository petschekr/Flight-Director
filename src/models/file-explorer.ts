interface Display {
	id: string | number;
	kind: "file" | "directory";
	href: string;
}

export interface FileDisplay extends Display {
	kind: "file";
	name: string;
	type: string;
	size: number;
	lastModified: Date;
}
export interface DirectoryDisplay extends Display {
	kind: "directory";
	name: string;
	subitems: number;
}

export interface FileFromAPI {
	kind: "file";
	name: string;
	lastModified: number;
	size: number;
	type: string;
}
export interface DirectoryFromAPI {
	kind: "directory";
	name: string;
}

export interface FileRender {
	file: FileFromAPI;
	path: string[];
	commonName: string;
}
export interface DirectoryRender {
	directory: (FileFromAPI | DirectoryFromAPI)[];
	location: {
		path: string[];
		fromRoot: boolean;
	};
}
