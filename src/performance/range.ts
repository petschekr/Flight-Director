import { interpolateTable } from "@/performance/ATLC"

const bestRangeDI50 = {
    "20000": {
        "5000":  { max: { kias: 117, ktas: 160, ff: 185 }, min: { kias: 104, ktas: 142, ff: 149 } },
        "6000":  { max: { kias: 118, ktas: 162, ff: 192 }, min: { kias: 109, ktas: 149, ff: 163 } },
        "7000":  { max: { kias: 120, ktas: 164, ff: 202 }, min: { kias: 110, ktas: 151, ff: 172 } },
        "8000":  { max: { kias: 124, ktas: 170, ff: 216 }, min: { kias: 114, ktas: 156, ff: 187 } },
        "9000":  { max: { kias: 124, ktas: 170, ff: 224 }, min: { kias: 121, ktas: 166, ff: 208 } },
        "10000": { max: { kias: 127, ktas: 174, ff: 239 }, min: { kias: 123, ktas: 168, ff: 223 } },
        "10500": { max: { kias: 128, ktas: 175, ff: 246 }, min: { kias: 123, ktas: 168, ff: 228 } },
        "11700": { max: { kias: 135, ktas: 185, ff: 273 }, min: { kias: 129, ktas: 177, ff: 255 } },
    },
    "25000": {
        "5000":  { max: { kias: 111, ktas: 166, ff: 164 }, min: { kias: 100, ktas: 149, ff: 134 } },
        "6000":  { max: { kias: 114, ktas: 170, ff: 175 }, min: { kias: 105, ktas: 157, ff: 149 } },
        "7000":  { max: { kias: 113, ktas: 169, ff: 181 }, min: { kias: 105, ktas: 157, ff: 159 } },
        "8000":  { max: { kias: 114, ktas: 170, ff: 191 }, min: { kias: 110, ktas: 164, ff: 177 } },
        "9000":  { max: { kias: 118, ktas: 176, ff: 208 }, min: { kias: 114, ktas: 170, ff: 193 } },
        "10000": { max: { kias: 122, ktas: 182, ff: 226 }, min: { kias: 118, ktas: 176, ff: 213 } },
        "10500": { max: { kias: 123, ktas: 184, ff: 234 }, min: { kias: 117, ktas: 175, ff: 219 } },
        "11700": { max: { kias: 130, ktas: 194, ff: 265 }, min: { kias: 130, ktas: 194, ff: 265 } },
    },
    "30000": {
        "5000":  { max: { kias: 101, ktas: 165, ff: 140 }, min: { kias: 94, ktas: 154, ff: 119 } },
        "6000":  { max: { kias: 103, ktas: 168, ff: 151 }, min: { kias: 99, ktas: 162, ff: 135 } },
        "7000":  { max: { kias: 106, ktas: 173, ff: 164 }, min: { kias: 102, ktas: 167, ff: 151 } },
        "8000":  { max: { kias: 113, ktas: 185, ff: 185 }, min: { kias: 106, ktas: 173, ff: 168 } },
        "9000":  { max: { kias: 113, ktas: 185, ff: 197 }, min: { kias: 113, ktas: 185, ff: 193 } },
        "10000": { max: { kias: 115, ktas: 188, ff: 215 }, min: { kias: 111, ktas: 181, ff: 207 } },
        "10500": { max: { kias: 114, ktas: 186, ff: 221 }, min: { kias: 114, ktas: 186, ff: 221 } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
};

const bestRangeDI100 = {
    "20000": {
        "5000":  { max: { kias: 110, ktas: 151, ff: 184 }, min: { kias: 103, ktas: 141, ff: 156 } },
        "6000":  { max: { kias: 111, ktas: 152, ff: 191 }, min: { kias: 104, ktas: 142, ff: 165 } },
        "7000":  { max: { kias: 118, ktas: 162, ff: 210 }, min: { kias: 109, ktas: 149, ff: 181 } },
        "8000":  { max: { kias: 117, ktas: 160, ff: 216 }, min: { kias: 113, ktas: 155, ff: 197 } },
        "9000":  { max: { kias: 120, ktas: 164, ff: 230 }, min: { kias: 113, ktas: 155, ff: 207 } },
        "10000": { max: { kias: 123, ktas: 168, ff: 246 }, min: { kias: 118, ktas: 162, ff: 228 } },
        "10500": { max: { kias: 128, ktas: 175, ff: 262 }, min: { kias: 120, ktas: 164, ff: 238 } },
        "11700": { max: { kias: 126, ktas: 173, ff: 272 }, min: { kias: 125, ktas: 171, ff: 265 } },
    },
    "25000": {
        "5000":  { max: { kias: 105, ktas: 157, ff: 164 }, min: { kias: 99, ktas: 148, ff: 141 } },
        "6000":  { max: { kias: 104, ktas: 155, ff: 169 }, min: { kias: 99, ktas: 148, ff: 149 } },
        "7000":  { max: { kias: 106, ktas: 158, ff: 180 }, min: { kias: 103, ktas: 154, ff: 165 } },
        "8000":  { max: { kias: 114, ktas: 170, ff: 203 }, min: { kias: 107, ktas: 160, ff: 182 } },
        "9000":  { max: { kias: 113, ktas: 169, ff: 212 }, min: { kias: 109, ktas: 163, ff: 199 } },
        "10000": { max: { kias: 120, ktas: 179, ff: 238 }, min: { kias: 109, ktas: 163, ff: 212 } },
        "10500": { max: { kias: 121, ktas: 181, ff: 247 }, min: { kias: 114, ktas: 170, ff: 230 } },
        "11700": { max: { kias: 122, ktas: 182, ff: 267 }, min: { kias: 122, ktas: 182, ff: 267 } },
    },
    "30000": {
        "5000":  { max: { kias: 97, ktas: 158, ff: 143 }, min: { kias: 90, ktas: 147, ff: 121 } },
        "6000":  { max: { kias: 102, ktas: 167, ff: 158 }, min: { kias: 92, ktas: 150, ff: 134 } },
        "7000":  { max: { kias: 103, ktas: 168, ff: 169 }, min: { kias: 99, ktas: 162, ff: 156 } },
        "8000":  { max: { kias: 106, ktas: 173, ff: 185 }, min: { kias: 106, ktas: 173, ff: 180 } },
        "9000":  { max: { kias: 109, ktas: 178, ff: 204 }, min: { kias: 105, ktas: 172, ff: 193 } },
        "10000": { max: { kias: 113, ktas: 185, ff: 227 }, min: { kias: 113, ktas: 185, ff: 227 } },
        "10500": { max: { kias: 108, ktas: 176, ff: 226 }, min: { kias: 108, ktas: 176, ff: 226 } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
};

export function bestRange(weight: number, densityAltitude: number, dragIndex: number) {
    let rangeTable = {
        "50": {
            max: {
                kias: interpolateTable(bestRangeDI50, densityAltitude, weight, values => values.max.kias),
                ktas: interpolateTable(bestRangeDI50, densityAltitude, weight, values => values.max.ktas),
                ff: interpolateTable(bestRangeDI50, densityAltitude, weight, values => values.max.ff),
            },
            min: {
                kias: interpolateTable(bestRangeDI50, densityAltitude, weight, values => values.min.kias),
                ktas: interpolateTable(bestRangeDI50, densityAltitude, weight, values => values.min.ktas),
                ff: interpolateTable(bestRangeDI50, densityAltitude, weight, values => values.min.ff),
            },
        },
        "100": {
            max: {
                kias: interpolateTable(bestRangeDI100, densityAltitude, weight, values => values.max.kias),
                ktas: interpolateTable(bestRangeDI100, densityAltitude, weight, values => values.max.ktas),
                ff: interpolateTable(bestRangeDI100, densityAltitude, weight, values => values.max.ff),
            },
            min: {
                kias: interpolateTable(bestRangeDI100, densityAltitude, weight, values => values.min.kias),
                ktas: interpolateTable(bestRangeDI100, densityAltitude, weight, values => values.min.ktas),
                ff: interpolateTable(bestRangeDI100, densityAltitude, weight, values => values.min.ff),
            },
        },
    };

    return {
        max: {
            kias: interpolateTable({ "0": rangeTable }, 0, dragIndex, values => values.max.kias),
            ktas: interpolateTable({ "0": rangeTable }, 0, dragIndex, values => values.max.ktas),
            ff: interpolateTable({ "0": rangeTable }, 0, dragIndex, values => values.max.ff),
        },
        min: {
            kias: interpolateTable({ "0": rangeTable }, 0, dragIndex, values => values.min.kias),
            ktas: interpolateTable({ "0": rangeTable }, 0, dragIndex, values => values.min.ktas),
            ff: interpolateTable({ "0": rangeTable }, 0, dragIndex, values => values.min.ff),
        },
    };
}
