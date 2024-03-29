<template>
	<div :class="['bg-white rounded-lg sm:shadow flex flex-col max-w-5xl mx-auto', profileEditMode ? 'h-[calc(100vh-10rem)]' : 'h-[calc(100vh-7rem)]']">
		<div class="border-b border-gray-200 bg-white px-4 py-4 sm:px-6 rounded-t-lg">
			<div class="-ml-4 -mt-2 flex flex-nowrap items-center justify-between truncate">
				<div class="ml-4 mt-2 truncate">
					<div class="flex items-center">
						<RouterLink :to="getBackPath()" class="self-start mt-1 h-7 w-7 text-gray-400 transition-colors hover:text-gray-600 shrink-0">
							<ChevronLeftIcon />
						</RouterLink>
						<div class="ml-4 truncate">
							<h3 class="text-lg font-medium leading-6 text-gray-900 truncate">{{ card?.name }}</h3>
						</div>
					</div>
				</div>
				<div class="ml-4 mt-2">
					<div class="flex items-center">
						<nav v-if="profileEditMode" class="flex space-x-2">
							<button @click="currentMode = Mode.Edit"
								:class="[currentMode === Mode.Edit ? 'bg-sky-100 text-sky-700' : 'text-gray-500 hover:text-gray-700', 'rounded-md px-3 py-2 text-sm font-medium']">
								Edit
							</button>
							<button @click="currentMode = Mode.View"
								:class="[currentMode === Mode.View ? 'bg-sky-100 text-sky-700' : 'text-gray-500 hover:text-gray-700', 'rounded-md px-3 py-2 text-sm font-medium']">
								View
							</button>
						</nav>
					</div>
				</div>
			</div>
		</div>
		<div v-show="currentMode === Mode.Edit" class="shadow-inner outline-none h-full grid grid-cols-2 divide-x-2 overflow-auto">
			<textarea class="m-4 rounded-md outline-none active:outline-none border-0 focus:ring-2 focus:ring-inset focus:ring-sky-600 font-mono" @input="templateUpdate" ref="editBox"></textarea>
			<div class="p-4 prose prose-sm max-w-none prose-code:before:content-[''] prose-code:after:content-['']" v-html="renderedOutput"></div>
		</div>
		<article v-if="currentMode === Mode.View" class="shadow-inner py-6 px-10 prose max-md:prose-sm max-w-none overflow-auto prose-code:before:content-[''] prose-code:after:content-[''] prose-img:mx-auto" v-html="renderedOutput"></article>
	</div>
</template>

<script setup lang="ts">
import { ref, type Ref, inject, watchEffect, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { ChevronLeftIcon } from '@heroicons/vue/24/solid'

import type { Configuration, Card } from "@/types/configuration";
import { CONFIGURATION, EDIT_MODE } from "@/types/keys";

import { marked } from "marked";

// Open links in a new tab
marked.use({
	renderer: {
		link(href, title, text) {
			return `<a ${href && href[0] === "/" ? "" : "target=\"_blank\""} href="${href ?? ""}" title="${title ?? ""}">${text}</a>`;
		}
	}
})

const props = defineProps<{
	card: Card | null;
}>();

const configuration = inject(CONFIGURATION);
const profileEditMode = inject(EDIT_MODE);

const route = useRoute();

enum Mode {
	Edit,
	View,
};
const currentMode: Ref<Mode> = ref(Mode.View);
watchEffect(() => {
	if (profileEditMode?.value) {
		currentMode.value = Mode.Edit;
	}
	else {
		currentMode.value = Mode.View;
	}
});

const editBox: Ref<HTMLTextAreaElement | null> = ref(null);
onMounted(() => {
	if (!editBox.value || !props.card?.markdown) return;
	editBox.value.value = props.card?.markdown?.template ?? ""
});

function templateUpdate(e: Event) {
	if (!props.card?.markdown || !configuration?.value) return true;
	props.card.markdown.template = (e.target as HTMLTextAreaElement).value;
	configuration.value.unsaved = true;
}

const renderedOutput = computed((): string => {
	let template = props.card?.markdown?.template;
	if (!template) return "";
	return marked.parse(template);
});

function getBackPath(): string {
	let path = [...route.params.path];
	if (path.length > 1) {
		path.pop();
	}
	return "/" + path.map(encodeURIComponent).join("/");
}
</script>
