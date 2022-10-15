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

export interface FileRender {
	file: File;
	path: string[];
	commonName: string;
	blobURL: string;
}
export interface DirectoryRender {
	directory: FileSystemDirectoryHandle;
	location: {
		path: string[];
		fromRoot: boolean;
	};
}
