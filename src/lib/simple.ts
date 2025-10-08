import makeWASocket, { UserFacingSocketConfig } from "baileys";
import { SerializeSocket } from "../types/ExtSocket";
import chalk from "chalk";
import { format } from "util";
import fs from "fs";
import { fileTypeFromBuffer } from "file-type";
import path from "path";

export function _makeWASocket(config: UserFacingSocketConfig): SerializeSocket {
    let conn = makeWASocket(config) as SerializeSocket;

    let sock: SerializeSocket = Object.defineProperties(conn, {
        chats: {
            value: ({}),
            writable: true
        },

        logger: {
            get() {
                return {
                    info(...args: any[]): void {
                        console.log(chalk.bold.bgRgb(51, 204, 51)("INFO "), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]`, chalk.cyan(format(...args)))
                    },
                    error(...args: any[]): void {
                        console.log(chalk.bold.bgRgb(247, 38, 33)("ERROR "), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]`, chalk.cyan(format(...args)))
                    },
                    warn(...args: any[]): void {
                        console.log(chalk.bold.bgRgb(255, 153, 0)("WARNING "), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]`, chalk.cyan(format(...args)))
                    },
                    trace(...args: any[]): void {
                        console.log(chalk.grey("TRACE "), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]`, chalk.cyan(format(...args)))
                    },
                    debug(...args: any[]): void {
                        console.log(chalk.bold.bgRgb(66, 167, 245)("DEBUG "), `[${chalk.rgb(255, 255, 255)(new Date().toUTCString())}]`, chalk.cyan(format(...args)))
                    }
                }
            },
            enumerable: true
        },
        getFile: {
            async value(PATH, saveToFile = false) {
                let res, filename;
                const data = Buffer.isBuffer(PATH) 
                ? PATH
                : PATH instanceof ArrayBuffer
                ? Buffer.from(PATH) 
                : /^data:.*?\/.*?;base64,/i.test(PATH)
                ? Buffer.from(PATH.split`,`[1], "base64")
                : /^https?:\/\//.test(PATH)
                ? await(res = await fetch(PATH)).arrayBuffer()
                : fs.existsSync(PATH)
                ? ((filename = PATH), fs.readFileSync(PATH))
                : typeof PATH === "string"
                ? PATH
                : Buffer.alloc(0);

                if (!Buffer.isBuffer(data)) 
                    throw new Error("Result is not a buffer.")

                const type = (await fileTypeFromBuffer(data)) || {
                    mime: "application/octet-stream",
                    ext: ".bin"
                }

                if (data && saveToFile && !filename) 
                   (filename = path.join(import.meta.dirname, "../tmp" + <any>new Date() * 1 + "." + type.ext)), await fs.promises.writeFile(filename, data);

                return {
                    res,
                    filename,
                    ...type,
                    data,
                    deleteFile() {
                        return filename && fs.promises.unlink(filename)
                    }
                }
            },
            enumerable: true
        },

        getJid: {
            value(sender) {
                if (!conn.isLid) conn.isLid = {};
                if (conn.isLid[sender]) return conn.isLid[sender];
                if (sender.endsWith("@lid")) return sender;

                for (let chat of Object.values(conn.chats)) {
                    if (!chat.metadata?.participants) continue;
                    let user = chat.metadata?.participants.find(p => p.lid === sender || p.id === sender)
                    if (user) {
                        return conn.isLid[sender] = user?.phoneNumber || user?.jid || user?.id;
                    }
                }

                return sender;
            }
        },

        waitEvent: {
            value(eventName, is = () => true, maxTries = 25) {
                return new Promise((resolve, reject) => {
                    let tries = 0;
                    let on = (...args: any[]) => {
                        if (++tries > maxTries) reject("Max tries reached");
                        else if (is()) {
                            conn.ev.off(eventName, on);
                            resolve([...args])
                        }
                    };
                    conn.ev.on(eventName, on)
                });
            }
        },
    })

    return sock;
}


export function smsg() {

}