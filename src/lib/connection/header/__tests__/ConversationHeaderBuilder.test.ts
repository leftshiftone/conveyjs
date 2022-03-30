import {ConversationHeaderBuilder} from "../ConversationHeaderBuilder";
import {QueueHeader} from "../../../../all";
import {MessageType} from "../../../support/MessageType";


describe("Converstaion header builder", () => {
    const OLD_ENV = process.env;

    const IDENTITY_ID = "123";
    const CHANNEL_ID = "ChannelID_123";

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });


    afterAll(() => {
        process.env = OLD_ENV;
    });


    function mockEnvVariableConversationLanguage(language: string) {
        process.env.CONVERSATION_LANGUAGE = language;
    }

    it("Build headers with userProperties", () => {
        mockEnvVariableConversationLanguage("de_AT");
        const queueHeader = new QueueHeader(IDENTITY_ID, CHANNEL_ID);
        const payload = {type: MessageType.UTTERANCE, payload: {}, attributes: {}};
        const userProperties = new Map();
        userProperties.set("abc", "hello");

        const headerResult = ConversationHeaderBuilder.build(queueHeader, userProperties, payload);

        const headerResultAsMap = new Map(Object.entries(headerResult));
        expect(headerResultAsMap.get('identityId')).toEqual(IDENTITY_ID);
        expect(headerResultAsMap.get('channelId')).toEqual(CHANNEL_ID);
        expect(headerResultAsMap.get("language")).toEqual("de_AT");
        expect(headerResultAsMap.get("abc")).toEqual("hello");
        expect(headerResultAsMap.get('type')).toEqual(MessageType.UTTERANCE);

    });




});

