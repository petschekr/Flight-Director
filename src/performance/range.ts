import { interpolateTable } from "@/performance/ATLC"

interface TableEntry {
    max: {
        kias: number | null;
        ktas: number | null;
        ff: number | null;
    };
    min: {
        kias: number | null;
        ktas: number | null;
        ff: number | null;
    };
}
interface WeightValue<T> {
    [weight: string]: T;
}
interface AltitudeValues {
    [altitude: string]: WeightValue<TableEntry>;
}

const bestRangeDI0: AltitudeValues = {
    "0": {
        "5000":  { max: { kias: 162, ktas: 162, ff: 313 }, min: { kias: 135, ktas: 135, ff: 239 } },
        "6000":  { max: { kias: 165, ktas: 165, ff: 322 }, min: { kias: 136, ktas: 136, ff: 246 } },
        "7000":  { max: { kias: 169, ktas: 169, ff: 333 }, min: { kias: 140, ktas: 140, ff: 257 } },
        "8000":  { max: { kias: 168, ktas: 168, ff: 334 }, min: { kias: 143, ktas: 143, ff: 268 } },
        "9000":  { max: { kias: 167, ktas: 167, ff: 336 }, min: { kias: 154, ktas: 154, ff: 294 } },
        "10000": { max: { kias: 171, ktas: 171, ff: 349 }, min: { kias: 150, ktas: 150, ff: 293 } },
        "10500": { max: { kias: 169, ktas: 169, ff: 347 }, min: { kias: 161, ktas: 161, ff: 317 } },
        "11700": { max: { kias: 172, ktas: 172, ff: 360 }, min: { kias: 162, ktas: 162, ff: 326 } },
    },
    "5000": {
        "5000":  { max: { kias: 151, ktas: 163, ff: 275 }, min: { kias: 127, ktas: 137, ff: 213 } },
        "6000":  { max: { kias: 149, ktas: 161, ff: 274 }, min: { kias: 131, ktas: 141, ff: 224 } },
        "7000":  { max: { kias: 156, ktas: 168, ff: 291 }, min: { kias: 143, ktas: 154, ff: 249 } },
        "8000":  { max: { kias: 156, ktas: 168, ff: 295 }, min: { kias: 140, ktas: 151, ff: 249 } },
        "9000":  { max: { kias: 160, ktas: 172, ff: 308 }, min: { kias: 142, ktas: 153, ff: 259 } },
        "10000": { max: { kias: 159, ktas: 171, ff: 311 }, min: { kias: 146, ktas: 157, ff: 273 } },
        "10500": { max: { kias: 158, ktas: 170, ff: 312 }, min: { kias: 152, ktas: 164, ff: 287 } },
        "11700": { max: { kias: 168, ktas: 181, ff: 340 }, min: { kias: 157, ktas: 169, ff: 305 } },
    },
    "10000": {
        "5000":  { max: { kias: 140, ktas: 163, ff: 239 }, min: { kias: 127, ktas: 148, ff: 199 } },
        "6000":  { max: { kias: 142, ktas: 165, ff: 246 }, min: { kias: 134, ktas: 156, ff: 214 } },
        "7000":  { max: { kias: 142, ktas: 165, ff: 251 }, min: { kias: 132, ktas: 154, ff: 216 } },
        "8000":  { max: { kias: 146, ktas: 170, ff: 263 }, min: { kias: 136, ktas: 158, ff: 229 } },
        "9000":  { max: { kias: 147, ktas: 171, ff: 270 }, min: { kias: 135, ktas: 157, ff: 234 } },
        "10000": { max: { kias: 147, ktas: 171, ff: 276 }, min: { kias: 141, ktas: 164, ff: 252 } },
        "10500": { max: { kias: 149, ktas: 173, ff: 283 }, min: { kias: 145, ktas: 169, ff: 263 } },
        "11700": { max: { kias: 156, ktas: 182, ff: 305 }, min: { kias: 149, ktas: 173, ff: 280 } },
    },
    "15000": {
        "5000":  { max: { kias: 131, ktas: 165, ff: 209 }, min: { kias: 123, ktas: 155, ff: 178 } },
        "6000":  { max: { kias: 132, ktas: 166, ff: 215 }, min: { kias: 124, ktas: 156, ff: 185 } },
        "7000":  { max: { kias: 134, ktas: 169, ff: 223 }, min: { kias: 124, ktas: 156, ff: 192 } },
        "8000":  { max: { kias: 135, ktas: 170, ff: 231 }, min: { kias: 126, ktas: 159, ff: 202 } },
        "9000":  { max: { kias: 139, ktas: 175, ff: 244 }, min: { kias: 131, ktas: 165, ff: 217 } },
        "10000": { max: { kias: 141, ktas: 178, ff: 255 }, min: { kias: 136, ktas: 171, ff: 234 } },
        "10500": { max: { kias: 144, ktas: 182, ff: 264 }, min: { kias: 134, ktas: 169, ff: 235 } },
        "11700": { max: { kias: 147, ktas: 185, ff: 280 }, min: { kias: 142, ktas: 179, ff: 261 } },
    },
    "20000": {
        "5000":  { max: { kias: 123, ktas: 168, ff: 183 }, min: { kias: 111, ktas: 152, ff: 149 } },
        "6000":  { max: { kias: 123, ktas: 168, ff: 188 }, min: { kias: 118, ktas: 162, ff: 165 } },
        "7000":  { max: { kias: 127, ktas: 174, ff: 200 }, min: { kias: 118, ktas: 162, ff: 172 } },
        "8000":  { max: { kias: 130, ktas: 178, ff: 212 }, min: { kias: 123, ktas: 168, ff: 188 } },
        "9000":  { max: { kias: 130, ktas: 178, ff: 219 }, min: { kias: 130, ktas: 178, ff: 208 } },
        "10000": { max: { kias: 135, ktas: 185, ff: 236 }, min: { kias: 130, ktas: 178, ff: 218 } },
        "10500": { max: { kias: 135, ktas: 185, ff: 241 }, min: { kias: 127, ktas: 174, ff: 218 } },
        "11700": { max: { kias: 138, ktas: 189, ff: 259 }, min: { kias: 133, ktas: 182, ff: 243 } },
    },
    "25000": {
        "5000":  { max: { kias: 113, ktas: 169, ff: 157 }, min: { kias: 106, ktas: 158, ff: 133 } },
        "6000":  { max: { kias: 114, ktas: 170, ff: 164 }, min: { kias: 105, ktas: 157, ff: 140 } },
        "7000":  { max: { kias: 119, ktas: 178, ff: 178 }, min: { kias: 110, ktas: 164, ff: 154 } },
        "8000":  { max: { kias: 122, ktas: 182, ff: 191 }, min: { kias: 117, ktas: 175, ff: 173 } },
        "9000":  { max: { kias: 125, ktas: 187, ff: 205 }, min: { kias: 119, ktas: 178, ff: 188 } },
        "10000": { max: { kias: 127, ktas: 190, ff: 218 }, min: { kias: 125, ktas: 187, ff: 208 } },
        "10500": { max: { kias: 128, ktas: 191, ff: 226 }, min: { kias: 122, ktas: 182, ff: 211 } },
        "11700": { max: { kias: 132, ktas: 197, ff: 248 }, min: { kias: 128, ktas: 191, ff: 239 } },
    },
    "30000": {
        "5000":  { max: { kias: 105, ktas: 172, ff: 137 }, min: { kias: 103, ktas: 168, ff: 122 } },
        "6000":  { max: { kias: 110, ktas: 180, ff: 150 }, min: { kias: 101, ktas: 165, ff: 128 } },
        "7000":  { max: { kias: 110, ktas: 180, ff: 158 }, min: { kias: 104, ktas: 170, ff: 142 } },
        "8000":  { max: { kias: 116, ktas: 189, ff: 177 }, min: { kias: 113, ktas: 185, ff: 166 } },
        "9000":  { max: { kias: 119, ktas: 194, ff: 192 }, min: { kias: 115, ktas: 188, ff: 181 } },
        "10000": { max: { kias: 122, ktas: 199, ff: 210 }, min: { kias: 116, ktas: 189, ff: 197 } },
        "10500": { max: { kias: 126, ktas: 206, ff: 224 }, min: { kias: 126, ktas: 206, ff: 224 } },
        "11700": { max: { kias: 115, ktas: 188, ff: 227 }, min: { kias: 115, ktas: 188, ff: 227 } },
    },
    "35000": {
        "5000":  { max: { kias: 98, ktas: 176, ff: 120 }, min: { kias: 98, ktas: 176, ff: 111 } },
        "6000":  { max: { kias: 105, ktas: 188, ff: 137 }, min: { kias: 100, ktas: 179, ff: 123 } },
        "7000":  { max: { kias: 105, ktas: 188, ff: 147 }, min: { kias: 100, ktas: 179, ff: 136 } },
        "8000":  { max: { kias: 110, ktas: 197, ff: 166 }, min: { kias: 104, ktas: 187, ff: 154 } },
        "9000":  { max: { kias: 113, ktas: 203, ff: 185 }, min: { kias: 113, ktas: 203, ff: 185 } },
        "10000": { max: { kias: 103, ktas: 185, ff: 190 }, min: { kias: 103, ktas: 185, ff: 190 } },
        "10500": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
    "40000":{
        "5000":  { max: { kias: 94, ktas: 189, ff: 111 }, min: { kias: 94, ktas: 189, ff: 107 } },
        "6000":  { max: { kias: 96, ktas: 193, ff: 124 }, min: { kias: 96, ktas: 193, ff: 122 } },
        "7000":  { max: { kias: 103, ktas: 207, ff: 146 }, min: { kias: 103, ktas: 207, ff: 146 } },
        "8000":  { max: { kias: 98, ktas: 197, ff: 156 }, min: { kias: 98, ktas: 197, ff: 156 } },
        "9000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10000": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10500": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
    "45000":{
        "5000":  { max: { kias: 86, ktas: 195, ff: 101 }, min: { kias: 84, ktas: 190, ff: 96 } },
        "6000":  { max: { kias: 90, ktas: 204, ff: 119 }, min: { kias: 90, ktas: 204, ff: 119 } },
        "7000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "8000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "9000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10000": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10500": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
};
const bestRangeDI50: AltitudeValues = {
    "0": {
        "5000":  { max: { kias: 155, ktas: 155, ff: 317 }, min: { kias: 127, ktas: 127, ff: 239 } },
        "6000":  { max: { kias: 155, ktas: 155, ff: 320 }, min: { kias: 127, ktas: 127, ff: 243 } },
        "7000":  { max: { kias: 156, ktas: 156, ff: 326 }, min: { kias: 131, ktas: 131, ff: 256 } },
        "8000":  { max: { kias: 153, ktas: 153, ff: 323 }, min: { kias: 145, ktas: 145, ff: 289 } },
        "9000":  { max: { kias: 160, ktas: 160, ff: 343 }, min: { kias: 144, ktas: 144, ff: 293 } },
        "10000": { max: { kias: 159, ktas: 159, ff: 345 }, min: { kias: 154, ktas: 154, ff: 320 } },
        "10500": { max: { kias: 163, ktas: 163, ff: 357 }, min: { kias: 153, ktas: 153, ff: 321 } },
        "11700": { max: { kias: 166, ktas: 166, ff: 371 }, min: { kias: 156, ktas: 156, ff: 336 } },
    },
    "5000": {
        "5000":  { max: { kias: 147, ktas: 158, ff: 284 }, min: { kias: 122, ktas: 131, ff: 217 } },
        "6000":  { max: { kias: 139, ktas: 150, ff: 272 }, min: { kias: 123, ktas: 133, ff: 224 } },
        "7000":  { max: { kias: 140, ktas: 151, ff: 278 }, min: { kias: 134, ktas: 144, ff: 249 } },
        "8000":  { max: { kias: 150, ktas: 162, ff: 302 }, min: { kias: 135, ktas: 145, ff: 256 } },
        "9000":  { max: { kias: 150, ktas: 162, ff: 307 }, min: { kias: 139, ktas: 150, ff: 270 } },
        "10000": { max: { kias: 152, ktas: 164, ff: 317 }, min: { kias: 141, ktas: 152, ff: 282 } },
        "10500": { max: { kias: 152, ktas: 164, ff: 320 }, min: { kias: 144, ktas: 155, ff: 290 } },
        "11700": { max: { kias: 156, ktas: 168, ff: 337 }, min: { kias: 147, ktas: 158, ff: 305 } },
    },
    "10000": {
        "5000":  { max: { kias: 134, ktas: 156, ff: 243 }, min: { kias: 125, ktas: 145, ff: 209 } },
        "6000":  { max: { kias: 133, ktas: 155, ff: 245 }, min: { kias: 126, ktas: 147, ff: 214 } },
        "7000":  { max: { kias: 136, ktas: 158, ff: 255 }, min: { kias: 125, ktas: 145, ff: 219 } },
        "8000":  { max: { kias: 141, ktas: 164, ff: 270 }, min: { kias: 128, ktas: 149, ff: 231 } },
        "9000":  { max: { kias: 140, ktas: 163, ff: 274 }, min: { kias: 129, ktas: 150, ff: 240 } },
        "10000": { max: { kias: 147, ktas: 171, ff: 295 }, min: { kias: 138, ktas: 161, ff: 264 } },
        "10500": { max: { kias: 145, ktas: 169, ff: 294 }, min: { kias: 140, ktas: 163, ff: 272 } },
        "11700": { max: { kias: 150, ktas: 175, ff: 314 }, min: { kias: 139, ktas: 162, ff: 280 } },
    },
    "15000": {
        "5000":  { max: { kias: 123, ktas: 155, ff: 209 }, min: { kias: 117, ktas: 147, ff: 181 } },
        "6000":  { max: { kias: 126, ktas: 159, ff: 218 }, min: { kias: 113, ktas: 142, ff: 181 } },
        "7000":  { max: { kias: 128, ktas: 161, ff: 227 }, min: { kias: 118, ktas: 149, ff: 196 } },
        "8000":  { max: { kias: 129, ktas: 163, ff: 235 }, min: { kias: 121, ktas: 153, ff: 207 } },
        "9000":  { max: { kias: 135, ktas: 170, ff: 253 }, min: { kias: 123, ktas: 155, ff: 220 } },
        "10000": { max: { kias: 137, ktas: 173, ff: 265 }, min: { kias: 127, ktas: 160, ff: 235 } },
        "10500": { max: { kias: 139, ktas: 175, ff: 273 }, min: { kias: 130, ktas: 164, ff: 245 } },
        "11700": { max: { kias: 138, ktas: 174, ff: 282 }, min: { kias: 137, ktas: 173, ff: 272 } },
    },
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
        // Estimated addition (not in -1-1)
        // The MQ-9 cannot reach 30,000 ft in this configuration. But this entry is used to interpolate
        // for values slightly above 25,000 DA.
        "11700": { max: { kias: 113, ktas: 185, ff: 240 }, min: { kias: 113, ktas: 185, ff: 240 } },
    },
    "35000": {
        "5000":  { max: { kias: 93, ktas: 167, ff: 122 }, min: { kias: 93, ktas: 167, ff: 113 } },
        "6000":  { max: { kias: 97, ktas: 174, ff: 136 }, min: { kias: 93, ktas: 167, ff: 123 } },
        "7000":  { max: { kias: 102, ktas: 183, ff: 154 }, min: { kias: 98, ktas: 176, ff: 143 } },
        "8000":  { max: { kias: 104, ktas: 187, ff: 170 }, min: { kias: 98, ktas: 176, ff: 159 } },
        "9000":  { max: { kias: 105, ktas: 188, ff: 187 }, min: { kias: 105, ktas: 188, ff: 187 } },
        "10000": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10500": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
    "40000": {
        "5000":  { max: { kias: 89, ktas: 179, ff: 113 }, min: { kias: 88, ktas: 177, ff: 108 } },
        "6000":  { max: { kias: 91, ktas: 183, ff: 127 }, min: { kias: 89, ktas: 179, ff: 123 } },
        "7000":  { max: { kias: 96, ktas: 193, ff: 148 }, min: { kias: 96, ktas: 193, ff: 148 } },
        "8000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "9000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10000": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10500": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
};
const bestRangeDI100: AltitudeValues = {
    "0": {
        "5000":  { max: { kias: 145, ktas: 145, ff: 312 }, min: { kias: 123, ktas: 123, ff: 243 } },
        "6000":  { max: { kias: 147, ktas: 147, ff: 320 }, min: { kias: 124, ktas: 124, ff: 250 } },
        "7000":  { max: { kias: 149, ktas: 149, ff: 328 }, min: { kias: 128, ktas: 128, ff: 264 } },
        "8000":  { max: { kias: 149, ktas: 149, ff: 332 }, min: { kias: 132, ktas: 132, ff: 279 } },
        "9000":  { max: { kias: 150, ktas: 150, ff: 339 }, min: { kias: 135, ktas: 135, ff: 290 } },
        "10000": { max: { kias: 155, ktas: 155, ff: 356 }, min: { kias: 145, ktas: 145, ff: 318 } },
        "10500": { max: { kias: 154, ktas: 154, ff: 356 }, min: { kias: 144, ktas: 144, ff: 319 } },
        "11700": { max: { kias: 156, ktas: 156, ff: 368 }, min: { kias: 150, ktas: 150, ff: 341 } },
    },
    "5000": {
        "5000":  { max: { kias: 141, ktas: 152, ff: 287 }, min: { kias: 112, ktas: 121, ff: 210 } },
        "6000":  { max: { kias: 139, ktas: 150, ff: 286 }, min: { kias: 115, ktas: 124, ff: 221 } },
        "7000":  { max: { kias: 137, ktas: 148, ff: 286 }, min: { kias: 128, ktas: 138, ff: 252 } },
        "8000":  { max: { kias: 140, ktas: 151, ff: 297 }, min: { kias: 128, ktas: 138, ff: 258 } },
        "9000":  { max: { kias: 143, ktas: 154, ff: 310 }, min: { kias: 133, ktas: 143, ff: 274 } },
        "10000": { max: { kias: 142, ktas: 153, ff: 313 }, min: { kias: 138, ktas: 149, ff: 291 } },
        "10500": { max: { kias: 146, ktas: 157, ff: 325 }, min: { kias: 140, ktas: 151, ff: 300 } },
        "11700": { max: { kias: 148, ktas: 159, ff: 338 }, min: { kias: 143, ktas: 154, ff: 315 } },
    },
    "10000": {
        "5000":  { max: { kias: 125, ktas: 145, ff: 239 }, min: { kias: 120, ktas: 140, ff: 210 } },
        "6000":  { max: { kias: 125, ktas: 145, ff: 243 }, min: { kias: 117, ktas: 136, ff: 210 } },
        "7000":  { max: { kias: 137, ktas: 159, ff: 272 }, min: { kias: 121, ktas: 141, ff: 224 } },
        "8000":  { max: { kias: 135, ktas: 157, ff: 273 }, min: { kias: 123, ktas: 143, ff: 234 } },
        "9000":  { max: { kias: 139, ktas: 162, ff: 288 }, min: { kias: 127, ktas: 148, ff: 250 } },
        "10000": { max: { kias: 139, ktas: 162, ff: 295 }, min: { kias: 130, ktas: 151, ff: 264 } },
        "10500": { max: { kias: 136, ktas: 158, ff: 292 }, min: { kias: 136, ktas: 158, ff: 280 } },
        "11700": { max: { kias: 141, ktas: 164, ff: 313 }, min: { kias: 132, ktas: 154, ff: 284 } },
    },
    "15000": {
        "5000":  { max: { kias: 118, ktas: 149, ff: 211 }, min: { kias: 109, ktas: 137, ff: 178 } },
        "6000":  { max: { kias: 122, ktas: 154, ff: 223 }, min: { kias: 114, ktas: 144, ff: 192 } },
        "7000":  { max: { kias: 121, ktas: 153, ff: 227 }, min: { kias: 114, ktas: 144, ff: 199 } },
        "8000":  { max: { kias: 126, ktas: 159, ff: 243 }, min: { kias: 116, ktas: 146, ff: 212 } },
        "9000":  { max: { kias: 128, ktas: 161, ff: 254 }, min: { kias: 119, ktas: 150, ff: 225 } },
        "10000": { max: { kias: 133, ktas: 168, ff: 273 }, min: { kias: 124, ktas: 156, ff: 244 } },
        "10500": { max: { kias: 131, ktas: 165, ff: 273 }, min: { kias: 130, ktas: 164, ff: 261 } },
        "11700": { max: { kias: 132, ktas: 166, ff: 288 }, min: { kias: 130, ktas: 164, ff: 274 } },
    },
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
        // Estimated addition (not in -1-1)
        // The MQ-9 cannot reach 30,000 ft in this configuration. But this entry is used to interpolate
        // for values slightly above 25,000 DA.
        "11700": { max: { kias: 106, ktas: 173, ff: 230 }, min: { kias: 106, ktas: 173, ff: 230 } },
    },
    "35000": {
        "5000":  { max: { kias: 92, ktas: 165, ff: 128 }, min: { kias: 85, ktas: 153, ff: 110 } },
        "6000":  { max: { kias: 95, ktas: 170, ff: 142 }, min: { kias: 90, ktas: 161, ff: 128 } },
        "7000":  { max: { kias: 96, ktas: 172, ff: 155 }, min: { kias: 92, ktas: 165, ff: 144 } },
        "8000":  { max: { kias: 100, ktas: 179, ff: 176 }, min: { kias: 97, ktas: 174, ff: 171 } },
        "9000":  { max: { kias: 97, ktas: 174, ff: 189 }, min: { kias: 97, ktas: 174, ff: 189 } },
        "10000": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10500": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
    "40000": {
        "5000":  { max: { kias: 85, ktas: 171, ff: 115 }, min: { kias: 83, ktas: 167, ff: 110 } },
        "6000":  { max: { kias: 90, ktas: 181, ff: 135 }, min: { kias: 86, ktas: 173, ff: 128 } },
        "7000":  { max: { kias: 92, ktas: 185, ff: 153 }, min: { kias: 92, ktas: 185, ff: 153 } },
        "8000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "9000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10000": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10500": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
};
const bestRangeDI200: AltitudeValues = {
    "0": {
        "5000":  { max: { kias: 137, ktas: 137, ff: 322 }, min: { kias: 111, ktas: 111, ff: 240 } },
        "6000":  { max: { kias: 136, ktas: 136, ff: 323 }, min: { kias: 113, ktas: 113, ff: 250 } },
        "7000":  { max: { kias: 135, ktas: 135, ff: 324 }, min: { kias: 118, ktas: 118, ff: 267 } },
        "8000":  { max: { kias: 139, ktas: 139, ff: 339 }, min: { kias: 123, ktas: 123, ff: 285 } },
        "9000":  { max: { kias: 140, ktas: 140, ff: 346 }, min: { kias: 135, ktas: 135, ff: 319 } },
        "10000": { max: { kias: 141, ktas: 141, ff: 355 }, min: { kias: 135, ktas: 135, ff: 326 } },
        "10500": { max: { kias: 144, ktas: 144, ff: 365 }, min: { kias: 139, ktas: 139, ff: 340 } },
        "11700": { max: { kias: 146, ktas: 146, ff: 378 }, min: { kias: 136, ktas: 136, ff: 341 } },
    },
    "5000": {
        "5000":  { max: { kias: 127, ktas: 137, ff: 282 }, min: { kias: 107, ktas: 115, ff: 220 } },
        "6000":  { max: { kias: 127, ktas: 137, ff: 286 }, min: { kias: 119, ktas: 128, ff: 250 } },
        "7000":  { max: { kias: 129, ktas: 139, ff: 295 }, min: { kias: 119, ktas: 128, ff: 256 } },
        "8000":  { max: { kias: 131, ktas: 141, ff: 305 }, min: { kias: 122, ktas: 131, ff: 269 } },
        "9000":  { max: { kias: 133, ktas: 143, ff: 316 }, min: { kias: 122, ktas: 131, ff: 277 } },
        "10000": { max: { kias: 135, ktas: 145, ff: 327 }, min: { kias: 128, ktas: 138, ff: 298 } },
        "10500": { max: { kias: 137, ktas: 148, ff: 336 }, min: { kias: 129, ktas: 139, ff: 304 } },
        "11700": { max: { kias: 137, ktas: 148, ff: 345 }, min: { kias: 132, ktas: 142, ff: 322 } },
    },
    "10000": {
        "5000":  { max: { kias: 120, ktas: 140, ff: 250 }, min: { kias: 109, ktas: 127, ff: 209 } },
        "6000":  { max: { kias: 122, ktas: 142, ff: 259 }, min: { kias: 111, ktas: 129, ff: 219 } },
        "7000":  { max: { kias: 120, ktas: 140, ff: 260 }, min: { kias: 114, ktas: 133, ff: 233 } },
        "8000":  { max: { kias: 124, ktas: 144, ff: 275 }, min: { kias: 112, ktas: 130, ff: 235 } },
        "9000":  { max: { kias: 124, ktas: 144, ff: 282 }, min: { kias: 116, ktas: 135, ff: 252 } },
        "10000": { max: { kias: 126, ktas: 147, ff: 295 }, min: { kias: 124, ktas: 144, ff: 278 } },
        "10500": { max: { kias: 129, ktas: 150, ff: 306 }, min: { kias: 125, ktas: 145, ff: 286 } },
        "11700": { max: { kias: 131, ktas: 152, ff: 323 }, min: { kias: 123, ktas: 143, ff: 294 } },
    },
    "15000": {
        "5000":  { max: { kias: 112, ktas: 141, ff: 219 }, min: { kias: 100, ktas: 126, ff: 179 } },
        "6000":  { max: { kias: 117, ktas: 147, ff: 235 }, min: { kias: 103, ktas: 130, ff: 191 } },
        "7000":  { max: { kias: 117, ktas: 147, ff: 241 }, min: { kias: 108, ktas: 136, ff: 208 } },
        "8000":  { max: { kias: 117, ktas: 147, ff: 248 }, min: { kias: 110, ktas: 139, ff: 222 } },
        "9000":  { max: { kias: 120, ktas: 151, ff: 263 }, min: { kias: 112, ktas: 141, ff: 235 } },
        "10000": { max: { kias: 119, ktas: 150, ff: 270 }, min: { kias: 115, ktas: 145, ff: 252 } },
        "10500": { max: { kias: 121, ktas: 153, ff: 280 }, min: { kias: 118, ktas: 149, ff: 263 } },
        "11700": { max: { kias: 125, ktas: 158, ff: 303 }, min: { kias: 119, ktas: 150, ff: 281 } },
    },
    "20000": {
        "5000":  { max: { kias: 101, ktas: 138, ff: 185 }, min: { kias: 94, ktas: 129, ff: 157 } },
        "6000":  { max: { kias: 102, ktas: 140, ff: 193 }, min: { kias: 97, ktas: 133, ff: 170 } },
        "7000":  { max: { kias: 109, ktas: 149, ff: 214 }, min: { kias: 101, ktas: 138, ff: 186 } },
        "8000":  { max: { kias: 108, ktas: 148, ff: 220 }, min: { kias: 102, ktas: 140, ff: 198 } },
        "9000":  { max: { kias: 111, ktas: 152, ff: 236 }, min: { kias: 111, ktas: 152, ff: 227 } },
        "10000": { max: { kias: 115, ktas: 157, ff: 256 }, min: { kias: 111, ktas: 152, ff: 241 } },
        "10500": { max: { kias: 114, ktas: 156, ff: 261 }, min: { kias: 112, ktas: 153, ff: 249 } },
        "11700": { max: { kias: 117, ktas: 160, ff: 284 }, min: { kias: 114, ktas: 156, ff: 274 } },
    },
    "25000": {
        "5000":  { max: { kias: 98, ktas: 146, ff: 168 }, min: { kias: 89, ktas: 133, ff: 140 } },
        "6000":  { max: { kias: 100, ktas: 149, ff: 179 }, min: { kias: 90, ktas: 134, ff: 151 } },
        "7000":  { max: { kias: 101, ktas: 151, ff: 190 }, min: { kias: 96, ktas: 143, ff: 171 } },
        "8000":  { max: { kias: 106, ktas: 158, ff: 210 }, min: { kias: 103, ktas: 154, ff: 196 } },
        "9000":  { max: { kias: 106, ktas: 158, ff: 222 }, min: { kias: 105, ktas: 157, ff: 214 } },
        "10000": { max: { kias: 108, ktas: 161, ff: 241 }, min: { kias: 103, ktas: 154, ff: 228 } },
        "10500": { max: { kias: 112, ktas: 167, ff: 257 }, min: { kias: 107, ktas: 160, ff: 245 } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
    "30000": {
        "5000":  { max: { kias: 89, ktas: 145, ff: 144 }, min: { kias: 81, ktas: 132, ff: 121 } },
        "6000":  { max: { kias: 94, ktas: 154, ff: 161 }, min: { kias: 88, ktas: 144, ff: 143 } },
        "7000":  { max: { kias: 98, ktas: 160, ff: 179 }, min: { kias: 94, ktas: 154, ff: 166 } },
        "8000":  { max: { kias: 99, ktas: 162, ff: 194 }, min: { kias: 95, ktas: 155, ff: 182 } },
        "9000":  { max: { kias: 102, ktas: 167, ff: 215 }, min: { kias: 95, ktas: 155, ff: 199 } },
        "10000": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10500": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
    "35000": {
        "5000":  { max: { kias: 84, ktas: 151, ff: 130 }, min: { kias: 79, ktas: 142, ff: 114 } },
        "6000":  { max: { kias: 89, ktas: 160, ff: 148 }, min: { kias: 85, ktas: 153, ff: 136 } },
        "7000":  { max: { kias: 91, ktas: 163, ff: 165 }, min: { kias: 88, ktas: 158, ff: 157 } },
        "8000":  { max: { kias: 94, ktas: 169, ff: 187 }, min: { kias: 94, ktas: 169, ff: 187 } },
        "9000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10000": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10500": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
    "40000": {
        "5000":  { max: { kias: 79, ktas: 159, ff: 120 }, min: { kias: 78, ktas: 157, ff: 115 } },
        "6000":  { max: { kias: 82, ktas: 165, ff: 138 }, min: { kias: 82, ktas: 165, ff: 138 } },
        "7000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "8000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "9000":  { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10000": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "10500": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
        "11700": { max: { kias: null, ktas: null, ff: null }, min: { kias: null, ktas: null, ff: null } },
    },
};

export function bestRange(weight: number, densityAltitude: number, dragIndex: number): TableEntry {
    if (densityAltitude < 0) {
        densityAltitude = 0;
    }

    function getDITableEntry(table: AltitudeValues): TableEntry {
        return {
            max: {
                kias: interpolateTable(table, densityAltitude, weight, values => values.max.kias),
                ktas: interpolateTable(table, densityAltitude, weight, values => values.max.ktas),
                ff: interpolateTable(table, densityAltitude, weight, values => values.max.ff),
            },
            min: {
                kias: interpolateTable(table, densityAltitude, weight, values => values.min.kias),
                ktas: interpolateTable(table, densityAltitude, weight, values => values.min.ktas),
                ff: interpolateTable(table, densityAltitude, weight, values => values.min.ff),
            },
        }
    }

    let rangeTable = {
        "0": getDITableEntry(bestRangeDI0),
        "50": getDITableEntry(bestRangeDI50),
        "100": getDITableEntry(bestRangeDI100),
        "200": getDITableEntry(bestRangeDI200),
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
