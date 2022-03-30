import {UserPropertiesExtractor} from "../UserPropertiesExtractor";


describe("User properties of MQTT extraction", () => {

    beforeEach(() => {
        jest.resetModules();
    });


    it("Extract relevant properties from userProperties of MQTT v5 packet ", () => {

        const packet = {
            properties: {
                userProperties: {
                    nodeId: "node123",
                    previousPromptId: "previousPromptId123",
                    behaviourInstanceId:"behaviourInstanceId123",
                    nodeInstanceId:"nodeInstanceId123",
                    behaviourId:"behaviourId123",
                    anotherIrrelevantProperty:"anotherIrrelevantProperty123",
                }
            }
        };

        const userProperties = UserPropertiesExtractor.execute(packet);

        expect(userProperties.get('nodeId')).toEqual("node123");
        expect(userProperties.get('previousPromptId')).toEqual("previousPromptId123");
        expect(userProperties.get('behaviourInstanceId')).toEqual("behaviourInstanceId123");
        expect(userProperties.get('nodeInstanceId')).toEqual("nodeInstanceId123");
        expect(userProperties.get('behaviourId')).toEqual("behaviourId123");
        expect(userProperties.get('anotherIrrelevantProperty')).toEqual(undefined);

    });


    it("No relevant property present in MQTT v5 packet ", () => {

        const packet = {
            properties: {
                userProperties: {
                   anotherIrrelevantProperty:"anotherIrrelevantProperty123",
                }
            }
        };

        const userProperties = UserPropertiesExtractor.execute(packet);

        expect(userProperties.size).toEqual(0);
        expect(userProperties.get('nodeId')).toEqual(undefined);
        expect(userProperties.get('previousPromptId')).toEqual(undefined);
        expect(userProperties.get('behaviourInstanceId')).toEqual(undefined);
        expect(userProperties.get('nodeInstanceId')).toEqual(undefined);
        expect(userProperties.get('behaviourId')).toEqual(undefined);
        expect(userProperties.get('anotherIrrelevantProperty')).toEqual(undefined);

    });


});

