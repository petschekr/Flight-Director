<template>
	<TransitionRoot as="template" :show="isOpen">
		<Dialog as="div" class="relative z-50" @close="close()">
			<div class="fixed inset-0" />

			<div class="fixed inset-0 overflow-hidden">
				<div class="absolute inset-0 overflow-hidden">
					<div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
						<TransitionChild as="template"
							enter="transform transition ease-in-out duration-500 sm:duration-500"
							enter-from="translate-x-full" enter-to="translate-x-0"
							leave="transform transition ease-in-out duration-500 sm:duration-500"
							leave-from="translate-x-0" leave-to="translate-x-full">
							<DialogPanel class="pointer-events-auto w-screen max-w-2xl">
								<form class="flex h-full flex-col overflow-y-scroll bg-white shadow-xl" @submit.prevent>
									<div class="flex-1 flex flex-col">
										<!-- Header -->
										<div class="bg-gray-100 px-4 py-6 sm:px-6">
											<div class="flex items-start justify-between space-x-3">
												<div class="space-y-1">
													<DialogTitle class="text-lg font-medium text-gray-900">Edit Callsigns</DialogTitle>
												</div>
												<div class="flex h-7 items-center">
													<button type="button" @click="close()" class="text-gray-400 hover:text-gray-500">
														<XMarkIcon class="h-6 w-6" />
													</button>
												</div>
											</div>
										</div>

										<CallsignCard v-for="callsign in configuration?.callsigns" ref="callsignCards"
											:initial-callsign="callsign.callsign" :initial-path="callsign.path" @delete="deleteCallsign" @move="moveCallsign" />
										<button type="button" @click="addCallsign"
											class="flex items-center justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 mt-2 mb-4 mx-48 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 leading-none">
											<PlusCircleIcon class="-ml-1 mr-2 h-5 w-5" />
											Add callsign
										</button>
									</div>

									<!-- Action buttons -->
									<div class="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6 flex space-x-3">
										<div class="grow"></div>
										<button type="button" @click="close"
											class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
											Cancel
										</button>
										<button type="submit" @click="save"
											class="inline-flex justify-center rounded-md border border-transparent bg-sky-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
											Save
										</button>
									</div>
								</form>
							</DialogPanel>
						</TransitionChild>
					</div>
				</div>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<script setup lang="ts">
import { ref, type Ref, computed, watch, inject } from "vue";
import { useRouter } from "vue-router";
import {
	Dialog, DialogPanel, DialogTitle,
	TransitionChild, TransitionRoot,
	Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions,
} from '@headlessui/vue'
import { XMarkIcon, PlusCircleIcon } from '@heroicons/vue/24/outline';

import CallsignCard from "./CallsignCard.vue";

import type { Configuration } from "@/types/configuration";
import { CONFIGURATION, OPEN_ALERT, OPEN_CONFIRM } from "@/types/keys";

const props = defineProps<{
	open: boolean;
}>();
const emit = defineEmits<{
	(e: "closed"): void;
}>();

const configuration = inject(CONFIGURATION);
const openAlert = inject(OPEN_ALERT);
const openConfirm = inject(OPEN_CONFIRM);

const isOpen = ref(false);
watch(() => props.open, () => isOpen.value = props.open);
function close() {
	isOpen.value = false;
	emit("closed");
}

const callsignCards = ref<InstanceType<typeof CallsignCard>[] | null>(null);

async function save() {
	if (!configuration?.value || !callsignCards.value || !openAlert) return;

	let newCallsigns = callsignCards.value.map(card => card.callsign);
	if ((new Set(newCallsigns)).size !== newCallsigns.length) {
		await openAlert("Duplicate callsign", "All callsigns must be unique");
		return;
	}

	let callsigns: Configuration["callsigns"] = [];
	for (let callsignCard of callsignCards.value) {
		if (!callsignCard.callsign) {
			await openAlert("Callsign required", "A callsign cannot be blank");
			return;
		}
		// if (!callsignCard.path) {
		// 	await openAlert("Path required", `${callsignCard.callsign} requires a path to where its content is located`);
		// 	return;
		// }
		callsigns.push({ callsign: callsignCard.callsign, path: callsignCard.path });
	}
	configuration.value.callsigns = callsigns;

	configuration.value.unsaved = true;
	close();
}
async function deleteCallsign(callsign: string) {
	if (!configuration?.value || !openAlert || !openConfirm) return;

	if (configuration.value.callsigns.length === 1) {
		await openAlert("Can't delete callsign", "At least one callsign must exist");
		return;
	}
	if (!await openConfirm("Delete callsign?", `Are you sure you want to delete ${callsign || "New callsign"}?`)) return;

	let callsignIndex = configuration.value.callsigns.findIndex(c => c.callsign === callsign);
	if (callsignIndex === -1) return;

	configuration.value.callsigns.splice(callsignIndex, 1);
	configuration.value.unsaved = true;
}
function moveCallsign(callsign: string, direction: "up" | "down") {
	if (!configuration?.value) return;

	let callsignIndex = configuration.value.callsigns.findIndex(c => c.callsign === callsign);
	let callsignContent = configuration.value.callsigns.splice(callsignIndex, 1)[0];

	let newCallsignIndex = direction === "up" ? callsignIndex - 1 : callsignIndex + 1;
	if (newCallsignIndex < 0) newCallsignIndex = 0;
	if (newCallsignIndex > configuration.value.callsigns.length) newCallsignIndex = configuration.value.callsigns.length;

	configuration.value.callsigns.splice(newCallsignIndex, 0, callsignContent);
	configuration.value.unsaved = true;
}
function addCallsign() {
	if (!configuration?.value) return;

	configuration.value.callsigns.push({ callsign: "", path: ""});
	configuration.value.unsaved = true;
}

</script>
