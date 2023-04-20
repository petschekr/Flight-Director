<template>
	<div v-for="fileGroup in fileGroups" :key="fileGroup.groupName" class="">
		<div class="relative mt-2">
			<div class="absolute inset-0 top-1 flex items-center" aria-hidden="true">
				<div v-if="!editMode" class="w-full border-t border-gray-300" />
			</div>
			<div class="relative flex justify-start">
				<span v-if="!editMode" class="bg-gray-100 pr-3 text-lg font-medium text-gray-900">{{fileGroup.groupName}}</span>
				<input v-if="editMode" type="text" :value="fileGroup.groupName" @keydown.enter="($event.target as HTMLInputElement).blur()" @blur="updateGroupName(fileGroup.groupName, $event)"
					class="rounded-md bg-gray-50 border-gray-300 shadow-sm font-medium text-gray-900 focus:border-sky-500 focus:ring-sky-500" />
				<ChevronUpIcon v-if="editMode" @click="moveGroup(fileGroup.groupName, 'up')"
					class="w-8 h-8 px-1 ml-1 self-center rounded-full text-gray-400 cursor-pointer transition-colors hover:bg-gray-200" />
				<ChevronDownIcon v-if="editMode" @click="moveGroup(fileGroup.groupName, 'down')"
					class="w-8 h-8 px-1 ml-1 self-center rounded-full text-gray-400 cursor-pointer transition-colors hover:bg-gray-200" />
			</div>
		</div>
		<ul role="list" class="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
			<li v-for="file in fileGroup.files" :key="file.name" :class="[editMode ? 'disable-child-pointer-events' : '', 'col-span-1 flex rounded-md shadow-sm transition hover:shadow-md h-24']"
				@click="editMode && openEditPanel(file, fileGroup.groupName, fileGroup.tabName)"
				:draggable="editMode ? 'true' : 'false'"
				@dragstart="dragStart($event, fileGroup.groupName, file.name)" @dragend="dragEnd"
				@dragover.prevent @dragenter="dragEnter" @dragleave="dragLeave" @drop="drop($event, fileGroup.groupName, file.name)">
				<!-- External links need an <a> -->
				<a v-if="isExternal(file)" :href="file.path" target="_blank" class="contents">
					<Card :file="file" />
				</a>
				<!-- Internal links can be handled with the Vue router -->
				<RouterLink v-if="!isExternal(file)" :to="getPath(file.name)" class="contents">
					<Card :file="file" />
				</RouterLink>
			</li>
			<!-- New card button appears in edit mode -->
			<li v-if="editMode" :class="[editMode ? 'disable-child-pointer-events' : '', 'col-span-1 flex rounded-md h-24 mb-4 transition border-4 border-dashed border-gray-300 hover:border-solid cursor-pointer hover:scale-105']"
				@click="editMode && openEditPanel(null, fileGroup.groupName, fileGroup.tabName)"
				@dragover.prevent @dragenter="dragEnter" @dragleave="dragLeave" @drop="drop($event, fileGroup.groupName)">
				<a class="contents">
					<div class="flex flex-1 items-center justify-center">
						<SquaresPlusIcon class="h-12 w-12 text-gray-300" />
					</div>
				</a>
			</li>
		</ul>
	</div>

	<div v-if="editMode" class="relative mt-2">
		<div class="absolute inset-0 top-1 flex items-center" aria-hidden="true">
			<div class="w-full border-t border-gray-300" />
		</div>
		<div class="relative flex justify-start">
			<input type="text" placeholder="New group" @keydown.enter="($event.target as HTMLInputElement).blur()" @blur="addGroupName($event)"
					class="rounded-md bg-gray-100 border-gray-300 shadow-sm font-medium text-gray-900 focus:border-sky-500 focus:ring-sky-500" />
		</div>
	</div>

	<EditCard :file="editPanelFile" :group-name="editPanelGroupName" :tab-name="editPanelTabName" :open="editPanelOpen" @closed="editPanelOpen = false" />
</template>

<style>
	/* Prevents every card's children elements from triggering dragenter/leave events */
	.disable-child-pointer-events * {
		pointer-events: none;
	}
</style>

<script setup lang="ts">
import { inject, type Ref, ref } from "vue";
import { useRoute } from "vue-router";

import type { File, Configuration } from "@/models/configuration";

import { SquaresPlusIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/24/outline";

import Card from "@/components/Card.vue";
import EditCard from "@/components/EditCard.vue";

const props = defineProps<{
	fileGroups: {
		tabName: string;
		groupName: string;
		files: File[];
	}[];
	tabName: string;
}>();

const configuration = inject<Ref<Configuration | null>>("configuration");
const openAlert = inject<(title: string, message: string, okText?: string) => Promise<void>>("openAlert");
const openConfirm = inject<(title: string, message: string, confirmText?: string, cancelText?: string) => Promise<boolean>>("openConfirm");

const editMode = inject<Ref<boolean>>("editMode");
const editPanelOpen: Ref<boolean> = ref(false);
const editPanelFile: Ref<File | null> = ref(null);
const editPanelGroupName: Ref<string | null> = ref(null);
const editPanelTabName: Ref<string | null> = ref(null);

const route = useRoute();

function getPath(filePath: string): string {
	// Make a root path for browser and append to the current tab name
	return "/" + route.params.path[0] + "/" + encodeURIComponent(filePath);
}
function isExternal(file: File): boolean {
	return file.path?.startsWith("http") ?? false;
}
function openEditPanel(file: File | null, groupName: string, tabName: string) {
	editPanelFile.value = file;
	editPanelGroupName.value = groupName;
	editPanelTabName.value = tabName;
	editPanelOpen.value = true;
}
async function updateGroupName(oldGroupName: string, event: Event) {
	if (!configuration?.value || !openAlert || !openConfirm) return;
	const inputElement = event.target as HTMLInputElement;
	let newGroupName = inputElement.value.trim();
	if (newGroupName === oldGroupName) return;
	if (!newGroupName) {
		if (!await openConfirm("Delete this group?", "Are you sure you want to delete this group?")) return;
	}
	if (configuration.value.tabs[props.tabName][newGroupName]) {
		await openAlert("Invalid name", "A group with that name already exists!");
		inputElement.value = oldGroupName;
		return;
	}

	let newTabContents = {};
	for (let [groupName, group] of Object.entries(configuration.value.tabs[props.tabName])) {
		if (groupName !== oldGroupName) {
			// Copy as-is
			Object.assign(newTabContents, { [groupName]: group });
		}
		else {
			if (newGroupName) {
				// Rename and add
				Object.assign(newTabContents, { [newGroupName]: group });
			}
			// If newGroupName is blank, content is deleted
		}
	}
	configuration.value.tabs[props.tabName] = newTabContents;
	configuration.value.unsaved = true;
}
async function addGroupName(event: Event) {
	if (!configuration?.value || !openAlert) return;
	const inputElement = event.target as HTMLInputElement;
	let newGroupName = inputElement.value.trim();
	if (!newGroupName) {
		return;
	}
	if (configuration.value.tabs[props.tabName][newGroupName]) {
		await openAlert("Invalid name", "A group with that name already exists!");
		inputElement.focus();
		return;
	}
	Object.assign(configuration.value.tabs[props.tabName], { [newGroupName]: [] });
	inputElement.value = "";
	configuration.value.unsaved = true;
}
function moveGroup(moveGroupName: string, direction: "up" | "down") {
	if (!configuration?.value) return;

	let newTabContents = {};
	let buffer: [string, File[]] | null = null; // Holds a card object as it gets moved around between loop iterations
	for (let [groupName, group] of Object.entries(configuration.value.tabs[props.tabName])) {
		if (direction === "up") {
			if (groupName === moveGroupName) {
				if (direction === "up" && buffer === null) {
					// If buffer is empty, this group is already first
					return;
				}
				Object.assign(newTabContents, { [groupName]: group });
			}
			else {
				if (buffer !== null) {
					Object.assign(newTabContents, { [buffer[0]]: buffer[1] });
				}
				buffer = [groupName, group];
			}
		}
		else if (direction === "down") {
			if (groupName === moveGroupName) {
				buffer = [groupName, group]; // Save for next iteration
			}
			else {
				Object.assign(newTabContents, { [groupName]: group });
				if (buffer !== null) {
					Object.assign(newTabContents, { [buffer[0]]: buffer[1] });
				}
			}
		}
	}
	// Add any leftover buffer contents to the end
	if (buffer !== null) {
		Object.assign(newTabContents, { [buffer[0]]: buffer[1] });
	}

	configuration.value.tabs[props.tabName] = newTabContents;
	configuration.value.unsaved = true;
}

let currentDragItem: HTMLElement | null = null;
const dragSourceActiveStyles = ["opacity-50"];
const dragTargetActiveStyles = ["opacity-80", "scale-90"];

function dragStart(e: DragEvent, groupName: string, title: string) {
	let target = e.currentTarget as HTMLElement;
	if (!e.dataTransfer) return;

	currentDragItem = target;

	target.classList.add(...dragSourceActiveStyles);

	e.dataTransfer.effectAllowed = "move";
	e.dataTransfer.setData("text/plain", title);
	e.dataTransfer.setData("flightdirector/card", "");
	e.dataTransfer.setData("tabName", props.tabName);
	e.dataTransfer.setData("groupName", groupName);
	e.dataTransfer.setData("title", title);
}
function dragEnd(e: DragEvent) {
	let target = e.currentTarget as HTMLElement;

	currentDragItem = null;

	target.classList.remove(...dragSourceActiveStyles);
}
function dragEnter(e: DragEvent) {
	let target = e.currentTarget as HTMLElement;
	if (target === currentDragItem) return; // Don't react to being dragged over self
	if (!e.dataTransfer?.types.includes("flightdirector/card")) return;

	target.classList.add(...dragTargetActiveStyles);
}
function dragLeave(e: DragEvent) {
	let target = e.currentTarget as HTMLElement;
	if (target === currentDragItem) return; // Don't react to being dragged over self
	if (!e.dataTransfer?.types.includes("flightdirector/card")) return;

	target.classList.remove(...dragTargetActiveStyles);
}
function drop(e: DragEvent, targetGroupName: string, targetTitle?: string) {
	let target = e.currentTarget as HTMLElement;
	if (target === currentDragItem) return; // Don't react to being dropped on self
	if (!e.dataTransfer?.types.includes("flightdirector/card")) return;
	if (!configuration?.value) return;

	target.classList.remove(...dragTargetActiveStyles);

	const sourceGroupName = e.dataTransfer.getData("groupName");
	const sourceTitle = e.dataTransfer.getData("title");

	let sourceIndex = configuration.value.tabs[props.tabName][sourceGroupName].findIndex(file => file.name === sourceTitle);
	if (sourceIndex === -1) {
		console.error("Dragged card doesn't exist in configuration(?)");
		return;
	}
	let targetIndex = configuration.value.tabs[props.tabName][targetGroupName].findIndex(file => file.name === targetTitle);
	if (targetIndex === -1) {
		// If dropped onto new card area, there is no existing card
		targetIndex = configuration.value.tabs[props.tabName][targetGroupName].length; // TODO: check if this panics somewhere
	}

	let file = configuration.value.tabs[props.tabName][sourceGroupName][sourceIndex]; // Grab the dragged file out of the array
	configuration.value.tabs[props.tabName][sourceGroupName].splice(sourceIndex, 1); // Delete from the source array
	configuration.value.tabs[props.tabName][targetGroupName].splice(targetIndex, 0, file); // Add to the target array in the target's position, pushing everything else backwards

	configuration.value.unsaved = true;
}
</script>
