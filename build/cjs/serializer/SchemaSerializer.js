// colyseus.js@0.16.16
'use strict';

var schema = require('@colyseus/schema');

function getStateCallbacks(room) {
    try {
        // SchemaSerializer
        return schema.getDecoderStateCallbacks(room['serializer'].decoder);
    }
    catch (e) {
        // NoneSerializer
        return undefined;
    }
}
class SchemaSerializer {
    setState(encodedState, it) {
        this.decoder.decode(encodedState, it);
    }
    getState() {
        return this.state;
    }
    patch(patches, it) {
        return this.decoder.decode(patches, it);
    }
    teardown() {
        this.decoder.root.clearRefs();
    }
    handshake(bytes, it) {
        if (this.state) {
            //
            // TODO: validate definitions against concreate this.state instance
            //
            schema.Reflection.decode(bytes, it); // no-op
            this.decoder = new schema.Decoder(this.state);
        }
        else {
            // initialize reflected state from server
            this.decoder = schema.Reflection.decode(bytes, it);
            this.state = this.decoder.state;
        }
    }
}

exports.SchemaSerializer = SchemaSerializer;
exports.getStateCallbacks = getStateCallbacks;
//# sourceMappingURL=SchemaSerializer.js.map
