import mongoose from "mongoose";

const skinSchema = new mongoose.Schema({
	_id: Number,
	name: String,
	price: Number
});

const userSchema = new mongoose.Schema({
	_id: {
		type: Number,
		ref: 'Sub'
	},
	code: String
});

const subSchema = new mongoose.Schema({
	_id: { 
		type: Number, 
		ref: 'User'
	},
	code: String,
	expirationDate: {
		type: Date,
		expires: 0
	}
});

const Skin = mongoose.model('Skin', skinSchema);
const User = mongoose.model('User', userSchema);
const Sub = mongoose.model('Sub', subSchema);

export { Skin, User, Sub }