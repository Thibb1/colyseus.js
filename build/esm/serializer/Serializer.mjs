// colyseus.js@0.16.16
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

export { getSerializer, registerSerializer };
//# sourceMappingURL=Serializer.mjs.map
