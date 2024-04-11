const https = require('https');
const fs = require('fs');
const cron = require('node-cron');

const port = 443;

const options = {
    key: fs.readFileSync('./encrypt/key.pem'),
    cert: fs.readFileSync('./encrypt/cert.pem')
};

let activeMembers = [];

const server = https.createServer(options, (req, res) => {
    let ip = getIP(req);
    console.log(`Requested URL: ${req.url} from IP: ${ip}`);
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
    }
    else if (req.method === 'GET') {
        if (req.url.startsWith('/assets/')) {
            let path = req.url;
            if (path.endsWith('/')) {
                path += 'index.html';
            }
            fs.readFile(`.${path}`, (err, data) => {
                if (err) {
                    res.writeHead(404);
                    res.end('404 Not Found');
                    return;
                }
                res.writeHead(200);
                res.end(data);
            });
        }
    }
    else if (req.method === 'POST') {
        if (req.url === '/api') {
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                let data = JSON.parse(body);
                res.writeHead(200);
                if (data.type === 'passing') {
                    if (data.id === '') {
                        res.end(JSON.stringify({ status: 'failed', type: 'empty', members: activeMembers }));
                        return;
                    }
                    if (!activeMembers.includes(data.id)) {
                        activeMembers.push(data.id);
                        res.end(JSON.stringify({ status: 'success', type: 'entry', members: activeMembers }));
                    }
                    else {
                        activeMembers = activeMembers.filter(member => member !== data.id);
                        res.end(JSON.stringify({ status: 'success', type: 'exit', members: activeMembers }));
                    }
                }
                else if (data.type === 'getMembers') {
                    res.end(JSON.stringify({ members: activeMembers }));
                }
            });
        }
    }
});

function getIP(req) {
    if (req.headers['x-forwarded-for']) {
        return req.headers['x-forwarded-for'];
    }
    if (req.connection && req.connection.remoteAddress) {
        return req.connection.remoteAddress;
    }
    if (req.connection.socket && req.connection.socket.remoteAddress) {
        return req.connection.socket.remoteAddress;
    }
    if (req.socket && req.socket.remoteAddress) {
        return req.socket.remoteAddress;
    }
    return '0.0.0.0';
};

server.listen(port, () => {
    console.log(`Server running at https://localhost:${port}/`);
});
