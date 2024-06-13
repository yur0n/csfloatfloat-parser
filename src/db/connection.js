import { connect } from 'mongoose';

export default async function connectToDb() {
	await connect(process.env.MONGODB_CONNECTION)
}