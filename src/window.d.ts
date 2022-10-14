export { };

declare global {
	interface DirectoryPickerOptions {
		id: string;
		mode: "read" | "readwrite";
		startIn: "desktop" | "documents" | "downloads" | "music" | "pictures" | "videos";
	}

	interface FileSystemDirectoryHandle {
		entries(): AsyncIterableIterator<[string, FileSystemDirectoryHandle | FileSystemFileHandle]>;
		keys(): AsyncIterableIterator<string>;
		values(): AsyncIterableIterator<FileSystemDirectoryHandle | FileSystemFileHandle>;
	}

	interface Window {
		showDirectoryPicker(options?: Partial<DirectoryPickerOptions>): Promise<FileSystemDirectoryHandle>;
	}
}
