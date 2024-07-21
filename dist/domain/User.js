"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
class User {
    constructor(id, name, email, password, roleId) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
        this.roleId = roleId;
    }
}
exports.User = User;
