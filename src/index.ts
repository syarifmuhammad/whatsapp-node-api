import makeWASocket, { DisconnectReason, BufferJSON, useMultiFileAuthState } from '@adiwajshing/baileys'
import { Boom } from '@hapi/boom'

import * as fs from 'fs'
let sock: any;



const Hapi = require('@hapi/hapi');

const init = async () => {
    const server = Hapi.server({
        port: 8080,
        host: 'localhost',
        routes: {
            cors: {
                origin: ['*'],
            },
        },
    });

    server.route([
        {
            method: 'GET',
            path: '/',
            handler: (request: any, h: any) => {
                return "Berhasil !";
            }
        },
        {
            method: 'POST',
            path: '/send-text',
            handler: async (request: any, h: any) => {
                const { number, text } = request.payload;
                if (sock) {
                    await sock.sendMessage(number, { text: text });
                    return true;
                } else {
                    const response = h.response({
                        status: 'fail',
                        message: 'Whatsapp belum login !',
                    });
                    response.code(404);
                    return response;
                }

            },
        },
    ]);

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
};

init();



async function connectToWhatsApp() {
    useMultiFileAuthState('auth_info_baileys').then(({ state, saveCreds }) => {
        sock = makeWASocket({
            auth: state,
            printQRInTerminal: true
        })
        sock.ev.on('creds.update', saveCreds)
        sock.ev.on('connection.update', (update: any) => {
            const { connection, lastDisconnect } = update
            if (connection === 'close') {
                const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
                console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
                // reconnect if not logged out
                if (shouldReconnect) {
                    connectToWhatsApp()
                }
            } else if (connection === 'open') {
                console.log('opened connection')
            }
        })
        // run in main file


    })
}
connectToWhatsApp()
