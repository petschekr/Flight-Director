<template>
	<div class="text-center">
		<code>Flight Director v0.2.0 @ {{commitHash}}</code>
	</div>
	<div class="flex justify-center items-center">
		<RocketLaunchIcon class="w-6 h-6 mr-3" />
		<div class="text-sm">
			<p>Developed by 1st Lt Ryan Petschek</p>
			<p>Questions? Suggestions? <a href="mailto:ryan.petschek.mil@mail.smil.mil" class="text-sky-700">Shoot me an email</a>.</p>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, type Ref } from "vue";
import { RocketLaunchIcon } from "@heroicons/vue/24/outline";

let __COMMIT_HASH__ = ""; // Replaced by Vite
const commitHash: Ref<string> = ref(__COMMIT_HASH__);
</script>
