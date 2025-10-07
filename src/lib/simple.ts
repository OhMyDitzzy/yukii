import makeWASocket, { UserFacingSocketConfig } from "baileys";

export function _makeWASocket(config: UserFacingSocketConfig) {
    let conn = makeWASocket(config);

    let sock = Object.defineProperties(conn, {
        chats: {
            value: ({}),
            writable: true
        }
    })

    return sock;
}


export function smsg() {

}