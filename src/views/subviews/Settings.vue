<template>
	<div class="max-w-xl mx-auto">
		<SwitchGroup as="div" class="flex items-center justify-between mb-4">
			<span class="flex flex-grow flex-col mr-6">
				<SwitchLabel as="span" class="text-sm font-medium text-gray-900" passive>Preview Files</SwitchLabel>
				<SwitchDescription as="span" class="text-sm text-gray-500">Attempt to preview files in-browser. Disable this to always open natively using the default Windows app. Files that cannot be previewed will always open natively.</SwitchDescription>
			</span>
			<Switch v-model="previewEnabled"
				:class="[previewEnabled ? 'bg-sky-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2']">
				<span aria-hidden="true"
					:class="[previewEnabled ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']" />
			</Switch>
		</SwitchGroup>
		<div class="text-center text-lg mt-2">
			<code>Flight Director v0.13.0 @ {{commitHash}}</code>
		</div>
		<div class="mt-2">
			<p><code>v0.13.0</code>: Cache DAFIF data in a local database for much faster lookups and to support future features</p>
			<p><code>v0.12.0</code>: Better first-time set-up experience (all settings now UI configurable), 400 DI best range numbers, fixes for Cavok auto-reconnect</p>
			<p><code>v0.11.0</code>: Cavok integration pulls live aircraft data for the performance calculators automatically, implement best rate of climb calculation, improve search algorithm</p>
			<p><code>v0.10.0</code>: Add best range calculator to the Performance tab, implement METAR/TAF pull from AF weather</p>
			<p><code>v0.9.0</code>: Cards that display Markdown content, cancel SharePoint loading process to immediately open cached copy</p>
			<p><code>v0.8.0</code>: SharePoint files now supported, cards can be moved to another tab via drag and drop, minor bugfixes</p>
			<p><code>v0.7.0</code>: ATLC performance tab added</p>
			<p><code>v0.6.0</code>: Regular Expression support in card paths, better looking confirmation and alert dialogs, various bugfixes</p>
			<p><code>v0.5.0</code>: Loadable profiles and user-editable design</p>
			<p><code>v0.4.0</code>: Integrated feedback submission, sidebar tabs in configuration file</p>
		</div>
		<div class="flex justify-center items-center mt-3">
			<RocketLaunchIcon class="w-6 h-6 mr-3" />
			<div class="text-sm">
				<p>Developed by 1st Lt Ryan Petschek</p>
				<p>Questions? Suggestions? <a href="mailto:ryan.petschek.mil@mail.smil.mil" class="text-sky-700">Shoot me an email</a>.</p>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, type Ref, watchEffect } from "vue";
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from "@headlessui/vue"
import { RocketLaunchIcon } from "@heroicons/vue/24/outline";

const previewEnabled: Ref<boolean | undefined> = ref(undefined);
watchEffect(() => {
	if (previewEnabled.value === undefined) {
		let savedSetting = localStorage.getItem("previewEnabled");
		if (savedSetting === null) {
			previewEnabled.value = true; // Default
		}
		else {
			previewEnabled.value = savedSetting === "true";
		}
	}
	else {
		localStorage.setItem("previewEnabled", previewEnabled.value.toString());
	}
});

let __COMMIT_HASH__ = ""; // Replaced by Vite
const commitHash: Ref<string> = ref(__COMMIT_HASH__);
</script>
