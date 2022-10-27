"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_1 = __importStar(require("@adiwajshing/baileys"));
let sock;
const Hapi = require('@hapi/hapi');
const init = () => __awaiter(void 0, void 0, void 0, function* () {
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
            handler: (request, h) => {
                return "Berhasil !";
            }
        },
        {
            method: 'POST',
            path: '/send-text',
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const { number, text } = request.payload;
                if (sock) {
                    yield sock.sendMessage(number, { text: text });
                    return true;
                }
                else {
                    const response = h.response({
                        status: 'fail',
                        message: 'Whatsapp belum login !',
                    });
                    response.code(404);
                    return response;
                }
            }),
        },
    ]);
    yield server.start();
    console.log(`Server berjalan pada ${server.info.uri}`);
});
init();
function connectToWhatsApp() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, baileys_1.useMultiFileAuthState)('auth_info_baileys').then(({ state, saveCreds }) => {
            sock = (0, baileys_1.default)({
                auth: state,
                printQRInTerminal: true
            });
            sock.ev.on('creds.update', saveCreds);
            sock.ev.on('connection.update', (update) => {
                var _a, _b;
                const { connection, lastDisconnect } = update;
                if (connection === 'close') {
                    const shouldReconnect = ((_b = (_a = lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !== baileys_1.DisconnectReason.loggedOut;
                    console.log('connection closed due to ', lastDisconnect === null || lastDisconnect === void 0 ? void 0 : lastDisconnect.error, ', reconnecting ', shouldReconnect);
                    // reconnect if not logged out
                    if (shouldReconnect) {
                        connectToWhatsApp();
                    }
                }
                else if (connection === 'open') {
                    console.log('opened connection');
                }
            });
            // run in main file
        });
    });
}
connectToWhatsApp();
