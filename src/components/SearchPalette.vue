<template>
	<TransitionRoot :show="open" as="template" @after-leave="rawQuery = ''" appear>
		<Dialog as="div" class="relative z-10" @close="close()">
			<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100"
				leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
				<div class="fixed inset-0 bg-gray-500 bg-opacity-25 transition-opacity" />
			</TransitionChild>

			<div class="fixed inset-0 z-10 overflow-y-auto p-4 sm:p-6 md:p-20">
				<TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 scale-95"
					enter-to="opacity-100 scale-100" leave="ease-in duration-200" leave-from="opacity-100 scale-100"
					leave-to="opacity-0 scale-95">
					<DialogPanel
						class="mx-auto max-w-xl transform divide-y divide-gray-100 overflow-hidden rounded-xl bg-white shadow-2xl ring-1 ring-black ring-opacity-5 transition-all">
						<Combobox @update:modelValue="onSelect">
							<div class="relative">
								<MagnifyingGlassIcon class="pointer-events-none absolute top-3.5 left-4 h-5 w-5 text-gray-400" />
								<ComboboxInput
									class="h-12 w-full border-0 bg-transparent pl-11 pr-4 text-gray-800 placeholder-gray-400 focus:ring-0 sm:text-sm"
									placeholder="Search..." autocomplete="off" @change="rawQuery = $event.target.value" />
							</div>

							<ComboboxOptions v-if="filteredCallsigns.length > 0 || filteredFiles.length > 0 || filteredDirectories.length > 0" static
								class="max-h-80 scroll-py-10 scroll-pb-2 space-y-4 overflow-y-auto p-4 pb-2">
								<li v-if="filteredCallsigns.length > 0">
									<h2 class="text-xs font-semibold text-gray-900">Callsigns</h2>
									<ul class="-mx-4 mt-2 text-sm text-gray-700">
										<ComboboxOption v-for="callsign in filteredCallsigns" :key="callsign" :value="callsign" as="template" v-slot="{ active }">
											<li
												:class="['flex cursor-default select-none items-center px-4 py-2', active && 'bg-sky-600 text-white']">
												<PaperAirplaneIcon :class="['h-6 w-6 flex-none', active ? 'text-white' : 'text-gray-400']" />
												<span class="ml-3 flex-auto truncate">{{ callsign }}</span>
											</li>
										</ComboboxOption>
									</ul>
								</li>
								<li v-if="filteredFiles.length > 0">
									<h2 class="text-xs font-semibold text-gray-900">Files</h2>
									<ul class="-mx-4 mt-2 text-sm text-gray-700">
										<ComboboxOption v-for="file in filteredFiles" :key="file.name" :value="file.name" as="template" v-slot="{ active }">
											<li :class="['flex cursor-default select-none items-center px-4 py-2', active && 'bg-sky-600 text-white']">
												<DocumentTextIcon :class="['h-6 w-6 flex-none', active ? 'text-white' : 'text-gray-400']" />
												<span :class="['ml-2 w-4 h-4 rounded-full border-white border-2', file.color]"></span>
												<!-- <DocumentTextIcon :class="['h-6 w-6 flex-none', file.color.replace('bg', 'text')]" /> -->
												<span class="ml-2 flex-auto leading-none !overflow-visible truncate">{{ file.name }}</span>
											</li>
										</ComboboxOption>
									</ul>
								</li>
								<!-- <li v-if="filteredDirectories.length > 0">
									<h2 class="text-xs font-semibold text-gray-900">Folders</h2>
									<ul class="-mx-4 mt-2 text-sm text-gray-700">
										<ComboboxOption v-for="directory in filteredDirectories" :key="directory.name" :value="directory" as="template" v-slot="{ active }">
											<li :class="['flex cursor-default select-none items-center px-4 py-2', active && 'bg-sky-600 text-white']">
												<FolderIcon :class="['h-6 w-6 flex-none', active ? 'text-white' : 'text-gray-400']" />
												<span class="ml-3 flex-auto truncate">{{ directory.name }}</span>
											</li>
										</ComboboxOption>
									</ul>
								</li> -->
							</ComboboxOptions>

							<div v-if="rawQuery === '?'" class="py-14 px-6 text-center text-sm sm:px-14">
								<LifebuoyIcon class="mx-auto h-6 w-6 text-gray-400" />
								<p class="mt-4 font-semibold text-gray-900">Help with searching</p>
								<p class="mt-2 text-gray-500">Use this tool to quickly search all pre-configured callsigns, files, and folders. Full network drive search coming soon.</p>
							</div>

							<div v-if="query !== '' && rawQuery !== '?' && filteredCallsigns.length === 0 && filteredDirectories.length === 0 && filteredFiles.length === 0"
								class="py-14 px-6 text-center text-sm sm:px-14">
								<ExclamationTriangleIcon class="mx-auto h-6 w-6 text-gray-400" />
								<p class="mt-4 font-semibold text-gray-900">No results found</p>
								<p class="mt-2 text-gray-500">We couldn't find anything with that term. Please try
									again.</p>
							</div>

							<div class="flex flex-wrap items-center bg-gray-50 py-2.5 px-4 text-xs text-gray-700">
								Type
								<kbd
									:class="['mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2', rawQuery.startsWith('!') ? 'border-sky-600 text-sky-600' : 'border-gray-400 text-gray-900']">!</kbd>
								to quickly set callsign
								<!-- <kbd
									:class="['mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2', rawQuery.startsWith('>') ? 'border-sky-600 text-sky-600' : 'border-gray-400 text-gray-900']">&gt;</kbd>
								for users, and -->
								<kbd
									:class="['mx-1 flex h-5 w-5 items-center justify-center rounded border bg-white font-semibold sm:mx-2', rawQuery === '?' ? 'border-sky-600 text-sky-600' : 'border-gray-400 text-gray-900']">?</kbd>
								for help.
							</div>
						</Combobox>
					</DialogPanel>
				</TransitionChild>
			</div>
		</Dialog>
	</TransitionRoot>
</template>

<script setup lang="ts">
import { ref, type Ref, computed, watch, inject } from "vue";
import { useRouter } from "vue-router";
import { MagnifyingGlassIcon } from "@heroicons/vue/20/solid";
import { FolderIcon, DocumentTextIcon } from "@heroicons/vue/24/solid";
import { ExclamationTriangleIcon, PaperAirplaneIcon, LifebuoyIcon } from "@heroicons/vue/24/outline";
import {
	Combobox,
	ComboboxInput,
	ComboboxOptions,
	ComboboxOption,
	Dialog,
	DialogPanel,
	TransitionChild,
	TransitionRoot,
} from "@headlessui/vue";

import type { File as ConfigFileEntry, Configuration } from "@/models/configuration";

const props = defineProps<{
	open: boolean;
}>();
const emit = defineEmits<{
	(e: "closed"): void;
	(e: "setCallsign", callsign: string): void;
}>();

const configuration = inject<Ref<Configuration | null>>("configuration");

const router = useRouter();

const isOpen = ref(false);
watch(() => props.open, () => isOpen.value = props.open);
function close() {
	isOpen.value = false;
	emit("closed");
}

const rawQuery: Ref<string> = ref("");
const query = computed(() => rawQuery.value.toLowerCase().replace(/^[!]/, ""));

const filteredCallsigns = computed(() => {
	if (!configuration?.value) return [];

	if (rawQuery.value === "!") {
		return configuration.value.callsigns.map(cs => cs.callsign);
	}
	else if (query.value !== "") {
		return configuration.value.callsigns
			.filter(callsign => callsign.callsign.toLowerCase().includes(query.value.trim()))
			.map(cs => cs.callsign);
	}
	return [];
});
// 	rawQuery.value === '!'
// 		? projects
// 		: query.value === '' || rawQuery.value.startsWith('>')
// 			? []
// 			: projects.filter((project) => project.name.toLowerCase().includes(query.value))
// );
const filteredFiles = computed((): ConfigFileEntry[] => {
	if (!configuration?.value) return [];

	if (query.value === "" || rawQuery.value.startsWith("!")) {
		return [];
	}
	let q = query.value.toLowerCase().trim();

	let allFiles = Object.values(configuration.value.tabs).map(tab => Object.values(tab)).flat(2);
	let files: ConfigFileEntry[] = allFiles
		.filter(entry => {
			return entry.name.toLowerCase().includes(q)
				|| entry.description.toLowerCase().includes(q)
				|| entry.searchTerms?.toLowerCase().includes(q)
				|| entry.path.toLowerCase().includes(q);
		});
		// .sort();
	return files;
});
const filteredDirectories = computed((): ConfigFileEntry[] => {
	if (!configuration?.value) return [];

	if (query.value === "" || rawQuery.value.startsWith("!")) {
		return [];
	}
	return [];
});

function onSelect(selection: string) {
	if (configuration?.value?.callsigns.map(cs => cs.callsign).includes(selection)) {
		emit("setCallsign", selection);
	}
	close();
	// window.location = item.url
}
</script>
