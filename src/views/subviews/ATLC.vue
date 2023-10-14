<template>
	<div class="grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3">
		<section class="lg:col-span-1 lg:col-start-1">
			<!-- Airport information -->
			<div class="grid grid-cols-3 gap-2">
				<div>
					<label for="icao" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">ICAO Identifier</label>
					<div class="mt-1">
						<input type="text" name="icao" id="icao" v-model="icao" @keydown.enter="($event.target as HTMLInputElement).blur()" @blur="updateAirfield" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6" placeholder="KSSC" maxlength="4" autocomplete="off" />
					</div>
				</div>
				<Listbox as="div" v-model="selectedDropdown" class="col-span-2">
					<ListboxLabel class="block text-sm font-medium leading-6 text-gray-900">Runway</ListboxLabel>
					<div class="relative mt-1">
						<ListboxButton class="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:text-sm sm:leading-6">
							<span class="inline-flex w-full truncate">
								<span class="truncate font-semibold">{{ selectedDropdown.name }}</span>
								<span class="ml-2 truncate text-gray-500">{{ selectedDropdown.notes }}</span>
							</span>
							<span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
								<ChevronUpDownIcon class="h-5 w-5 text-gray-400" />
							</span>
						</ListboxButton>

						<transition leave-active-class="transition ease-in duration-100" leave-from-class="opacity-100" leave-to-class="opacity-0">
							<ListboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
								<ListboxOption as="template" v-for="runway in runwaysDropdown" :key="runway.notes" :value="runway" v-slot="{ active, selected }">
									<li :class="[active ? 'bg-sky-600 text-white' : 'text-gray-900', 'relative cursor-default select-none py-2 pl-3 pr-9']">
										<div class="flex">
											<span :class="[selected ? 'font-semibold' : 'font-normal', 'truncate']">{{ runway.name }}</span>
											<span :class="[active ? 'text-sky-200' : 'text-gray-500', 'ml-2 truncate']">{{ runway.notes }}</span>
										</div>

										<span v-if="selected" :class="[active ? 'text-white' : 'text-sky-600', 'absolute inset-y-0 right-0 flex items-center pr-4']">
											<CheckIcon class="h-5 w-5" />
										</span>
									</li>
								</ListboxOption>
							</ListboxOptions>
						</transition>
					</div>
				</Listbox>
			</div>

			<h1 v-if="selectedAirfield" class="mt-1 capitalize font-bold">{{ selectedAirfield?.NAME.toLowerCase().replace(/\bAB\b/ig, "AB").replace(/\bAFB\b/ig, "AFB") }}</h1>
			<h1 v-else class="mt-1 capitalize italic">Loading...</h1>
			<canvas ref="map" class="mt-1 mb-3 bg-white w-full h-60 rounded-md"></canvas>

			<div>
				<div class="sm:hidden">
					<label for="tabs" class="sr-only">Select a tab</label>
					<!-- Use an "onChange" listener to redirect the user to the selected tab URL. -->
					<select id="tabs" name="tabs" @change="(e) => tabSelect((e.target as HTMLInputElement).value)" class="block w-full rounded-md border-gray-300 focus:border-sky-500 focus:ring-sky-500">
						<option v-for="tab in tabs" :key="tab.name" :selected="tab.type === currentAirfieldTab">{{ tab.name }}</option>
					</select>
				</div>
				<div class="hidden sm:block">
					<div class="border-b border-gray-200">
						<nav class="-mb-px flex space-x-4 justify-between overflow-hidden" aria-label="Tabs">
							<a v-for="tab in tabs" :key="tab.name" @click="tabSelect(tab.name)" :class="[tab.type === currentAirfieldTab ? 'border-sky-500 text-sky-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700', 'group inline-flex items-center border-b-2 py-3 px-1 text-sm font-medium grow cursor-pointer']">
								<component :is="tab.icon" :class="[tab.type === currentAirfieldTab ? 'text-sky-500' : 'text-gray-400 group-hover:text-gray-500', '-ml-0.5 mr-2 h-5 w-5']" aria-hidden="true" />
								<span>{{ tab.name }}</span>
							</a>
						</nav>
					</div>
				</div>
			</div>

			<div v-if="currentAirfieldTab === AirfieldTabs.Presets" class="mt-2 flow-root">
				<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
					<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded">
						<table class="min-w-full divide-y divide-gray-300">
							<tbody class="divide-y divide-gray-200 bg-white">
								<tr>
									<td class="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Field Elevation</td>
									<td class="whitespace-nowrap px-3 py-3 text-sm text-gray-600">{{ fieldElevation }} ft</td>
								</tr>
								<tr>
									<td class="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Mag Var</td>
									<td class="whitespace-nowrap px-3 py-3 text-sm text-gray-600">{{ magVar }}</td>
								</tr>
								<tr>
									<td class="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">ILLA</td>
									<td class="whitespace-nowrap px-3 py-3 text-sm text-gray-600">{{ illa }} ft</td>
								</tr>
								<tr>
									<td class="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">ILLH</td>
									<td class="whitespace-nowrap px-3 py-3 text-sm text-gray-600">{{ illh }}°</td>
								</tr>
								<tr>
									<td class="whitespace-nowrap py-3 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">Pattern Altitude</td>
									<td class="whitespace-nowrap px-3 py-3 text-sm text-gray-600">{{ patternAltitude }} ft</td>
								</tr>
							</tbody>
						</table>
					</div>
					</div>
				</div>
			</div>
			<div v-if="currentAirfieldTab === AirfieldTabs.Runways" class="mt-2 flow-root">
				<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
					<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded">
						<table class="min-w-full divide-y divide-gray-300">
							<tbody class="divide-y divide-gray-200 bg-white">
								<tr v-for="runway in selectedAirfieldRunways" class="divide-x">
									<td class="py-3 pl-4 pr-3 text-sm sm:pl-6 text-center w-32">
										<p class="text-lg font-medium text-gray-900">{{ runway.LOW_IDENT }} - {{ runway.HIGH_IDENT }}</p>
										<p class="font-medium">{{ parseInt(runway.LENGTH).toLocaleString() }}' x {{ parseInt(runway.RWY_WIDTH).toLocaleString() }}'</p>
										<p>{{ runway.SURFACE }}</p>
									</td>
									<td class="px-3 py-3 text-sm text-gray-600">
										<p class="text-gray-900 font-medium">Rwy {{ runway.LOW_IDENT }} <span v-if="isBestWind(parseFloat(runway.LOW_HDG))" class="bg-sky-200 ml-1 px-1 py-0.5 rounded">Best Wind</span></p>
										<p class="leading-8">
											<ArrowUpCircleIcon :class="['inline w-6 h-6 text-gray-500', windComponents(parseFloat(runway.LOW_HDG))[0] > 0 ? 'rotate-90' : '-rotate-90']" />
											<span class="ml-1 text-gray-500">{{ windComponents(parseFloat(runway.LOW_HDG))[2] }} kts</span>
											<ArrowUpCircleIcon :class="['ml-1 inline w-6 h-6', windComponents(parseFloat(runway.LOW_HDG))[1] >= 0 ? 'rotate-180 text-green-500' : 'rotate-0 text-red-500']" />
											<span :class="['ml-1', windComponents(parseFloat(runway.LOW_HDG))[1] >= 0 ? 'text-green-500' : 'text-red-500']">{{ windComponents(parseFloat(runway.LOW_HDG))[3] }} kts</span>
										</p>
										<p class="text-gray-900 font-medium">Rwy {{ runway.HIGH_IDENT }} <span v-if="isBestWind(parseFloat(runway.HIGH_HDG))" class="bg-sky-200 ml-1 px-1 py-0.5 rounded">Best Wind</span></p>
										<p class="leading-8">
											<ArrowUpCircleIcon :class="['inline w-6 h-6 text-gray-500', windComponents(parseFloat(runway.HIGH_HDG))[0] > 0 ? 'rotate-90' : '-rotate-90']" />
											<span class="ml-1 text-gray-500">{{ windComponents(parseFloat(runway.HIGH_HDG))[2] }} kts</span>
											<ArrowUpCircleIcon :class="['ml-1 inline w-6 h-6', windComponents(parseFloat(runway.HIGH_HDG))[1] >= 0 ? 'rotate-180 text-green-500' : 'rotate-0 text-red-500']" />
											<span :class="['ml-1', windComponents(parseFloat(runway.HIGH_HDG))[1] >= 0 ? 'text-green-500' : 'text-red-500']">{{ windComponents(parseFloat(runway.HIGH_HDG))[3] }} kts</span>
										</p>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					</div>
				</div>
			</div>
			<div v-if="currentAirfieldTab === AirfieldTabs.Frequencies" class="mt-2 flow-root">
				<div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
					<div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
					<div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded">
						<table class="min-w-full divide-y divide-gray-300">
							<tbody class="divide-y divide-gray-200 bg-white">
								<tr v-for="freq in selectedAirfieldComms">
									<td class="py-3 pl-4 pr-3 text-sm sm:pl-6">
										<p class="font-medium text-gray-900">{{ freq.COMM_NAME }}</p>
										<p>{{ freq.S_OPR_H }}</p>
									</td>
									<td class="px-3 py-3 text-sm text-gray-600 text-center">
										{{ freq.FREQ_1 }}
										{{ freq.FREQ_2 }}
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					</div>
				</div>
			</div>

		</section>
		<section class="lg:col-span-2 lg:col-start-2">
			<!-- Aircraft information -->
			<div class="grid grid-cols-2 gap-y-2">
				<div class="col-span-2 flex space-x-2">
					<div class="grow">
						<label for="wind-direction" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Wind Direction</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="wind-direction" id="wind-direction" min="0" max="360" step="5" v-model="windDirection" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">°M</span>
						</div>
					</div>
					<span class="self-end pb-1 font-semibold text-xl">@</span>
					<div class="grow">
						<label for="wind-speed" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Speed</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="wind-speed" id="wind-speed" min="0" max="100" step="1" v-model="windSpeed" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">kts</span>
						</div>
					</div>
					<span class="self-end pb-1 font-semibold text-xl">G</span>
					<div class="grow">
						<label for="wind-gust" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Gust</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="wind-gust" id="wind-gust" min="0" max="100" step="1" v-model="windGust" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">kts</span>
						</div>
					</div>
				</div>
				<div class="col-span-2 flex space-x-2">
					<div class="grow">
						<label for="temperature" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Temperature</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="temperature" id="temperature" min="-100" max="100" step="1" v-model="temperature" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">°C</span>
						</div>
					</div>
					<div class="grow">
						<label for="altimeter" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Altimeter</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" name="altimeter" id="altimeter" min="20.00" max="40.00" step="0.01" v-model="altimeter" @blur="altimeter > 40 ? altimeter /= 100 : null" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">inHg</span>
						</div>
					</div>
					<div class="grow">
						<label for="weight" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Aircraft Weight</label>
						<div class="mt-1 flex rounded-md">
							<input type="number" id="weight" min="5000" max="11700" step="100" v-model="aircraftWeight" class="block w-full flex-1 rounded-none rounded-l-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:leading-6" />
							<span class="inline-flex items-center rounded-r-md border border-l-0 shadow-sm border-gray-300 bg-gray-50 px-1 text-sm text-gray-500 z-0">lbs</span>
						</div>
					</div>
				</div>
			</div>

			<div v-if="errors.length > 0" class="border-l-4 border-red-400 bg-red-50 p-4 mt-4">
				<div class="flex">
					<div class="flex-shrink-0">
						<XCircleIcon class="h-5 w-5 text-red-400" aria-hidden="true" />
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Warning!</h3>
						<div class="mt-2 text-sm text-red-700">
							<ul role="list" class="list-disc space-y-1 pl-5">
								<li v-for="error in errors" v-html="error"></li>
							</ul>
						</div>
					</div>
				</div>
			</div>

			<div>
				<p class="text-center mt-4 text-lg">
					PA: <span class="font-semibold">{{ pressureAltitude }} ft</span> //
					DA: <span class="font-semibold">{{ densityAltitude }} ft</span> //
					ISA <span class="font-semibold">{{ isa }} °F</span> //
					TORA: <span class="font-semibold">{{ tora }} ft</span> //
					LDA: <span class="font-semibold">{{ lda }} ft</span>
				</p>
				<dl class="mt-4 grid grid-cols-2 xl:grid-cols-4 divide-y divide-x divide-gray-200 rounded-lg bg-white shadow">
					<div v-for="item in takeOffStats" :key="item.name" class="px-4 py-5 flex items-center first:border-t-[1px] max-xl:odd:!border-l-0">
						<div :class="[item.color, 'rounded-md p-2 mr-3']">
							<component :is="item.icon" class="h-5 w-5 text-white" aria-hidden="true" />
						</div>
						<div>
							<dt>
								<p class="text-base leading-4 my-1 font-medium text-gray-500">{{ item.name }}</p>
							</dt>
							<dd class="flex items-center">
								<p class="text-2xl font-semibold text-gray-900 leading-5">{{ item.stat }} <span class="text-lg font-normal">{{ item.unit }}</span></p>
							</dd>
						</div>
					</div>
				</dl>
			</div>

			<div>
				<dl class="mt-4 grid grid-cols-1 xl:grid-cols-3 divide-y divide-x divide-gray-200 rounded-lg bg-white shadow">
					<div v-for="item in distanceStats" :key="item.name" class="px-4 py-5 flex items-center first:border-t-[1px] max-xl:odd:!border-l-0">
						<div :class="[item.color, 'rounded-md p-2 mr-3']">
							<component :is="item.icon" class="h-5 w-5 text-white" aria-hidden="true" />
						</div>
						<div>
							<dt>
								<p class="text-base leading-4 my-1 font-medium text-gray-500">{{ item.name }}</p>
							</dt>
							<dd class="flex items-center">
								<p class="text-2xl font-semibold text-gray-900 leading-5">{{ item.stat }} <span class="text-lg font-normal">{{ item.unit }}</span></p>
							</dd>
						</div>
					</div>
				</dl>
			</div>
			<div>
				<dl class="mt-4 grid grid-cols-1 xl:grid-cols-3 divide-y divide-x divide-gray-200 rounded-lg bg-white shadow">
					<div v-for="item in airborneStats" :key="item.name" class="px-4 py-5 flex items-center first:border-t-[1px] max-xl:odd:!border-l-0">
						<div :class="[item.color, 'rounded-md p-2 mr-3']">
							<component :is="item.icon" class="h-5 w-5 text-white" aria-hidden="true" />
						</div>
						<div>
							<dt>
								<p class="text-base leading-4 my-1 font-medium text-gray-500">{{ item.name }}</p>
							</dt>
							<dd class="flex items-center">
								<p class="text-2xl font-semibold text-gray-900 leading-5">{{ item.stat }} <span class="text-lg font-normal">{{ item.unit }}</span></p>
							</dd>
						</div>
					</div>
				</dl>
			</div>
		</section>
	</div>

	<div class="flex space-x-4 justify-center mt-4">
		<div class="w-48">
			<h2 class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Weather Source</h2>
			<RadioGroup class="mt-1" v-model="wxType">
				<div class="flex space-x-2">
					<RadioGroupOption as="template" value="METAR" v-slot="{ active, checked }">
						<div :class="[active ? 'ring-2 ring-sky-600 ring-offset-2' : '', checked ? 'bg-sky-600 text-white hover:bg-sky-500' : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50', 'flex items-center justify-center rounded-md py-2 px-3 text-sm font-semibold uppercase sm:flex-1 cursor-pointer focus:outline-none']">
							<RadioGroupLabel as="span">METAR</RadioGroupLabel>
						</div>
					</RadioGroupOption>
					<RadioGroupOption as="template" value="TAF" v-slot="{ active, checked }">
						<div :class="[active ? 'ring-2 ring-sky-600 ring-offset-2' : '', checked ? 'bg-sky-600 text-white hover:bg-sky-500' : 'ring-1 ring-inset ring-gray-300 bg-white text-gray-900 hover:bg-gray-50', 'flex items-center justify-center rounded-md py-2 px-3 text-sm font-semibold uppercase sm:flex-1 cursor-pointer focus:outline-none']">
							<RadioGroupLabel as="span">TAF</RadioGroupLabel>
						</div>
					</RadioGroupOption>
				</div>
			</RadioGroup>
		</div>
		<div class="w-20">
			<label for="weather-station" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Station</label>
			<div class="mt-1">
				<input type="text" name="weather-station" id="weather-station" v-model="weatherStation" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 sm:text-sm sm:leading-6" placeholder="KSSC" maxlength="4" autocomplete="off" />
			</div>
		</div>
		<div>
			<label for="forecast-time" class="block text-sm font-medium leading-6 whitespace-nowrap truncate text-gray-900">Take off / Land Time</label>
			<div class="mt-1 flex rounded-md">
				<input type="datetime-local" name="forecast-time" id="forecast-time" v-model="forecastTime" :disabled="wxType === 'METAR'" class="block w-full flex-1 rounded-md border-0 py-1.5 pr-1 text-center sm:text-lg text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 uppercase placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-sky-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 sm:leading-6" />
			</div>
		</div>
		<div class="flex">
			<button @click="pullWeatherData" :disabled="wxLoading"
				class="self-end inline-flex rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 transition ease-in-out duration-150 disabled:cursor-not-allowed disabled:opacity-70">
				<svg v-if="wxLoading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				<template v-if="!wxLoading">
					Pull Weather
				</template>
				<template v-else>
					Pulling Weather...
				</template>
			</button>
		</div>
	</div>
	<p class="text-center mt-2 text-base whitespace-pre">{{ wxStatusText }}</p>
	<p class="text-center mt-0.5 text-xs">{{ wxUpdateText }}</p>

	<div class="bg-white px-4 py-5 mt-4 shadow sm:rounded-lg sm:p-6">
		<div class="md:grid md:grid-cols-4 md:gap-6">
			<div class="md:col-span-1">
				<h3 class="text-lg font-medium leading-6 text-gray-900">Drag Index</h3>
				<p class="mt-1 text-sm text-gray-500">Check your aircraft's configuration to set these correctly. 4-blade prop drag is assumed and automatically added for best glide calculation.</p>
			</div>
			<div class="mt-5 space-y-6 md:col-span-3 md:mt-0">
				<fieldset class="border-t border-b border-gray-200">
					<div class="divide-y divide-gray-200">
						<div v-for="dragItem in dragItems" :key="dragItem.index" class="relative flex items-start py-4">
							<div class="min-w-0 flex-1 text-sm">
								<label :for="dragItem.name.replace(/ /g, '')" class="font-medium text-gray-700">{{dragItem.name}}</label>
							</div>
							<div class="ml-3 flex h-5 items-center">
								<input v-if="dragItem.multiple" :id="dragItem.name.replace(/ /g, '')" @input="e => updateDragItemSelections(e, dragItem.index)" :value="dragItemSelections[dragItem.index] ?? 0"
									type="number" min="0" class="w-16 rounded border-gray-300 focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
								<input v-else :id="dragItem.name.replace(/ /g, '')" @input="e => updateDragItemSelections(e, dragItem.index)" :checked="dragItemSelections[dragItem.index] ? true : false"
									type="checkbox" class="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500" />
							</div>
						</div>
					</div>
				</fieldset>
				<p class="text-center font-semibold">Drag Index: {{dragIndex}}</p>
			</div>
		</div>
	</div>
	<p class="text-center text-sm mt-4">All performance values for aircraft equipped with 4-blade prop and ATLC active</p>
</template>

<script setup lang="ts">
import { ref, type Ref, computed, inject, watchEffect, onMounted, watch } from "vue";
import { Listbox, ListboxButton, ListboxLabel, ListboxOption, ListboxOptions, RadioGroup, RadioGroupLabel, RadioGroupOption } from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/vue/20/solid";
import { AdjustmentsHorizontalIcon, ChevronDoubleRightIcon, RadioIcon, XCircleIcon } from "@heroicons/vue/20/solid";
import {
	ArrowUturnUpIcon,
	ArrowTrendingUpIcon,
	ClockIcon,
	FlagIcon,
	ArrowUpRightIcon,
	ArrowDownRightIcon,
	ExclamationTriangleIcon,
	CubeTransparentIcon,
	ChevronDoubleRightIcon as ChevronDoubleRightBigIcon,
	ChevronDoubleLeftIcon,
} from "@heroicons/vue/24/outline";
import { ArrowUpCircleIcon } from "@heroicons/vue/24/solid";

import toml from "toml";

import type { Performance } from "@/models/configuration";

import * as ATLCPerformance from "@/performance/ATLC";
import * as GlidePerformance from "@/performance/glide";
import * as DAFIF from "@/performance/DAFIF";

const openAlert = inject<(title: string, message: string, okText?: string) => Promise<void>>("openAlert");

const icao = ref(localStorage.getItem("icao") ?? "");
const windDirection = ref(parseInt(localStorage.getItem("windDirection") ?? "0"));
const windSpeed = ref(parseInt(localStorage.getItem("windSpeed") ?? "0"));
const windGust = ref(parseInt(localStorage.getItem("windGust") ?? "0"));
const temperature = ref(parseInt(localStorage.getItem("temperature") ?? "15"));
// TODO: click for unit change
const altimeter = ref(parseFloat(localStorage.getItem("altimeter") ?? "29.92"));
const aircraftWeight = ref(parseInt(localStorage.getItem("aircraftWeight") ?? "11000"));

const selectedAirfield: Ref<DAFIF.Airport | null> = ref(null);
const selectedAirfieldRunways: Ref<DAFIF.Runway[]> = ref([]);
const selectedRunway: Ref<DAFIF.Runway | null> = ref(null);
const selectedRunwayEnd: Ref<"HIGH" | "LOW"> = ref("HIGH");
const selectedAirfieldComms: Ref<DAFIF.AirportComms[] | null> = ref(null);

const pressureAltitude = computed(() => {
	if (!selectedAirfield.value) return "--";
	return ATLCPerformance.pressureAltitude(parseInt(selectedAirfield.value.ELEV), altimeter.value).toLocaleString();
});
const densityAltitude = computed(() => {
	if (!selectedAirfield.value) return "--";
	return ATLCPerformance.densityAltitude(parseInt(selectedAirfield.value.ELEV), altimeter.value, temperature.value).toLocaleString();
});
const isa = computed(() => {
	if (!selectedAirfield.value) return "--";
	let isa = Math.round(ATLCPerformance.deltaISA_F(parseInt(selectedAirfield.value.ELEV), temperature.value));
	if (isa > 0) {
		return `+${isa}`;
	}
	else {
		return isa.toString();
	}
});
const tora = computed(() => {
	if (!selectedAirfield.value || !selectedRunway.value) return "--";
	let distance = parseInt(selectedRunwayEnd.value === "HIGH" ? selectedRunway.value.HE_TORA : selectedRunway.value.LE_TORA);
	if (isNaN(distance)) {
		distance = parseInt(selectedRunway.value.LENGTH);
	}
	return distance.toLocaleString();
});
const lda = computed(() => {
	if (!selectedAirfield.value || !selectedRunway.value) return "-- ft";
	let distance = parseInt(selectedRunwayEnd.value === "HIGH" ? selectedRunway.value.HELAND_DIS : selectedRunway.value.LELAND_DIS);
	if (isNaN(distance)) {
		distance = parseInt(selectedRunway.value.LENGTH);
	}
	return distance.toLocaleString();
});
const accelCheckTime = computed(() => {
	if (!selectedAirfield.value) return "--";
	let elevation = parseInt(selectedAirfield.value.ELEV);
	let result = ATLCPerformance.accelCheckTime(
		aircraftWeight.value,
		ATLCPerformance.pressureAltitude(elevation, altimeter.value),
		ATLCPerformance.deltaISA_F(elevation, temperature.value)
	);
	if (result === null) return "--";
	return Math.ceil(result);
});
const refusalSpeed = computed(() => {
	if (!selectedAirfield.value || !selectedRunway.value) return "--";
	let elevation = parseInt(selectedAirfield.value.ELEV);
	let result = ATLCPerformance.refusalSpeed(
		aircraftWeight.value,
		ATLCPerformance.pressureAltitude(elevation, altimeter.value),
		ATLCPerformance.deltaISA_F(elevation, temperature.value),
		parseInt(selectedRunway.value.LENGTH), // TODO: takeoff distance can differ by runway direction
	);
	if (result === null) return "--";
	return Math.round(result);
});
const rotateSpeed = computed(() => ATLCPerformance.rotationSpeed(aircraftWeight.value));
const liftoffSpeed = computed(() => ATLCPerformance.liftoffSpeed(aircraftWeight.value));
const takeoffRoll = computed(() => {
	if (!selectedAirfield.value || !selectedRunway.value) return "--";
	let elevation = parseInt(selectedAirfield.value.ELEV);
	let runwayHeading = parseFloat(selectedRunwayEnd.value === "HIGH" ? selectedRunway.value.HIGH_HDG : selectedRunway.value.LOW_HDG);
	let runwaySlope = parseFloat(selectedRunwayEnd.value === "HIGH" ? selectedRunway.value.HE_SLOPE : selectedRunway.value.LE_SLOPE);
	if (isNaN(runwaySlope)) runwaySlope = 0;

	let result = ATLCPerformance.takeoffRoll(
		aircraftWeight.value,
		ATLCPerformance.pressureAltitude(elevation, altimeter.value),
		ATLCPerformance.deltaISA_F(elevation, temperature.value),
		windComponents(runwayHeading)[1],
		runwaySlope,
	);
	if (result === null) return "--";
	const ACCURACY = 50;
	return (Math.ceil(result / ACCURACY) * ACCURACY).toLocaleString();
});
const landingRoll = computed(() => {
	if (!selectedAirfield.value || !selectedRunway.value) return "--";
	let elevation = parseInt(selectedAirfield.value.ELEV);
	let runwayHeading = parseFloat(selectedRunwayEnd.value === "HIGH" ? selectedRunway.value.HIGH_HDG : selectedRunway.value.LOW_HDG);
	let runwaySlope = parseFloat(selectedRunwayEnd.value === "HIGH" ? selectedRunway.value.HE_SLOPE : selectedRunway.value.LE_SLOPE);
	if (isNaN(runwaySlope)) runwaySlope = 0;

	let result = ATLCPerformance.landingRoll(
		aircraftWeight.value,
		ATLCPerformance.densityAltitude(elevation, altimeter.value, temperature.value),
		windComponents(runwayHeading)[1],
		runwaySlope,
	);
	if (result === null) return "--";
	const ACCURACY = 50;
	return (Math.ceil(result / ACCURACY) * ACCURACY).toLocaleString();
});
const bestGlideSpeed = computed(() => {
	if (!performance.value) return "--";
	let result = GlidePerformance.bestGlideSpeed(performance.value, dragIndex.value, true, aircraftWeight.value);
	if (result === null) return "--";
	return Math.round(result);
});
const approachSpeed = computed(() => ATLCPerformance.approachSpeed(aircraftWeight.value));
const fieldElevation = computed(() => {
	if (!selectedAirfield.value) return "--";
	return parseInt(selectedAirfield.value.ELEV).toLocaleString();
});
function getMagVar() {
	if (!selectedAirfield.value) return 0;
	let parsed = selectedAirfield.value.MAG_VAR.match(/^(E|W)(\d\d\d)(\d\d\d)/);
	if (!parsed) return 0;

	let variation = parseInt(parsed[2]);
	variation += parseInt(parsed[3]) / 10 / 60;
	if (parsed[1] === "W") {
		variation *= -1;
	}
	return variation;
}
const magVar = computed(() => {
	if (!selectedAirfield.value) return "--";
	let variation = getMagVar();
	return `${Math.abs(variation).toFixed(1)}° ${variation < 0 ? "W" : "E"}`;
});
const illa = computed(() => {
	if (!selectedAirfield.value) return "--";
	let fieldElevation = parseInt(selectedAirfield.value.ELEV);
	let illa = Math.ceil(fieldElevation / 100) * 100 + 500;
	if (icao.value.toUpperCase() === "OMAM") {
		illa = 500; // Defined by ADAB LRE standards
	}
	return illa.toLocaleString();
});
const illh = computed(() => {
	if (!selectedAirfield.value) return "--";
	if (!selectedRunway.value) return "--";
	if (selectedRunwayEnd.value === "HIGH") {
		if (icao.value.toUpperCase() === "OMAM") {
			return "306.0"; // Defined by ADAB LRE standards
		}
		return selectedRunway.value.HIGH_HDG;
	}
	else {
		if (icao.value.toUpperCase() === "OMAM") {
			return "126.0"; // Defined by ADAB LRE standards
		}
		return selectedRunway.value.LOW_HDG;
	}
});
const patternAltitude = computed(() => {
	if (!selectedAirfield.value) return "--";
	let fieldElevation = parseInt(selectedAirfield.value.ELEV);
	let patternAltitude = Math.ceil(fieldElevation / 100) * 100 + 1500;
	if (icao.value.toUpperCase() === "OMAM") {
		patternAltitude = 1_500; // Defined by ADAB LRE standards
	}
	return patternAltitude.toLocaleString();
});

function windComponents(runwayHeading: number): [number, number, string, string] {
	let maxWindSpeed = Math.max(windSpeed.value, windGust.value);
	let crosswindProportion = Math.sin((runwayHeading - windDirection.value) * (Math.PI / 180));
	let crosswind = Math.round(crosswindProportion * maxWindSpeed);
	let steadyCrosswind = Math.round(crosswindProportion * windSpeed.value);
	let headwindProportion = Math.cos((runwayHeading - windDirection.value) * (Math.PI / 180));
	let headwind = Math.round(headwindProportion * maxWindSpeed);
	let steadyHeadwind = Math.round(headwindProportion * windSpeed.value);
	return [
		crosswind,
		headwind,
		Math.abs(steadyCrosswind) < Math.abs(crosswind) ? `${Math.abs(steadyCrosswind)}-${Math.abs(crosswind)}` : Math.abs(crosswind).toString(),
		Math.abs(steadyHeadwind)  < Math.abs(headwind)  ? `${Math.abs(steadyHeadwind)}-${Math.abs(headwind)}`   : Math.abs(headwind).toString(),
	];
}
function isBestWind(runwayHeading: number): boolean {
	let bestHeadwind = -Infinity;
	let bestHeading = NaN;
	for (let direction of selectedAirfieldRunways.value.flatMap(runway => [runway.LOW_HDG, runway.HIGH_HDG]).map(parseFloat)) {
		let wind = windComponents(direction);
		if (wind[1] > bestHeadwind) {
			bestHeading = direction;
			bestHeadwind = wind[1];
		}
	}
	return Math.round(runwayHeading) === Math.round(bestHeading);
}

const takeOffStats = computed(() => {
	let deemphasizeRefusalSpeed = typeof refusalSpeed.value === "number" && typeof rotateSpeed.value === "number" && refusalSpeed.value <= rotateSpeed.value;
	return [
		{ name: "Accel Check", icon: ClockIcon, color: "bg-amber-500", stat: accelCheckTime.value, unit: "Sec" },
		{ name: "Refusal", icon: FlagIcon, color: deemphasizeRefusalSpeed ? "bg-red-500" : "bg-red-200", stat: refusalSpeed.value, unit: "KIAS" },
		{ name: "Rotate", icon: ArrowUturnUpIcon, color: "bg-sky-500", stat: rotateSpeed.value, unit: "KIAS" },
		{ name: "Liftoff", icon: ArrowTrendingUpIcon, color: "bg-green-500", stat: liftoffSpeed.value, unit: "KIAS" },
	];
});

const distanceStats = computed(() => {
	return [
		{ name: "Takeoff Ground Rolll", icon: ChevronDoubleRightBigIcon, color: "bg-slate-500", stat: takeoffRoll.value, unit: "ft" },
		{ name: "Distance to Clear 50ft Obstacle", icon: CubeTransparentIcon, color: "bg-slate-600", stat: "--", unit: "ft" },
		{ name: "Landing Roll", icon: ChevronDoubleLeftIcon, color: "bg-orange-900", stat: landingRoll.value, unit: "ft" },
	];
});

const airborneStats = computed(() => {
	return [
		{ name: "Best Rate of Climb", icon: ArrowUpRightIcon, color: "bg-teal-500", stat: "--", unit: "KIAS" },
		{ name: "Best Glide", icon: ExclamationTriangleIcon, color: "bg-amber-500", stat: bestGlideSpeed.value, unit: "KIAS" },
		{ name: "Approach", icon: ArrowDownRightIcon, color: "bg-purple-500", stat: approachSpeed.value, unit: "KIAS" },
	];
});

enum AirfieldTabs { Presets, Runways, Frequencies };
const tabs = ref([
	{ name: "Presets", type: AirfieldTabs.Presets, icon: AdjustmentsHorizontalIcon },
	{ name: "Runways", type: AirfieldTabs.Runways, icon: ChevronDoubleRightIcon },
	{ name: "Frequencies", type: AirfieldTabs.Frequencies, icon: RadioIcon },
]);
const currentAirfieldTab: Ref<AirfieldTabs> = ref(AirfieldTabs.Presets);
function tabSelect(name: string) {
	currentAirfieldTab.value = tabs.value.find(tab => tab.name === name)?.type ?? AirfieldTabs.Presets;
}

const runwaysDropdown = ref([
	{ name: "Loading...", notes: "" },
]);

const selectedDropdown = ref(runwaysDropdown.value[0]);
watchEffect(() => {
	if (!selectedAirfieldRunways.value) return;
	for (let runway of selectedAirfieldRunways.value) {
		if (runway.HIGH_IDENT === selectedDropdown.value.name) {
			selectedRunway.value = runway;
			selectedRunwayEnd.value = "HIGH";
		}
		if (runway.LOW_IDENT === selectedDropdown.value.name) {
			selectedRunway.value = runway;
			selectedRunwayEnd.value = "LOW";
		}
	}
});

// Input error detector
let errors: Ref<string[]> = ref([]);
watchEffect(() => {
	if (!selectedAirfield.value || !selectedRunway.value) return;
	errors.value = [];

	// Wind limitations
	let [crosswind, headwind] = windComponents(parseFloat(selectedRunwayEnd.value === "HIGH" ? selectedRunway.value.HIGH_HDG : selectedRunway.value.LOW_HDG));
	if (Math.max(windSpeed.value) > 30) {
		errors.value.push(`Total wind of <b>${Math.abs(headwind)} kts</b> exceeds 30 kt limit`);
	}
	if (headwind < -10) {
		errors.value.push(`Tailwind of <b>${Math.abs(headwind)} kts</b> exceeds 10 kt limit`);
	}
	if (Math.abs(crosswind) > 15) {
		errors.value.push(`Crosswind of <b>${Math.abs(crosswind)} kts</b> exceeds 15 kt limit (dirty wing)`);
	}

	// Runway limitations
	if (parseInt(takeoffRoll.value.replace(",", "")) > parseInt(tora.value.replace(",", ""))) {
		errors.value.push(`Takeoff roll of <b>${takeoffRoll.value} ft</b> exceeds takeoff run available (${tora.value} ft)`);
	}
	if (parseInt(landingRoll.value.replace(",", "")) > parseInt(lda.value.replace(",", ""))) {
		errors.value.push(`Landing roll of <b>${landingRoll.value} ft</b> exceeds landing distance available (${lda.value} ft)`);
	}
	if (parseInt(selectedRunway.value.LENGTH) < 5000) {
		errors.value.push(`Selected runway length of <b>${parseInt(selectedRunway.value.LENGTH).toLocaleString()} ft</b> is too short (5,000 ft required)`);
	}

	// Weight limitations
	if (aircraftWeight.value > 11_700) {
		errors.value.push(`AV weight of <b>${aircraftWeight.value.toLocaleString()} lbs</b> exceeds maximum ramp weight (11,700 lbs)`);
	}
	if (aircraftWeight.value > 10_500) {
		errors.value.push(`AV weight of <b>${aircraftWeight.value.toLocaleString()} lbs</b> exceeds maximum normal landing weight (10,500 lbs)`);
	}
	else if (aircraftWeight.value > 9_500) {
		errors.value.push(`AV weight of <b>${aircraftWeight.value.toLocaleString()} lbs</b> exceeds maximum ATLC landing weight (9,500 lbs)`);
	}

	// Weather limitations
	if (ATLCPerformance.deltaISA_F(parseInt(selectedAirfield.value.ELEV), temperature.value) > 70) {
		errors.value.push(`Airfield temperature exceeds +70 °F ISA. Performance calculations are not valid.`);
	}
	if (ATLCPerformance.cToF(temperature.value) >= 95) {
		errors.value.push(`Airfield temperature exceeds 95 °F. ATLC operations should not be performed due to risk of aircraft overheating.`);
	}
});

///////////////////////////////////////////
// Weather data
const wxType = ref<"METAR" | "TAF">("METAR");
const weatherStation = ref<string>("");
const forecastTime = ref<string>("");
const wxLoading = ref(false);
const wxStatusText = ref<string>("");
const wxUpdateText = ref<string>("");

interface METAR {
	raw: string;
	altimeter: number;
	dewpoint: number;
	issue_time: number;
	remarks: string;
	temperature: number;
	valid_time: number;
	wind: {
		direction: number;
		speed: number;
		gust?: number;
		unit: number;
		variable: boolean;
	}
}
interface TAF {
	raw: string;
	issued: number;
	valid_from: number;
	valid_to: number;
	groups: {
		altimeter?: number;
		raw: string;
		type: string;
		valid_time: number;
		valid_range: {
			from: number;
			to: number;
		};
		visibility: number;
		wind?: {
			direction: number;
			speed: number;
			gust?: number;
			unit: number;
			variable: boolean;
		};
	}[];
}
interface WeatherResponse {
	metars: METAR[];
	tafs: TAF[];
}

async function pullWeatherData() {
	if (!openAlert) return;
	if (wxType.value === "TAF" && !forecastTime.value) {
		await openAlert("Forecast time required", "Please choose a takeoff or land time.");
		return;
	}

	let response: WeatherResponse;
	try {
		wxLoading.value = true;
		let request = await fetch(`/api/weather?station=${encodeURIComponent(weatherStation.value)}`);
		response = (await request.json())[0];
	}
	finally {
		wxLoading.value = false;
	}

	if (wxType.value === "METAR") {
		let latestMETAR = response.metars.sort((a, b) => b.valid_time - a.valid_time)[0];
		if (!latestMETAR) {
			wxStatusText.value = `No METARs generated in the last 24 hours at ${weatherStation.value}`;
			wxUpdateText.value = "";
			return;
		}
		wxStatusText.value = latestMETAR.raw;

		let secondsSinceUpdate = (Date.now() / 1000) - latestMETAR.valid_time;
		let minutesSinceUpdate = Math.round(secondsSinceUpdate / 60);
		let hoursSinceUpdate = Math.round(secondsSinceUpdate / 60 / 60);

		let lastUpdateText = `${minutesSinceUpdate} minute${minutesSinceUpdate === 1 ? "" : "s"}`;
		if (secondsSinceUpdate > 60 * 60) {
			lastUpdateText = `${hoursSinceUpdate} hour${hoursSinceUpdate === 1 ? "" : "s"}`;
		}
		wxUpdateText.value = `Last updated ${lastUpdateText} ago`;

		windDirection.value = latestMETAR.wind.direction ?? 0;
		windSpeed.value = latestMETAR.wind.speed ?? 0;
		windGust.value = latestMETAR.wind.gust ?? 0;
		temperature.value = latestMETAR.temperature ?? 15;
		altimeter.value = latestMETAR.altimeter ?? 29.92;

		selectBestWindRunway();
	}
	else if (wxType.value === "TAF") {
		let desiredTime = new Date(forecastTime.value + "Z");
		let latestTAF = response.tafs.sort((a, b) => b.issued - a.issued)[0];
		if (!latestTAF) {
			wxStatusText.value = `No TAFs issued in the last 24 hours at ${weatherStation.value}`;
			wxUpdateText.value = "";
			return;
		}
		wxStatusText.value = latestTAF.raw;

		let secondsSinceUpdate = (Date.now() / 1000) - latestTAF.issued;
		let minutesSinceUpdate = Math.round(secondsSinceUpdate / 60);
		let hoursSinceUpdate = Math.round(secondsSinceUpdate / 60 / 60);

		let lastUpdateText = `${minutesSinceUpdate} minute${minutesSinceUpdate === 1 ? "" : "s"}`;
		if (secondsSinceUpdate > 60 * 60) {
			lastUpdateText = `${hoursSinceUpdate} hour${hoursSinceUpdate === 1 ? "" : "s"}`;
		}
		wxUpdateText.value = `Last updated ${lastUpdateText} ago`;

		if (desiredTime.valueOf() < latestTAF.valid_from * 1000) {
			await openAlert("Invalid forecast time", "The takeoff / land time specified is before the most recent TAF is valid.");
			return;
		}
		if (desiredTime.valueOf() > latestTAF.valid_to * 1000) {
			await openAlert("Invalid forecast time", "The takeoff / land time specified is after the most recent TAF's forecast period.");
			return;
		}

		for (let tafLine of latestTAF.groups) {
			if (desiredTime.valueOf() >= tafLine.valid_time * 1000) {
				if (tafLine.type !== "TEMPO" || tafLine.valid_range.to * 1000 > desiredTime.valueOf()) {
					if (tafLine.wind) {
						windDirection.value = tafLine.wind.direction ?? 0;
						windSpeed.value = tafLine.wind.speed ?? 0;
						windGust.value = tafLine.wind.gust ?? 0;
					}
					if (tafLine.altimeter) {
						altimeter.value = tafLine.altimeter;
					}
				}
			}
		}
		// Temperature not included on TAFs so use the METAR temp
		temperature.value = response.metars[0].temperature ?? 15;

		selectBestWindRunway();
	}
}

///////////////////////////////////////////

const performance: Ref<Performance | null> = ref(null);

const dragItems = computed(() => {
	if (!performance.value) return [];
	return performance.value["Drag Index"].map((item, index) => ({ ...item, index }));
});
const dragItemSelections: Ref<number[]> = ref(JSON.parse(localStorage.getItem("dragItemSelections") ?? "[]"));

const dragIndex = computed(() => {
	if (!performance.value) return 0;
	let dragIndex = 0;
	for (let [index, dragItem] of performance.value["Drag Index"].entries()) {
		dragIndex += dragItem.drag * (dragItemSelections.value[index] ?? 0);
	}
	return dragIndex;
});

function updateDragItemSelections(event: Event, index: number) {
	if (!performance.value) return [];

	let target = event.target as HTMLInputElement;
	let value = 0;
	if (target.type === "checkbox") {
		value = target.checked ? 1 : 0;
	}
	else if (target.type === "number") {
		value = parseInt(target.value);
	}
	dragItemSelections.value[index] = value;
}

// Save values to localStorage when updated
watchEffect(() => {
	localStorage.setItem("dragItemSelections", JSON.stringify(dragItemSelections.value));
	localStorage.setItem("aircraftWeight", aircraftWeight.value.toString());

	localStorage.setItem("icao", icao.value.toString());
	localStorage.setItem("windDirection", windDirection.value.toString());
	localStorage.setItem("windSpeed", windSpeed.value.toString());
	localStorage.setItem("windGust", windGust.value.toString());
	localStorage.setItem("temperature", temperature.value.toString());
	localStorage.setItem("altimeter", altimeter.value.toString());
	localStorage.setItem("aircraftWeight", aircraftWeight.value.toString());
});

// Load configuration
try {
	let response = await fetch("/api/performance");
	performance.value = toml.parse(await response.text());
}
catch (err) {
	if (openAlert) {
		await openAlert("Couldn't load configuration", "Error parsing performance configuration file: " + err);
	}
	window.location.assign("/");
}

///////////////////////////////////////////
const map: Ref<HTMLCanvasElement | null> = ref(null);

function drawAirfieldDiagram() {
	if (!selectedAirfield.value || !selectedRunway.value || !map.value) return;

	let { width, height } = map.value.getBoundingClientRect();
	let deviceScale = window.devicePixelRatio;
	width = Math.floor(width * deviceScale);
	height = Math.floor(height * deviceScale);
	if (width === 0 || height === 0) return;
	map.value.width = width;
	map.value.height = height;
	const ctx = map.value.getContext("2d")!;
	ctx.scale(deviceScale, deviceScale);
	ctx.clearRect(0, 0, width, height);

	let runwayCoordinates = selectedAirfieldRunways.value.flatMap(runway => [
		[parseFloat(runway.HE_WGS_DLONG), parseFloat(runway.HE_WGS_DLAT)],
		[parseFloat(runway.LE_WGS_DLONG), parseFloat(runway.LE_WGS_DLAT)],
	]);

	let minX = NaN, maxX = NaN, minY = NaN, maxY = NaN;
	for (let coordinatePair of runwayCoordinates) {
		if (coordinatePair[0] < minX || isNaN(minX)) {
			minX = coordinatePair[0];
		}
		if (coordinatePair[0] > maxX || isNaN(maxX)) {
			maxX = coordinatePair[0];
		}
		if (coordinatePair[1] < minY || isNaN(minY)) {
			minY = coordinatePair[1];
		}
		if (coordinatePair[1] > maxY || isNaN(maxY)) {
			maxY = coordinatePair[1];
		}
	}
	const mapCoordinateToFrame = (coord: [number, number], additionalScale = 1): [number, number] => {
		let scale = Math.min(width / (maxX - minX), height / (maxY - minY));
		scale *= 0.95; // Don't crowd to edges
		scale *= additionalScale;
		let x = (coord[0] - minX) * scale;
		let y = (coord[1] - minY) * scale;
		// Shift to center
		x += (width - ((maxX - minX) * scale)) / 2;
		y += (height - ((maxY - minY) * scale)) / 2;

		// Map origin point from lower left (maps) to upper left (canvas context)
		y = -y + height;
		return [x / deviceScale, y / deviceScale];
	}

	// Draw runways
	for (let runway of selectedAirfieldRunways.value) {
		let isSelected = runway.HIGH_IDENT === selectedRunway.value.HIGH_IDENT && runway.LOW_IDENT === selectedRunway.value.LOW_IDENT;
		let highEnd = mapCoordinateToFrame([parseFloat(runway.HE_WGS_DLONG), parseFloat(runway.HE_WGS_DLAT)], 0.8);
		let lowEnd  = mapCoordinateToFrame([parseFloat(runway.LE_WGS_DLONG), parseFloat(runway.LE_WGS_DLAT)], 0.8);

		ctx.lineWidth = 5;
		ctx.strokeStyle = isSelected ? "#0284c7" : "black";
		ctx.beginPath();
		ctx.moveTo(highEnd[0], highEnd[1]);
		ctx.lineTo(lowEnd[0], lowEnd[1]);
		ctx.stroke();

		const drawAngleText = (text: string, position: [number, number], angle: number) => {
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";

			ctx.save();
			ctx.translate(position[0], position[1]);
			ctx.rotate(angle * (Math.PI / 180));
			ctx.fillText(text, 0, 16);
			ctx.restore();
		};
		ctx.font = "16px sans-serif";
		if (isSelected && selectedRunwayEnd.value === "HIGH") {
			ctx.fillStyle = "#0284c7";
		}
		else {
			ctx.fillStyle = "black";
		}
		drawAngleText(runway.HIGH_IDENT, highEnd, parseFloat(runway.HE_TRUE_HDG));
		if (isSelected && selectedRunwayEnd.value === "LOW") {
			ctx.fillStyle = "#0284c7";
		}
		else {
			ctx.fillStyle = "black";
		}
		drawAngleText(runway.LOW_IDENT, lowEnd, parseFloat(runway.LE_TRUE_HDG));
	}

	// Draw wind marker
	const windMarkerLength = 40;
	let correctedWindDirection = windDirection.value - 90 + getMagVar();

	let windMarkerCenter = [35, 35];
	windMarkerCenter[0] -= Math.cos(correctedWindDirection * (Math.PI / 180)) * windMarkerLength / 2;
	windMarkerCenter[1] -= Math.sin(correctedWindDirection * (Math.PI / 180)) * windMarkerLength / 2;

	ctx.beginPath();
	ctx.arc(windMarkerCenter[0], windMarkerCenter[1], 3, 0, 2 * Math.PI);
	ctx.fillStyle = "black";
	ctx.fill();

	ctx.lineWidth = 2;
	ctx.strokeStyle = "black";
	ctx.beginPath();
	ctx.moveTo(windMarkerCenter[0], windMarkerCenter[1]);
	ctx.lineTo(
		Math.cos(correctedWindDirection * (Math.PI / 180)) * windMarkerLength + windMarkerCenter[0],
		Math.sin(correctedWindDirection * (Math.PI / 180)) * windMarkerLength + windMarkerCenter[1],
	);
	ctx.stroke();

	function windMark(position: number, length: number) {
		let positionLength = (windMarkerLength * 0.75 / 4) * position;

		ctx.beginPath();
		ctx.moveTo(
			Math.cos(correctedWindDirection * (Math.PI / 180)) * (windMarkerLength - positionLength) + windMarkerCenter[0],
			Math.sin(correctedWindDirection * (Math.PI / 180)) * (windMarkerLength - positionLength) + windMarkerCenter[1],
		);
		ctx.lineTo(
			Math.cos(correctedWindDirection * (Math.PI / 180)) * (windMarkerLength - positionLength) + windMarkerCenter[0] + Math.cos((correctedWindDirection + 60) * (Math.PI / 180)) * length,
			Math.sin(correctedWindDirection * (Math.PI / 180)) * (windMarkerLength - positionLength) + windMarkerCenter[1] + Math.sin((correctedWindDirection + 60) * (Math.PI / 180)) * length,
		);
		ctx.stroke();
	}
	let windMagnitude = Math.round(Math.max(windSpeed.value, windGust.value) / 5) * 5; // Round to nearest 5 knots
	if (windMagnitude > 45) windMagnitude = 45;

	if (windMagnitude === 1) {
		windMark(1, 10);
	}
	else if (windMagnitude > 1) {
		for (let i = 0; i < windMagnitude / 10; i++) {
			windMark(i, i === Math.floor((windMagnitude / 10)) && (windMagnitude / 5) % 2 === 1 ? 10 : 15);
		}
	}
}

const resizeObserver = new ResizeObserver(entries => {
	drawAirfieldDiagram();
});
onMounted(() => resizeObserver.observe(map.value!));
watch([windDirection, windSpeed, windGust, selectedRunway, selectedRunwayEnd], () => drawAirfieldDiagram());

function selectBestWindRunway() {
	let bestWindIndex = NaN;
	runwaysDropdown.value = selectedAirfieldRunways.value
		.flatMap(runway => [
			{ name: runway.HIGH_IDENT, heading: runway.HIGH_HDG, length: runway.LENGTH },
			{ name: runway.LOW_IDENT, heading: runway.LOW_HDG, length: runway.LENGTH }
		])
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((runway, index) => {
			let length = parseInt(runway.length);
			if (isBestWind(parseFloat(runway.heading)) && isNaN(bestWindIndex)) {
				bestWindIndex = index;
			}
			return { name: runway.name, notes: `${length.toLocaleString()} ft` }
		});
	selectedDropdown.value = runwaysDropdown.value[bestWindIndex];
}

async function updateAirfield() {
	if (!openAlert || !performance.value || !icao.value) return;

	// These airfields have different weather station identifiers run by the DoD
	switch (icao.value.toUpperCase()) {
		case "OMAM":
			weatherStation.value = "KQGX";
			break;
		case "OKAS":
			weatherStation.value = "KQGV";
			break;
		case "OTBH":
			weatherStation.value = "KQIR";
			break;
		case "LICZ":
			weatherStation.value = "KQNS";
			break;
		default:
			weatherStation.value = icao.value;
	}

	let airport: DAFIF.Airport | null = selectedAirfield.value;
	selectedAirfield.value = null; // Shows loading text
	try {
		airport = await DAFIF.getAirportInfo(performance.value.DAFIFLocation, icao.value);
	}
	catch (err) {
		await openAlert("Airport not found", `The identifier ${icao.value.toUpperCase()} could not be found in the DAFIF database. Make sure it's a valid ICAO or FAA location identifier.`);
		selectedAirfield.value = airport;
		return;
	}
	selectedAirfieldRunways.value = await DAFIF.getRunwayInfo(performance.value.DAFIFLocation, airport.ARPT_IDENT);
	selectedAirfield.value = airport;

	selectBestWindRunway();

	selectedAirfieldComms.value = (await DAFIF.getCommInfo(performance.value.DAFIFLocation, airport.ARPT_IDENT))
		.filter(freq => freq.FREQ_1)
		.map(freq => {
			freq.FREQ_1 = freq.FREQ_1.match(/(.*?)(0?0?M)$/)?.[1] ?? freq.FREQ_1;
			freq.FREQ_2 = freq.FREQ_2.match(/(.*?)(0?0?M)$/)?.[1] ?? freq.FREQ_2;
			freq.FREQ_3 = freq.FREQ_3.match(/(.*?)(0?0?M)$/)?.[1] ?? freq.FREQ_3;
			freq.FREQ_4 = freq.FREQ_4.match(/(.*?)(0?0?M)$/)?.[1] ?? freq.FREQ_4;
			freq.FREQ_5 = freq.FREQ_5.match(/(.*?)(0?0?M)$/)?.[1] ?? freq.FREQ_5;
			return freq;
		});

	drawAirfieldDiagram();
}
updateAirfield();

</script>
