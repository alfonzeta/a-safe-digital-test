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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignInUseCase = void 0;
class SignInUseCase {
    constructor(userRepository, jwtService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }
    execute(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.userRepository.findByEmail(email);
            if (!user || user.id === null)
                return null;
            const isPasswordValid = yield this.userRepository.validatePassword(email, password);
            if (!isPasswordValid)
                return null;
            const token = this.jwtService.generateToken(user);
            return { user, token };
        });
    }
}
exports.SignInUseCase = SignInUseCase;
