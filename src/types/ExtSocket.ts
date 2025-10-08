import { WASocket } from "baileys";
import { FileExtension } from "file-type";

export interface SerializeSocket extends WASocket {
    chats?: Record<any, any>;
    getFile?: (path: any, saveToFile?: boolean) => Promise<PromisesGetFile>;
    getJid?: (sender: string) => any;
    isLid?: Record<string, any>;
    waitEvent?: (eventName: any, is?: () => boolean, maxTries?: number) => Promise<unknown>;
}

interface PromisesGetFile {
    data: Buffer<ArrayBufferLike>;
    deleteFile(): Promise<void>;
    ext: FileExtension;
    mime: MimeType;
    res: any;
    filename: any;
}