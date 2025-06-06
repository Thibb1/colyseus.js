// colyseus.js@0.16.16
'use strict';

require('./legacy.js');
var Client = require('./Client.js');
var Protocol = require('./Protocol.js');
var Room = require('./Room.js');
var Auth = require('./Auth.js');
var ServerError = require('./errors/ServerError.js');
var SchemaSerializer = require('./serializer/SchemaSerializer.js');
var NoneSerializer = require('./serializer/NoneSerializer.js');
var Serializer = require('./serializer/Serializer.js');

Serializer.registerSerializer('schema', SchemaSerializer.SchemaSerializer);
Serializer.registerSerializer('none', NoneSerializer.NoneSerializer);

exports.Client = Client.Client;
exports.MatchMakeError = Client.MatchMakeError;
Object.defineProperty(exports, "ErrorCode", {
	enumerable: true,
	get: function () { return Protocol.ErrorCode; }
});
Object.defineProperty(exports, "Protocol", {
	enumerable: true,
	get: function () { return Protocol.Protocol; }
});
exports.Room = Room.Room;
exports.Auth = Auth.Auth;
exports.ServerError = ServerError.ServerError;
exports.SchemaSerializer = SchemaSerializer.SchemaSerializer;
exports.getStateCallbacks = SchemaSerializer.getStateCallbacks;
exports.registerSerializer = Serializer.registerSerializer;
//# sourceMappingURL=index.js.map
