import { parse } from "csv-parse/browser/esm";

import type { DB, DAFIF } from "@/types/DAFIF";
import type { StoreNames } from "idb";
import { getDB, type DAFIFDB } from "@/data/db";

export async function getDAFIFVersion(dafifLocation: string): Promise<{ start: Date, end: Date, cycle: string }> {
	let versionFile = await fetch(`/api/download/${dafifLocation}/VERSION`);
	const versionContents = await versionFile.text();
	let versionInfo = versionContents.split("\n")[0];
	let productionCycle = versionInfo.substring(0, 4);
	function dateAtIndex(s: string, startIndex: number): Date {
		let day = s.substring(startIndex + 0, startIndex + 2);
		let month = s.substring(startIndex + 2, startIndex + 4);
		let year = s.substring(startIndex + 4, startIndex + 8);

		let date = new Date();
		date.setUTCFullYear(parseInt(year), parseInt(month) - 1, parseInt(day));
		return date;
	}
	let startDate = dateAtIndex(versionInfo, 4);
	let endDate = dateAtIndex(versionInfo, 12);

	return {
		start: startDate,
		end: endDate,
		cycle: productionCycle,
	};
}

export async function importDAFIF(dafifLocation: string): Promise<void> {
    console.time("DAFIF import");
    const db = await getDB();

    function importContents<
		DAFIFType,
		DBType extends
			DB.Airport |
			DB.Runway | DB.RunwayBarrier | DB.RunwayBarrierType |
			DB.AirportComm | DB.AirportCommRemark
	>(
		url: string,
		storeName: StoreNames<DAFIFDB>,
		mapper: (record: DAFIFType) => DBType
	): Promise<void> {
		return new Promise<void>(async (resolve, reject) => {
			let tsv = await fetch(url);
			let content = await tsv.text()

			const tx = db.transaction(storeName, "readwrite");
			await tx.store.clear();

			const parser = parse({ columns: true, delimiter: "\t", relax_quotes: true });
			parser.on("readable", () => {
				let record: DAFIFType;
				while ((record = parser.read()) !== null) {
					tx.store.put(mapper(record));
				}
			});
			parser.on("end", async () => {
				// Commit tx
				await tx.done;
				resolve();
			});

			parser.write(content);
			parser.end();
		});
	}

    const imports: Promise<void>[] = [
        importContents<DAFIF.Airport, DB.Airport>(`/api/download/${dafifLocation}/DAFIFT/ARPT/ARPT.TXT`, "airport", record => {
            function parseMagVar(magVar: string): number {
                let parsed = magVar.match(/^(E|W)(\d\d\d)(\d\d\d)/);
                if (!parsed) return 0;

                let variation = parseInt(parsed[2]);
                variation += parseInt(parsed[3]) / 10 / 60;
                if (parsed[1] === "W") {
                    variation *= -1;
                }
                return variation;
            }
            return {
                id: record.ARPT_IDENT,
                beacon: record.BEACON === "Y",
                elevation: parseInt(record.ELEV),
                icaoId: record.ICAO,
                faaId: record.FAA_HOST_ID,
                magVar: parseMagVar(record.MAG_VAR),
                name: record.NAME,
            };
        }),

        importContents<DAFIF.Runway, DB.Runway>(`/api/download/${dafifLocation}/DAFIFT/ARPT/RWY.TXT`, "runway", record => {
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
			return {
				airportId: record.ARPT_IDENT,
				closed: record.CLD_RWY === "C",
				length: parseInt(record.LENGTH),
				width: parseInt(record.RWY_WIDTH),
				surface: surfaceTypes[record.SURFACE] ?? "Unknown",
				high: {
					name: record.HIGH_IDENT,
					heading: {
						mag: parseFloat(record.HIGH_HDG),
						true: parseFloat(record.HE_TRUE_HDG),
					},
					elevation: parseFloat(record.HE_ELEV),
					tdze: record.HE_TDZE !== "U" ? parseFloat(record.HE_TDZE) : null,
					slope: record.HE_SLOPE !== "U" ? parseFloat(record.HE_SLOPE) : null,
					displacedThreshold: record.HE_DT ? parseInt(record.HE_DT) : null,
					displacedThresholdElevation: record.HE_DT_ELEV && record.HE_DT_ELEV !== "U" ? parseFloat(record.HE_DT_ELEV) : null,
					distances: {
						lda: record.HELAND_DIS ? parseInt(record.HELAND_DIS) : null,
						tora: record.HE_TORA ? parseInt(record.HE_TORA) : null,
						toda: record.HE_TODA ? parseInt(record.HE_TODA) : null,
						asda: record.HE_ASDA ? parseInt(record.HE_ASDA) : null,
					},
					position: {
						lat: parseFloat(record.HE_WGS_DLAT),
						long: parseFloat(record.HE_WGS_DLONG),
					},
				},
				low: {
					name: record.LOW_IDENT,
					heading: {
						mag: parseFloat(record.LOW_HDG),
						true: parseFloat(record.LE_TRUE_HDG),
					},
					elevation: parseFloat(record.LE_ELEV),
					tdze: record.LE_TDZE !== "U" ? parseFloat(record.LE_TDZE) : null,
					slope: record.LE_SLOPE !== "U" ? parseFloat(record.LE_SLOPE) : null,
					displacedThreshold: record.LE_DT ? parseInt(record.LE_DT) : null,
					displacedThresholdElevation: record.LE_DT_ELEV && record.LE_DT_ELEV !== "U" ? parseFloat(record.LE_DT_ELEV) : null,
					distances: {
						lda: record.LELAND_DIS ? parseInt(record.LELAND_DIS) : null,
						tora: record.LE_TORA ? parseInt(record.LE_TORA) : null,
						toda: record.LE_TODA ? parseInt(record.LE_TODA) : null,
						asda: record.LE_ASDA ? parseInt(record.LE_ASDA) : null,
					},
					position: {
						lat: parseFloat(record.LE_WGS_DLAT),
						long: parseFloat(record.LE_WGS_DLONG),
					},
				},
			};
		}),

		importContents<DAFIF.RunwayBarrier, DB.RunwayBarrier>(`/api/download/${dafifLocation}/DAFIFT/ARPT/AGEAR.TXT`, "runwayBarrier", record => {
			return {
				airportId: record.ARPT_IDENT,
				runwayName: record.RWY_IDENT,
				distanceFromThreshold: parseInt(record.LOCATION),
				energyAbsorbingSystem: record.TYPE.substring(0, 2),
				engagingDevice: record.TYPE.substring(2, 4),
			};
		}),

		importContents<DAFIF.RunwayBarrierType, DB.RunwayBarrierType>(`/api/download/${dafifLocation}/DAFIFT/APPC/APPC_ENGAGING_DEV.TXT`, "runwayBarrierType", record => {
			if (!record.EN_CODE) return;
			return {
				code: record.EN_CODE,
				type: record.TYPE,
				description: record.DESCRIPTION,
			};
		}),
		importContents<DAFIF.RunwayBarrierType, DB.RunwayBarrierType>(`/api/download/${dafifLocation}/DAFIFT/APPC/APPC_ABSORBING_SYS.TXT`, "runwayBarrierType", record => {
			if (!record.AB_CODE) return;
			return {
				code: record.AB_CODE,
				type: record.TYPE,
				description: record.DESCRIPTION,
			};
		}),

		importContents<DAFIF.AirportComm, DB.AirportComm>(`/api/download/${dafifLocation}/DAFIFT/ARPT/ACOM.TXT`, "airportComm", record => {
			return {
				airportId: record.ARPT_IDENT,
				name: record.COMM_NAME,
				type: record.COMM_TYPE,
				sector: record.SEC.replace(/�/gi, "°"), // Encoding error in DAFIF?
				operatingHours: record.S_OPR_H,
				freqs: [record.FREQ_1, record.FREQ_2, record.FREQ_3, record.FREQ_4, record.FREQ_5]
					.filter(freq => freq !== "")
					.map(freq => freq.match(/(.*?)(0?0?M)$/)?.[1] ?? freq),
			};
		}),

		importContents<DAFIF.AiportCommRemark, DB.AirportCommRemark>(`/api/download/${dafifLocation}/DAFIFT/ARPT/ACOM_RMK.TXT`, "airportCommRemark", record => {
			return {
				airportId: record.ARPT_IDENT,
				type: record.COMM_TYPE,
				remark: record.REMARK,
			};
		}),
    ];
    await Promise.all(imports);

    console.timeEnd("DAFIF import");
}
