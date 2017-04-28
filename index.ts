import * as fs from "fs";
import * as promisify from 'ts-promisify';
import * as crypto from 'crypto';
import * as cors from 'cors';
import * as express from 'express';
import * as mm from 'musicmetadata';
process.chdir('/Users/weijian/Music/网易云音乐');
async function readFiles() {
    let [err, files] = await promisify.typed(fs.readdir)(".");
    return files;
}

async function sha256(file: string): Promise<any> {
    let hash = crypto.createHash('sha256');
    fs.createReadStream(file).pipe(hash);
    return new Promise((resolve, reject) => {
        hash.on('readable', () => {
            let data: any = hash.read();
            if (data) {
                resolve(data.toString('hex'))
            }
        })
    })
}
async function readMusicMeta(file: string) {
    return new Promise((resolve, reject) => {
        mm(fs.createReadStream(file), { duration: true }, (err, metadata) => {
            if (!err) {
                resolve(metadata);
            } else {
                reject(err)
            }
        })
    })
}
async function readMusicList() {
    let files = await readFiles();
    let music_list = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let id = await sha256(file);
        let metadata = await readMusicMeta(file);
        let o = { id: id, file: file };
        Object.assign(o, metadata);
        music_list.push(o)

    }
    return music_list;
}
async function main() {
    let music_list = await readMusicList();
    const app = express();
    app.use(express.static('.'));
    app.use(cors());
    app.get('/next', function (req, res) {
        let index = Math.floor(Math.random() * music_list.length);
        res.send(Object.assign({}, music_list[index], { picture: {} }))
    });
    app.get('/musics', function (req, res) {
        res.send(music_list);
    })

    app.get('/picture/:id', (req, res) => {
        let id = req.params.id;
        let music = music_list.find((value) => {
            return value.id == id;
        })
        let picture = music.picture[0];
        res.send({ format: picture.format, data: picture.data.toString('base64') });
    })
    app.listen(8000, function () {
        console.log('Example app listening on port 8000')
    })
}
main().then(() => {
}).catch((err) => {
    console.log(err);
});
