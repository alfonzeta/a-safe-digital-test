// domain/Post.ts
export class Post {
    constructor(
        public id: number | null,
        public title: string,
        public content: string,
        public createdAt: Date | null,
        public userId: number,
    ) { }
}
