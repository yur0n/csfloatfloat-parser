import express from 'express';
import cors from 'cors';
import { join } from 'path';
import { Skin, Sub } from './models/models.js';
import notifyTg from '../bots/bot_notifier.js';


const codePattern = /^[A-Za-z0-9%$#@!*()]{2}[A-Za-z0-9%$#@!*()]\d{2}[A-Za-z0-9%$#@!*()]\d{2}[A-Za-z0-9%$#@!*()]\d{2}[A-Za-z0-9%$#@!*()]\d+[A-Za-z0-9%$#@!*()]\d+$/;

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(join(import.meta.dirname, '../public')));
app.set('views', join(import.meta.dirname, '../views'));
app.set('view engine', 'ejs');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use((req, res, next) => {
    const { cookie } = req.headers;
    if (cookie) {
        const values = cookie.split(';').reduce((res, item) => {
            const data = item.trim().split('=');
            return { ...res, [data[0]]: data[1] };
        }, {});
        res.locals.cookie = values;
    }
    else res.locals.cookie = {};
    next();
});

app.get('/', auth, (req, res) => {
	if (!req.user.auth) return res.render('auth');
	res.render('index');
});

app.post('/telegram', async (req, res) => {
	try {
		const { chatId, data } = req.body;
		if (chatId && data) {
				await notifyTg(data, chatId);
				return res.send({ success: 'Notification sent' });
		}
		res.send({ fail: 'Invalid data' });
	} catch (error) {
		console.log(error);
		res.send({ fail: error.message });
	}
});

app.get('/subscribe', async (req, res) => {
	try {
		const authorization = req.headers['authorization'];
		const code = authorization ? authorization.split(' ')[1] : null;
		if (authorization && codePattern.test(code)) {
			const sub = await Sub.findOne({ code });
			if (sub) {
				res.cookie('auth', code, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true });
				res.send({ success: 'Access granted' });
				return;
			} 
		}
		res.send({ fail: 'Invalid code' });
	} catch (error) {
		console.log(error)
		res.send({ fail: error.message });
	}
});

// app.get('/parsing', auth, async (req, res) => {
// 	res.send({ message: 'Authorized' });
// });

app.get('/skins', async (req, res) => {
    let skins = await Skin.find();
    res.send(skins);
});

async function auth(req, res, next) {
	req.user = { auth: false };
	try {
		const { auth } = res.locals.cookie;
		if (auth && codePattern.test(auth)) {
			const sub = await Sub.findOne({ code: auth });
			if (sub) {
				req.user = { auth: true };
			}
		}
		next();
	} catch (error) {
		console.log(error);
		next();
	}
}

export default app