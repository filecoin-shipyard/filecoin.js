var http = require('http'),
    httpProxy = require('http-proxy');
//
// Setup our server to proxy standard HTTP requests
//
var proxy = new httpProxy.createProxyServer({
    target: {
      host: 'localhost',
      port: 4502
    }
  });
  var proxyServer = http.createServer(function (req, res) {
    proxy.web(req, res);
  });

  //
  // Listen to the `upgrade` event and proxy the
  // WebSocket requests as well.
  //
  proxyServer.on('upgrade', function (req, socket, head) {
    proxy.ws(req, socket, head);
  });

  proxyServer.listen(8000);