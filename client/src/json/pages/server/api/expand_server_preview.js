const data = [];
if (req.body && Array.isArray(req.body.expand_nodes)){
   for (let ip of req.body.expand_nodes) {
     data.push({
       "application": req.body.application,
       "server_name": req.body.server_name,
       "node_name": req.body.node_name,
       "set": req.body.enable_set ? `${req.body.set_name}.${req.body.set_area}.${req.body.set_group}` : '',
       "obj_name": "objCXK",
       "bind_ip": ip,
       "port": 0,
       "template_name": "tars.default",
       "status": "未扩容",
     });
  }
}
next(null, {
  "ret_code": 200,
  "data": data,
});