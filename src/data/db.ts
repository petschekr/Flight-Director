import type { DB } from "@/types/DAFIF";
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

// TODO: how to do DB upgrades
// https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#version_changes_while_a_web_app_is_open_in_another_tab

export interface DAFIFDB extends DBSchema {
	airport: {
		value: DB.Airport;
		key: string;
		indexes: {
			"icaoId": string;
			"faaId": string;
		};
	};
	runway: {
		value: DB.Runway;
		key: number;
		indexes: {
			"airportId": string;
		};
	};
	runwayBarrier: {
		value: DB.RunwayBarrier;
		key: number;
		indexes: {
			"airportId": string;
		};
	};
	runwayBarrierType: {
		value: DB.RunwayBarrierType;
		key: string;
		indexes: {
			"code": string;
		};
	},
	airportComm: {
		value: DB.AirportComm;
		key: number;
		indexes: {
			"airportId": string;
		};
	};
	airportCommRemark: {
		value: DB.AirportCommRemark;
		key: number;
		indexes: {
			"airportId": string;
		};
	}
}

export function getDB(): Promise<IDBPDatabase<DAFIFDB>> {
	return openDB<DAFIFDB>("DAFIF", 2, {
		upgrade(db, oldVersion, newVersion, transaction, event) {
			if (newVersion === null) return;

			if (oldVersion < 1 && newVersion >= 1) {
				let airportStore = db.createObjectStore("airport", { keyPath: "id" });
				// These indices are not unique because airports might not have one or the other
				airportStore.createIndex("icaoId", "icaoId", { unique: false });
				airportStore.createIndex("faaId", "faaId", { unique: false });

				let runwayStore = db.createObjectStore("runway", { autoIncrement: true });
				runwayStore.createIndex("airportId", "airportId", { unique: false });

				let airportCommStore = db.createObjectStore("airportComm", { autoIncrement: true });
				airportCommStore.createIndex("airportId", "airportId", { unique: false });

				let airportCommRemarkStore = db.createObjectStore("airportCommRemark", { autoIncrement: true });
				airportCommRemarkStore.createIndex("airportId", "airportId", { unique: false });
			}
			if (oldVersion < 2 && newVersion >= 2) {
				let runwayBarrierStore = db.createObjectStore("runwayBarrier", { autoIncrement: true });
				runwayBarrierStore.createIndex("airportId", "airportId", { unique: false });

				let runwayBarrierTypeStore = db.createObjectStore("runwayBarrierType", { keyPath: "code" });
				runwayBarrierTypeStore.createIndex("code", "code", { unique: true });
			}
		},
	});
}
