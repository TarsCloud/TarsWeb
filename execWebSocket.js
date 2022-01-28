const logger = require("./logger");
const _ = require('lodash');

function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}

// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const ExecOperator = function () {
    this.registers = {};

    this.start = () => {

        let that = this;

        global.wsServer.on('request', function (request) {

            try {
                let protocol = request.requestedProtocols[0];

                console.log(protocol, that.registers);

                let func = that.registers[protocol];

                // console.log(func);
                if (func) {
                    func(request);
                }
            } catch (e) {
                console.log(e);
            }
        });
    };

    this.register = (protocol, func) => {
        console.log(this, this.registers, protocol);
        this.registers[protocol] = func;
    };
}

module.exports = new ExecOperator();