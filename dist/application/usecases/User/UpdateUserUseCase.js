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
exports.UpdateUserUseCase = void 0;
class UpdateUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute(userId, name, email, password, roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingUser = yield this.userRepository.findById(userId);
                if (!existingUser) {
                    return null;
                }
                existingUser.name = name;
                existingUser.email = email;
                existingUser.password = password;
                existingUser.roleId = roleId;
                const updatedUser = yield this.userRepository.update(existingUser);
                return updatedUser;
            }
            catch (error) {
                if (error instanceof Error && error.message === 'Email already exists') {
                    throw new Error('Email already exists');
                }
                else {
                    console.error('Error updating user:', error);
                    throw new Error('Internal Server Error');
                }
            }
        });
    }
}
exports.UpdateUserUseCase = UpdateUserUseCase;
