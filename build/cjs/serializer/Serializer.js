// colyseus.js@0.16.16
'use strict';

const serializers = {};
function registerSerializer(id, serializer) {
    serializers[id] = serializer;
}
function getSerializer(id) {
    const serializer = serializers[id];
    if (!serializer) {
        throw new Error("missing serializer: " + id);
    }
    return serializer;
}

exports.getSerializer = getSerializer;
exports.registerSerializer = registerSerializer;
//# sourceMappingURL=Serializer.js.map
