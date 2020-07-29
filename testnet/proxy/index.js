var http = require('http'),
    httpProxy = require('http-proxy');
//
// Create your proxy server and set the target in the options.
//
let fullUrl = 'ws://localhost:4502';
console.log(`forwarding websockets to: ${fullUrl}`);

httpProxy.createProxyServer(
    {
        target: fullUrl,
        ws: true,
    }
).listen(8000);
