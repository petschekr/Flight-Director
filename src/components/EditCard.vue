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
									<div class="flex-1">
										<!-- Header -->
										<div class="bg-gray-50 px-4 py-6 sm:px-6">
											<div class="flex items-start justify-between space-x-3">
												<div class="space-y-1">
													<DialogTitle class="text-lg font-medium text-gray-900">Edit Card</DialogTitle>
													<p class="text-sm text-gray-500">Customize link contents and appearance</p>
												</div>
												<div class="flex h-7 items-center">
													<button type="button" @click="close()" class="text-gray-400 hover:text-gray-500">
														<XMarkIcon class="h-6 w-6" />
													</button>
												</div>
											</div>
										</div>

										<!-- Divider container -->
										<div class="space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-name" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Title
													</label>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="card-name" v-model="title"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-description" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Description
													</label>
												</div>
												<div class="sm:col-span-2">
													<textarea id="card-description" rows="2" v-model="description"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-name" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Color
													</label>
												</div>
												<div class="sm:col-span-2">
													<Listbox as="div" v-model="selectedColor">
														<div class="relative mt-1">
															<ListboxButton
																class="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 sm:text-sm">
																<span class="flex items-center">
																	<span :class="['ml-2 h-6 w-6 flex-shrink-0 rounded-full', selectedColor]"></span>
																	<span class="ml-3 block leading-none !overflow-visible truncate font-mono">{{ selectedColor }}</span>
																</span>
																<span class="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
																	<ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
																</span>
															</ListboxButton>

															<transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100"
																leave-to-class="opacity-0">
																<ListboxOptions
																	class="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
																	<ListboxOption as="template" v-for="color in colors" :key="color" :value="color"
																		v-slot="{ active, selected }">
																		<li
																			:class="[active ? ['text-white', color] : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
																			<div class="flex items-center">
																				<span :class="['ml-2 h-8 w-8 flex-shrink-0 rounded-full border-white border-2', color]"></span>
																				<span :class="[selected ? 'font-semibold' : 'font-normal', 'ml-3 block leading-none !overflow-visible truncate font-mono']">
																					{{ color }}
																				</span>
																			</div>

																			<span v-if="selected"
																				:class="[active ? 'text-white' : 'text-sky-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
																				<CheckIcon class="h-5 w-5" />
																			</span>
																		</li>
																	</ListboxOption>
																</ListboxOptions>
															</transition>
														</div>
													</Listbox>
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-abbreviation" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Abbreviation
													</label>
													<p class="mt-1 text-sm text-gray-500">
														No more than 6 characters
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="card-abbreviation" v-model="abbreviation"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-path" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Link or path
													</label>
													<p class="mt-1 text-sm text-gray-500">
														Sharedrive path to the file or folder this card links to. Paths must be children of the root folder. Web links are also supported.
													</p>
												</div>
												<div class="sm:col-span-2">
													<textarea id="card-path" rows="2" v-model="path"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>

											<div class="space-y-1 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
												<div>
													<label for="card-search-terms" class="block text-sm font-medium text-gray-900 sm:mt-px sm:pt-2">
														Search terms
													</label>
													<p class="mt-1 text-sm text-gray-500">
														Optional list of comma separated terms that can be used to search for this card
													</p>
												</div>
												<div class="sm:col-span-2">
													<input type="text" id="card-search-terms" v-model="searchTerms"
														class="block w-full rounded-md border-gray-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
												</div>
											</div>
										</div>
									</div>

									<!-- Action buttons -->
									<div class="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6 flex space-x-3">
										<button type="button"
											class="inline-flex justify-center rounded-md border border-transparent bg-red-500 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
											Delete
										</button>
										<div class="grow"></div>
										<button type="button" @click="close()"
											class="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
											Cancel
										</button>
										<button type="submit"
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

	<Alert :title="alert.title" :message="alert.message" :open="alert.open" @closed="alert.open = false" />
</template>

<script setup lang="ts">
import { ref, type Ref, watch } from "vue";
import {
	Dialog, DialogPanel, DialogTitle,
	TransitionChild, TransitionRoot,
	Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions,
} from '@headlessui/vue'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { LinkIcon, QuestionMarkCircleIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'

import Alert from "@/components/Alert.vue";

import type { File } from "@/models/configuration";

const props = defineProps<{
	file: File | null;
}>();
const emit = defineEmits<{
	(e: "closed"): void;
}>();

const isOpen = ref(false);
watch(() => props.file, () => {
	isOpen.value = props.file !== null;
	if (props.file !== null) {
		title.value = props.file.name;
		description.value = props.file.description;
		abbreviation.value = props.file.abbreviation;
		path.value = props.file.path;
		searchTerms.value = props.file.searchTerms ?? "";
		selectedColor.value = colors[colors.findIndex(color => props.file?.color === color) ?? 0];
	}
});
function close() {
	isOpen.value = false;
	emit("closed");
}

const alert: Ref<{
	open: boolean;
	title?: string;
	message?: string;
	okText?: string;
}> = ref({ open: false });
function openAlert(title: string, message: string, okText = "OK"): Promise<void> {
	return new Promise((resolve, reject) => {
		alert.value = { title, message, okText, open: true };
		watch(alert.value, () => {
			if (!alert.value.open) {
				resolve();
			}
		});
	});
}

const colorBases = ["red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal", "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink", "rose", "slate", "gray", "zinc", "neutral", "stone"];
const colors: string[] = colorBases.reduce((prev, color, index) => {
	const shades = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900"];
	return prev.concat(shades.map(shade => `bg-${color}-${shade}`));
}, [] as string[]);

const title = ref("");
const description = ref("");
const selectedColor = ref(colors[0]); // Updated by props.file watcher
const abbreviation = ref("");
const path = ref("");
const searchTerms = ref("");
</script>
