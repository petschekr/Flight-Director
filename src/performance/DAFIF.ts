import { parse } from "csv-parse/browser/esm";

async function searchTSV<T>(url: string, predicate: (record: T) => boolean): Promise<T[]> {
	return new Promise(async (resolve, reject) => {
		const parser = parse({ columns: true, delimiter: "\t" });
		let foundRecords: T[] = [];
		parser.on("readable", () => {
			let record: T;
			while ((record = parser.read()) !== null) {
				if (predicate(record)) {
					foundRecords.push(record);
				}
			}
		});
		parser.on("end", () => {
			if (foundRecords.length > 0) {
				resolve(foundRecords);
			}
			else {
				reject("Identifier not found via predicate");
			}
		});

		let tsvContents = await fetch(url);
		parser.write(await tsvContents.text());
		parser.end();
	});
}

export interface Airport {
	ARPT_IDENT: string;
	BEACON: "Y" | "N";
	ELEV: string; // Leading zero padded
	ICAO: string;
	FAA_HOST_ID: string;
	MAG_VAR: string; // e.g. W007588 0123
	NAME: string;
}
export async function getAirportInfo(dafifLocation: string, identifier: string): Promise<Airport> {
	return searchTSV<Airport>(`/download/${dafifLocation}/DAFIFT/ARPT/ARPT.TXT`, record => [record.ICAO.toUpperCase(), record.FAA_HOST_ID.toUpperCase()].includes(identifier.toUpperCase())).then(airport => airport[0]);
}

export interface Runway {
	ARPT_IDENT: string;
	SURFACE: string; // See legend
	LENGTH: string;
	RWY_WIDTH: string; // Zero padded
	CLD_RWY: "C" | ""; // Closed status

	HIGH_IDENT: string;
	HIGH_HDG: string; // Float
	HE_ELEV: string; // Float
	HE_SLOPE: string; // Float
	HE_TDZE: string; // Float
	HE_DT: string; // Displaced threshold, float
	HE_DT_ELEV: string; // Float
	HELAND_DIS: string;
	HE_TORA: string;
	HE_TODA: string;
	HE_ASDA: string;
	HE_WGS_DLAT: string;
	HE_WGS_DLONG: string;
	HE_TRUE_HDG: string;

	LOW_IDENT: string;
	LOW_HDG: string; // Float
	LE_ELEV: string; // Float
	LE_SLOPE: string; // Float
	LE_TDZE: string; // Float
	LE_DT: string; // Displaced threshold, float
	LE_DT_ELEV: string; // Float
	LELAND_DIS: string;
	LE_TORA: string;
	LE_TODA: string;
	LE_ASDA: string;
	LE_WGS_DLAT: string;
	LE_WGS_DLONG: string;
	LE_TRUE_HDG: string;
}
export async function getRunwayInfo(dafifLocation: string, airportIdentifier: string): Promise<Runway[]> {
	return (await searchTSV<Runway>(`/download/${dafifLocation}/DAFIFT/ARPT/RWY.TXT`, record => record.ARPT_IDENT.toUpperCase() === airportIdentifier.toUpperCase())).map(runway => {
		const surfaceTypes: { [abbr: string]: string } = {
			"ASP": "Asphalt",
			"BIT": "Tar",
			"BRI": "Brick",
			"CLA": "Clay",
			"COM": "Composite (Temporary)",
			"CON": "Concrete",
			"COP": "Composite (Permanent)",
			"COR": "Coral",
			"GRE": "Graded Earth",
			"GRS": "Grass",
			"GVL": "Gravel",
			"ICE": "Ice",
			"LAT": "Laterite",
			"MAC": "Macadam",
			"MEM": "Plastic Membrane",
			"MIX": "Mix",
			"PEM": "Concrete/Asphalt",
			"PER": "Unknown (Permanent)",
			"PSP": "Steel Planking",
			"SAN": "Sand",
			"SNO": "Snow",
			"U": "Unknown",
		};
		if (surfaceTypes[runway.SURFACE]) {
			runway.SURFACE = surfaceTypes[runway.SURFACE];
		}
		return runway;
	});
}

export interface AirportComms {
	ARPT_IDENT: string;
	COMM_NAME: string;
	COMM_TYPE: string;
	FREQ_1: string;
	FREQ_2: string;
	FREQ_3: string;
	FREQ_4: string;
	FREQ_5: string;
	S_OPR_H: string;
}
export async function getCommInfo(dafifLocation: string, airportIdentifier: string): Promise<AirportComms[]> {
	return searchTSV<AirportComms>(`/download/${dafifLocation}/DAFIFT/ARPT/ACOM.TXT`, record => record.ARPT_IDENT.toUpperCase() === airportIdentifier.toUpperCase());
}
