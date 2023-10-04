const input = `
85 83 90 86 92 92
171 167 181 173 185 185
115 110 135 128 153 153
`;

let lines = input.trim().split("\n").map(line => line.trim());

let maxKIAS = lines[0].split(" ").filter((val, index) => index % 2 === 0);
let minKIAS = lines[0].split(" ").filter((val, index) => index % 2 === 1);
let maxKTAS = lines[1].split(" ").filter((val, index) => index % 2 === 0);
let minKTAS = lines[1].split(" ").filter((val, index) => index % 2 === 1);
let maxFF = lines[2].split(" ").filter((val, index) => index % 2 === 0);
let minFF = lines[2].split(" ").filter((val, index) => index % 2 === 1);


console.log(`{
	"5000":  { max: { kias: ${maxKIAS[0]}, ktas: ${maxKTAS[0]}, ff: ${maxFF[0]} }, min: { kias: ${minKIAS[0]}, ktas: ${minKTAS[0]}, ff: ${minFF[0]} } },
	"6000":  { max: { kias: ${maxKIAS[1]}, ktas: ${maxKTAS[1]}, ff: ${maxFF[1]} }, min: { kias: ${minKIAS[1]}, ktas: ${minKTAS[1]}, ff: ${minFF[1]} } },
	"7000":  { max: { kias: ${maxKIAS[2]}, ktas: ${maxKTAS[2]}, ff: ${maxFF[2]} }, min: { kias: ${minKIAS[2]}, ktas: ${minKTAS[2]}, ff: ${minFF[2]} } },
	"8000":  { max: { kias: ${maxKIAS[3]}, ktas: ${maxKTAS[3]}, ff: ${maxFF[3]} }, min: { kias: ${minKIAS[3]}, ktas: ${minKTAS[3]}, ff: ${minFF[3]} } },
	"9000":  { max: { kias: ${maxKIAS[4]}, ktas: ${maxKTAS[4]}, ff: ${maxFF[4]} }, min: { kias: ${minKIAS[4]}, ktas: ${minKTAS[4]}, ff: ${minFF[4]} } },
	"10000": { max: { kias: ${maxKIAS[5]}, ktas: ${maxKTAS[5]}, ff: ${maxFF[5]} }, min: { kias: ${minKIAS[5]}, ktas: ${minKTAS[5]}, ff: ${minFF[5]} } },
	"10500": { max: { kias: ${maxKIAS[6]}, ktas: ${maxKTAS[6]}, ff: ${maxFF[6]} }, min: { kias: ${minKIAS[6]}, ktas: ${minKTAS[6]}, ff: ${minFF[6]} } },
	"11700": { max: { kias: ${maxKIAS[7]}, ktas: ${maxKTAS[7]}, ff: ${maxFF[7]} }, min: { kias: ${minKIAS[7]}, ktas: ${minKTAS[7]}, ff: ${minFF[7]} } },
}`);
