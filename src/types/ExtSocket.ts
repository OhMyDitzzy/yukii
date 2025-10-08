import { WASocket } from "baileys";
import { FileExtension } from "file-type";

export interface SerializeSocket extends WASocket {
    chats?: Record<string, any>;
    getFile?: (path: any, saveToFile?: boolean) => Promise<PromisesGetFile>;
    isLid?: Record<string, any>;
}

interface PromisesGetFile {
    data: Buffer<ArrayBufferLike>;
    deleteFile(): Promise<void>;
    ext: FileExtension;
    mime: MimeType;
    res: any;
    filename: any;
}