// colyseus.js@0.16.16
import './legacy.mjs';
export { Client, MatchMakeError } from './Client.mjs';
export { ErrorCode, Protocol } from './Protocol.mjs';
export { Room } from './Room.mjs';
export { Auth } from './Auth.mjs';
export { ServerError } from './errors/ServerError.mjs';
import { SchemaSerializer } from './serializer/SchemaSerializer.mjs';
export { getStateCallbacks } from './serializer/SchemaSerializer.mjs';
import { NoneSerializer } from './serializer/NoneSerializer.mjs';
import { registerSerializer } from './serializer/Serializer.mjs';

registerSerializer('schema', SchemaSerializer);
registerSerializer('none', NoneSerializer);

export { SchemaSerializer, registerSerializer };
//# sourceMappingURL=index.mjs.map
