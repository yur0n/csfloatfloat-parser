import fs from 'fs';
import readline from 'readline';
import { Skin } from '../src/models/models.js';
import '../src/db/connection.js';

seed();

async function seed() {
	try {
		const fileStream = fs.createReadStream('scripts/buffSkins');
		const rl = readline.createInterface({
				input: fileStream,
				crlfDelay: Infinity
		});

		const data = [];
		for await (const line of rl) {
				data.push(JSON.parse(line));
		}

		await Skin.insertMany(data, { ordered: false });
		console.log('Documents inserted');
		process.exit();

	} catch (error) {
		console.error(error);
		process.exit(1);
	}
}
