// domain/PostRepository.ts
import { Post } from "./Post";

export interface PostRepository {
    create(post: Post): Promise<Post>;
    findById(id: number): Promise<Post | null>;
    update(post: Post): Promise<Post>;
    delete(id: number): Promise<void>;
}
