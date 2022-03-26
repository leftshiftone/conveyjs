import {ConversationLanguageResolver} from "../language/ConversationLanguageResolver";
import {QueueHeader} from "@leftshiftone/gaia-sdk/dist";
import {IEventPayload} from "../../api/IEvent";
import {IQueueHeader} from "@leftshiftone/gaia-sdk/dist/mqtt/QueueHeader";

/**
 * This util class builds the header with all attributes that AIOS expect such as identityId, channelId, but also attributes
 * which have been extracted from the userProperties of MQTT msg. See UserPropertiesExtractor. In addition to it, an attribute
 * language and type are also included as headers
 * e.g.
 *   {
 *      "identityId": "XXX-XXX"
 *      "language" :  "de",
 *      "type": "utterance",
 *      "behaviourId": "asdf-asd0as7a"
 *      "nodeId": "1233-ztuj7a", .....
 *
 */

//TODO @AGP UnitTest
export class ConversationHeaderBuilder {

    private static languageResolver = new ConversationLanguageResolver();

    public static build(queueHeader: QueueHeader, userProperties: Map<string,string>, payload: IEventPayload): IQueueHeader {
        const headerClone:any = Object.assign({}, queueHeader);
        let conversationHeader = this.convertMapToObject(userProperties)
        const mergedHeader = Object.assign(headerClone, conversationHeader);
        return Object.assign(mergedHeader, {
            language: this.languageResolver.get(),
            type: payload.type
        });
    }

    private static convertMapToObject(map: Map<string,string>) {
        return Array.from(map)
            .filter(([k, v]) => v !== undefined)
            .reduce((obj, [key, value]) => (
                Object.assign(obj, { [key]: value })
            ), {});
    }

}
