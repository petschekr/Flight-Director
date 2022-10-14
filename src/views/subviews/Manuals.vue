<template>
	<div class="h-full">
		<div v-if="overviewDisplayed === RenderType.Overview">
			<h1 class="text-2xl font-semibold text-gray-900">Manuals</h1>
			<h2 class="text-sm font-medium text-gray-500">Some subtitle text goes here</h2>
		</div>
		<CardList :files="files" v-if="overviewDisplayed === RenderType.Overview" />
		<File :file="fileRendered" v-if="overviewDisplayed === RenderType.File" />
		<FileList :items="directoryRendered" v-if="overviewDisplayed === RenderType.Directory" />
	</div>
</template>

<script setup lang="ts">
import { inject, ref, watch, computed, type Ref } from "vue";
import { useRouter, useRoute } from "vue-router";

import type { Configuration } from "@/models/configuration";
import type { DirectoryDisplay, FileDisplay, FileRender } from "@/models/file-explorer";

import CardList from "@/components/CardList.vue";
import File from "@/components/File.vue";
import FileList from "@/components/FileList.vue";

const configuration = inject<Ref<Configuration | null>>("configuration");
const rootDirectoryHandle = inject<Ref<FileSystemDirectoryHandle | null>>("rootDirectoryHandle");

const files = computed(() => {
	if (!configuration || !configuration.value) return [];
	return configuration.value["Manuals"].files;
});

enum RenderType {
	Overview, // Grid with file links
	File,
	Directory,
}
const overviewDisplayed: Ref<RenderType> = ref(RenderType.Overview);

const fileRendered: Ref<FileRender| null> = ref(null);
function setFileRendered(newFileRendered: FileRender) {
	// Unload the old object URL before creating a new one to prevent memory leaks
	if (fileRendered.value) {
		URL.revokeObjectURL(fileRendered.value.blobURL);
	}
	fileRendered.value = newFileRendered;
}
const directoryRendered: Ref<(FileDisplay | DirectoryDisplay)[]> = ref([]);

const router = useRouter();
const route = useRoute();
async function loadLocation() {
	if (!rootDirectoryHandle?.value) {
		overviewDisplayed.value = RenderType.Overview;
		return;
	}

	function stringToArray(input: string[] | string): string[] {
		if (Array.isArray(input)) return [...input];
		if (input === "") return [];
		return [input];
	}
	let filePath = stringToArray(route.params.path);
	filePath.shift(); // Remove first part of path that refers to selected sidebar tab
	if (filePath.length === 0) {
		overviewDisplayed.value = RenderType.Overview
		return;
	}
	let originalFilePath = [...filePath];

	let rootHandle: FileSystemDirectoryHandle = rootDirectoryHandle.value;
	let foundHandle: FileSystemDirectoryHandle | FileSystemFileHandle | null = null;
	while (filePath.length > 0) {
		foundHandle = null;
		let currentPathItem = filePath.shift();
		for await (const handle of rootHandle.values()) {
			if (handle.name === currentPathItem) {
				foundHandle = handle;
				break;
			}
		}
		if (!foundHandle) {
			// Specified file or folder not found
			alert(`Couldn't find file/directory: ${originalFilePath.join("/")}`);
			router.push("/" + route.params.path[0]); // Navigate to root of the tab
			return;
		}
		if (foundHandle.kind === "directory") {
			rootHandle = foundHandle;
		}
	}

	if (foundHandle?.kind === "directory") {
		overviewDisplayed.value = RenderType.Directory;

		let directoryRenderList: (FileDisplay | DirectoryDisplay)[] = [];
		for await (const item of foundHandle.values()) {
			if (item.kind === "directory") {
				let subitems = 0;
				for await (const subitem of item.values()) {
					subitems++;
				}
				directoryRenderList.push({
					kind: "directory",
					id: item.name,
					name: item.name,
					href: "", //subitems > 0 ? "/" + [...pathVisited, item.name].join("/") : "",
					subitems,
				});
			}
			else {
				const file = await item.getFile();
				directoryRenderList.push({
					kind: "file",
					id: item.name,
					name: item.name,
					href: "", //"/" + [...pathVisited, item.name].join("/"),
					lastModified: new Date(file.lastModified),
					size: file.size,
					type: file.type,
				});
			}
		}
		// Sort item list alphabetically by directory then by file
		directoryRenderList.sort((a, b) => {
			if (a.kind === "directory" && b.kind === "file") {
				return -1;
			}
			if (a.kind === "file" && b.kind === "directory") {
				return 1;
			}
			return a.name.localeCompare(b.name);
		});
		directoryRendered.value = directoryRenderList;
	}
	else if (foundHandle?.kind === "file") {
		overviewDisplayed.value = RenderType.File;

		let file = await foundHandle.getFile();
		// Find common name for this file from configuration's name for it
		let commonName = file.name;
		if (configuration?.value) {
			commonName = configuration.value["Manuals"].files.find(file => file.path === originalFilePath.join("/"))?.name ?? file.name;
		}

		let newFileRendered: FileRender = {
			file,
			path: originalFilePath,
			commonName,
			blobURL: URL.createObjectURL(file),
		};
		setFileRendered(newFileRendered);
	}
}
loadLocation().catch(err => console.error(err));
watch(() => route.params, loadLocation);

</script>
