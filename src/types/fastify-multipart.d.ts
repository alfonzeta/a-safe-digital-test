// src/types/fastify-multipart.d.ts

declare module 'fastify-multipart' {
    import { FastifyPluginAsync } from 'fastify';
    import { Readable } from 'stream';


    interface File {
        fieldname: string;
        filename: string;
        encoding: string;
        mimetype: string;
        file: Readable;
    }

    interface Multipart {
        (options?: any): FastifyPluginAsync;
        parseMultipartFormData: (request: any) => Promise<File[]>;
    }



    const multipart: Multipart;
    export default multipart;

}
