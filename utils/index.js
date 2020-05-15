const json2xls = require('json2xls');
const fs = require('fs');

const BUFFER_SIZE = 1024 * 1024;
module.exports = async ({
    srcFileName,
    dstFileName,
    progress = (value, message) => { console.log({ message, value }) }
}) => {
    return new Promise((resolve) => {
        try {
            const data = [];
            const stats = fs.statSync(srcFileName);
            const totalSize = stats.size;
            const readStream = fs.createReadStream(srcFileName, { highWaterMark: BUFFER_SIZE });
            let totalRead = 0;
            progress(0, "Reading file");
            readStream.on('data', (chunk) => {
                data.push(chunk);
                totalRead += chunk.length;
                progress(totalRead / totalSize, "Reading file");
            });
            readStream.on('end', () => {
                progress(25, "Converting Buffer");
                const text = Buffer.concat(data).toString();
                progress(50, "Parsing");
                const json = JSON.parse(text);
                progress(75, "json2xls");
                const xls = json2xls(json);
                progress(90, "Saving file");
                fs.writeFileSync(dstFileName, xls, 'binary');
                resolve({});
            })
            readStream.on('error', (err) => {
                resolve({
                    error: err.stack || err.message || err
                })
            })
        } catch (e) {
            resolve({
                error: e.stack || e.message
            })
        }
    })
}