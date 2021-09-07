const EndpointManager = require("../rpc/proxy/getservant/lib/getEndpoint")

module.exports=async function findActiveIndex(locator) {
	let endpointM = new EndpointManager(locator);
	let activeList = await endpointM.getActiveEndpointFromLocator("Base.TarsCallChain.WebServerObj");
    let ip = activeList[0].match(/-h (\S*) -p/);
	let port = activeList[0].match(/-p (\S*)/)
	 global.servant  = `http://${ip[1]}:${port[1]}`
     console.log("global.servant ",global.servant );
}