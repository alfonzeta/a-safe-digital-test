"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Post = void 0;
// domain/Post.ts
class Post {
    constructor(id, title, content, createdAt, userId) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdAt = createdAt;
        this.userId = userId;
    }
}
exports.Post = Post;
