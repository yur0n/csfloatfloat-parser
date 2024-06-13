import { readFile } from 'fs/promises';

const skins = await readFile("src/utils/skinids", "utf-8");

const skinIDs = [];

await (async () => {
	skins.split("\n").forEach((line) => {
		const parts = line.split(";");
		const id = parts[0].trim();
		const name = parts[1].trim();
		skinIDs.push({ name, id });
	});
})();

export default skinIDs;