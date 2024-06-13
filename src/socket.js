import { Server } from 'socket.io';

const users = {}

export default (server) => {
	const io = new Server(server);

	io.use((socket, next) => {
		const auth = getAuth(socket);
		if (!auth) {
			const err = new Error("Unauthorized");
			err.data = { content: "Please provide valid credentials" };
			next(err);
		} else 
    if (users[auth]) {
      const err = new Error("User already connected");
      err.data = { content: "Please disconnect the other connection first" };
      next(err);
    } else {
      users[auth] = socket.id;
      socket.auth = auth;
      next();
    }
		
	});

	io.on('connection', (socket) => {
		socket.on('parsing', (msg) => {
			socket.emit('parsing_allowed', msg)
		});
		socket.on('disconnect', () => {
			delete users[socket.auth];
		});
	});
	return io;
}

function getAuth(socket) {
	const { cookie } = socket.handshake.headers;
    if (cookie) {
        const values = cookie.split(';').reduce((res, item) => {
            const data = item.trim().split('=');
            return { ...res, [data[0]]: data[1] };
        }, {});
        return values.auth;
    }
	return undefined;
}