import { tmpdir } from "os";
import path from "path";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

function randomNumber(min: number, max: any = null) {
    if (max !== null) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    } else {
        return Math.floor(Math.random() * min) + 1;
    }
}


async function imageToWebp(media: any) {
    const tmpOut = path.join(tmpdir());
    const tmpIn = path.join(tmpdir(), randomNumber(1000, 9999) + '.jpg');
    fs.writeFileSync(tmpIn, media);
    await new Promise((resolve, reject) => {
        ffmpeg(tmpIn)
            .on("error", reject)
            .on("end", () => resolve(true))
            .addOutputOptions([
                "-vcodec",
                "libwebp",
                "-vf",
                "scale='min(320,iw)':min'(320, ih)':force_original_aspect_ratio=decrease,fps=30,pad=320:320:-1:-1:color=white@0.0,split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
            ])
            .toFormat('.webp')
            .save(tmpOut)
    });

    const buff = fs.readFileSync(tmpOut);
    fs.unlinkSync(tmpOut)
    fs.unlinkSync(tmpIn)
    return buff;
}


export { imageToWebp };