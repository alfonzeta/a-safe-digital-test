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
exports.SignUpUseCase = void 0;
const User_1 = require("../../../domain/User");
class SignUpUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(name_1, email_1, password_1) {
        return __awaiter(this, arguments, void 0, function* (name, email, password, roleId = 2) {
            try {
                const existingUser = yield this.userRepository.findByEmail(email);
                if (existingUser) {
                    return null;
                }
                const newUser = new User_1.User(null, name, email, password, roleId = 2);
                const createdUser = yield this.userRepository.create(newUser);
                return createdUser;
            }
            catch (error) {
                console.error('Error creating user:', error);
                return null;
            }
        });
    }
}
exports.SignUpUseCase = SignUpUseCase;
