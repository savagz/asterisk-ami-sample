// Ami-io
const AmiIo = require("ami-io");

const SilentLogger = new AmiIo.SilentLogger();

// Login Credentials
const amiuser = {
    port: 5038,
    host: '127.0.0.1',
    login: 'admin',
    password: 'my_secure_password',
    encoding: 'ascii',
    logger: SilentLogger
};

// Create AMI Client
const amiio = AmiIo.createClient(amiuser);

// Action Login
amiio.connect();

// Response Login Success
amiio.on('connected', function () {
    // Action Originate
    var action = new AmiIo.Action.Originate();
    action.Channel = 'PJSIP/1001';
    action.Context = 'outgoing';
    action.Exten = '*14';
    action.Priority = 1;
    action.Async = true;

    amiio.send(action, function (err, data) {
        if (err) {
            console.log('Originate Failed...');
        } else {
            console.log('Originate Success...');
        }
    });

    setTimeout(function () {
        // Action Logoff
        amiio.disconnect();

        amiio.on('disconnected', process.exit());
    }, 120000);
});

amiio.on('incorrectServer', function () {
    amiio.logger.error("Invalid AMI welcome message.");
    process.exit();
});

amiio.on('connectionRefused', function () {
    amiio.logger.error("Connection refused.");
    process.exit();
});

amiio.on('incorrectLogin', function () {
    amiio.logger.error("Login or Password Incorrect.");
    process.exit();
});

// Received Events
amiio.on('event', function (event) {
    switch (event.event) {
        case 'DeviceStateChange':
            console.log(`DeviceStateChange: ${event.device} - ${event.state}`);
            break;
        case 'OriginateResponse':
            console.log(`OriginateResponse: ${event.response} - ${event.channel}`);
            break;
        case 'HangupRequest':
            console.log(`HangupRequest: ${event.channel}`);
            break;
        case 'BridgeCreate':
            console.log(`BridgeCreate: ${event.bridgeuniqueid}`);
            break;
        case 'BridgeEnter':
            console.log(`BridgeEnter: ${event.bridgeuniqueid} - ${event.channel}`);
            break;
        case 'BridgeLeave':
            console.log(`BridgeLeave: ${event.bridgeuniqueid} - ${event.channel}`);
            break;
        default:
            break;
    }
});

