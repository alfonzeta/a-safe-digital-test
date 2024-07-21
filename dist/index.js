"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const websocket_1 = __importDefault(require("@fastify/websocket"));
const fastify_1 = __importDefault(require("fastify"));
const multipart_1 = __importDefault(require("@fastify/multipart"));
const di_1 = require("./config/di");
const routes_1 = require("./config/routes");
const server = (0, fastify_1.default)();
server.register(websocket_1.default);
server.register(multipart_1.default);
(0, routes_1.registerRoutes)(server);
server.register(function (fastify) {
    return __awaiter(this, void 0, void 0, function* () {
        fastify.get('/ws', { websocket: true }, (socket, req) => { });
    });
});
server.listen(8080, "0.0.0.0", (err, address) => __awaiter(void 0, void 0, void 0, function* () {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
    try {
        yield di_1.container.prisma.$connect();
        console.log('Connected to database');
    }
    catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
}));
