import * as fs from "fs";
import * as promisify from 'ts-promisify';
import * as crypto from 'crypto';
process.chdir('D:\\CloudMusic');
async function readList() {
    let [err, files] = await  promisify.typed(fs.readdir)(".");
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
readList().then(async (files) => {
    let m = {};
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        let id = await sha256(file);
        m[id] = file;
    }
    console.log(m);
});
