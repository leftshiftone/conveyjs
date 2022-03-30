/**
 * This class is in charge of extracting the values of specific userProperties of MQTT message which are required by AIOS
 * e.g.
 *  <ul>
 *   <li>nodeId</li>
 *   <li>previousPromptId</li>
 *   <li>behaviourInstanceId</li>
 *   <li>nodeInstanceId</li>
 *   <li>behaviourId</li>
 * </ul>
 */
export class UserPropertiesExtractor {

    public static execute(packet: any) {
        const map = new Map();
        if (packet !== undefined && packet.properties !== undefined && packet.properties.userProperties !== undefined) {
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "nodeId", map);
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "previousPromptId", map);
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "behaviourInstanceId", map);
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "nodeInstanceId", map);
            this.addUserPropertyToConversationHeader(packet.properties.userProperties, "behaviourId", map);
        }
        return map;
    }

    private static addUserPropertyToConversationHeader(userProperty: any, propertyName: string, conversationHeader: Map<string, string>){
        if (userProperty !== undefined) {
            const property = userProperty[propertyName];
            if (property !== undefined) {
                conversationHeader.set(propertyName, property);
            }
        }
    }
}
