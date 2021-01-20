export class ProcessNode {
    executionGroupId: string;
    identityId: string;
    processId: string;
    nodeId: string;


    constructor(executionGroupId: string, identityId: string, processId: string, nodeId: string) {
        this.executionGroupId = executionGroupId;
        this.identityId = identityId;
        this.processId = processId;
        this.nodeId = nodeId;
    }

    static isCurrentProcessNode(object: any): boolean {
        return object
            && object["executionGroupId"]
            && object["processId"]
            && object["identityId"]
            && object["nodeId"];
    }

    static parse(object: any): ProcessNode | null {
        if (!this.isCurrentProcessNode(object)) return null;
        return new ProcessNode(object.executionGroupId, object.identityId, object.processId, object.nodeId);
    }
}
