// src/utils/persistenceHelpers.ts
/**
 * Custom serializer that properly handles Date objects
 * @param state The state to serialize
 * @returns Serialized string representation of the state
 */
export function customSerializer(state: any): string {
    return JSON.stringify(state, (key, value) => {
        // Convert Date objects to a special format for storage
        if (value instanceof Date) {
            return {
                __type: 'Date',
                iso: value.toISOString()
            };
        }
        return value;
    });
}

/**
 * Custom deserializer that restores Date objects from serialized state
 * @param serializedState The serialized state string
 * @returns Deserialized state with restored Date objects
 */
export function customDeserializer(serializedState: string): any {
    return JSON.parse(serializedState, (key, value) => {
        // Restore Date objects from stored format
        if (value && typeof value === 'object' && value.__type === 'Date' && value.iso) {
            return new Date(value.iso);
        }
        return value;
    });
}

/**
 * Custom serializer configuration for pinia-plugin-persistedstate
 */
export const dateAwareSerializer = {
    serialize: customSerializer,
    deserialize: customDeserializer
};