<template>
	<Breadcrumbs v-if="path.length > 0" class="mb-6" :path="path" />
	<!-- <FileList v-if="hasPermissions" :items="items" /> -->
</template>

<script setup lang="ts">
import { reactive, ref, watch, type Ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import FileList from "@/components/FileList.vue";
import Breadcrumbs from "@/components/Breadcrumbs.vue";

import type { FileDisplay, DirectoryDisplay, PathItem } from "@/models/file-explorer";

const router = useRouter();
const route = useRoute();

const path: Ref<PathItem[]> = ref([]);
const items: Ref<(FileDisplay | DirectoryDisplay)[]> = ref([]);

function stringToArray(input: string[] | string): string[] {
	if (Array.isArray(input)) return input;
	if (input === "") return [];
	return [input];
}


async function loadFiles(handle: FileSystemDirectoryHandle, pathToVisit: string[], pathVisited: string[] = []) {
	if (!hasPermissions) return;

	async function* getFilesRecursively(entry: FileSystemDirectoryHandle | FileSystemFileHandle): AsyncIterableIterator<File> {
		if (entry.kind === "file") {
			try {
				const file = await entry.getFile();
				yield file;
			}
			catch (err) {
				console.error("Oops error", err);
			}
		}
		else if (entry.kind === "directory") {
			for await (const handle of entry.values()) {
				yield* getFilesRecursively(handle);
			}
		}
	}

	let currentPathItem = pathToVisit.shift();
	if (!currentPathItem) {
		// Clear previously displayed path and items
		path.value = pathVisited.map((pathItem, index) => {
			return {
				name: pathItem,
				href: "/" + pathVisited.slice(0, index + 1).join("/"),
			};
		});
		items.value = [];
		let newItems: (FileDisplay | DirectoryDisplay)[] = [];

		for await (const item of handle.values()) {
			if (item.kind === "directory") {
				let subitems = 0;
				for await (const subitem of item.values()) {
					subitems++;
				}
				newItems.push({
					kind: "directory",
					id: item.name,
					name: item.name,
					href: subitems > 0 ? "/" + [...pathVisited, item.name].join("/") : "",
					subitems,
				});
			}
			else {
				const file = await item.getFile();
				newItems.push({
					kind: "file",
					id: item.name,
					name: item.name,
					href: "/" + [...pathVisited, item.name].join("/"),
					lastModified: new Date(file.lastModified),
					size: file.size,
					type: file.type,
				});
			}
		}
		// Sort item list alphabetically by directory then by file
		newItems.sort((a, b) => {
			if (a.kind === "directory" && b.kind === "file") {
				return -1;
			}
			if (a.kind === "file" && b.kind === "directory") {
				return 1;
			}
			return a.name.localeCompare(b.name);
		});
		items.value = newItems;
	}
	else {
		let found = false;
		for await (const item of handle.values()) {
			if (item.name === currentPathItem) {
				if (item.kind === "directory") {
					pathVisited.push(item.name);
					loadFiles(item, pathToVisit, pathVisited);
					found = true;
					break;
				}
				else if (item.kind === "file") {
					// Show file
					// alert("Unimplemented!");
					found = true;
					break;
				}
			}
		}
		if (!found) {
			alert("Invalid path, loading root");
			router.push("/");
		}
	}
}

watch(() => route.params, () => {
	if (!hasPermissions || !rootDirectoryHandle.value) return;
	loadFiles(rootDirectoryHandle.value, stringToArray(route.params.path));
});

</script>
