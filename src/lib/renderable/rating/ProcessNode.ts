import {ISpecification} from "../../api";

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

    static isCurrentProcessNode(object: object): boolean {
        return object
            && object["executionGroupId"]
            && object["processId"]
            && object["identityId"]
            && object["nodeId"];
    }

    static createFromSpecification(spec: ISpecification): ProcessNode | null {
        const enriched = spec.enriched;
        if (enriched === null || enriched === undefined) return null;
        if (!this.isCurrentProcessNode(enriched)) return null;
        return new ProcessNode(enriched["executionGroupId"], enriched["identityId"], enriched["processId"], enriched["nodeId"]);
    }
}
