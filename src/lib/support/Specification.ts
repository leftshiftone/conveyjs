import {ISpecification} from "../api";
import {INode} from "./node";

export class Specification {

    public raw: ISpecification;

    constructor(spec: ISpecification) {
        this.raw = spec
    }

    /**
     * Initializes the default specification attributes to the node
     *
     * @param node the node which will be initialized
     * @param className the className which is set to the node
     */
    public initNode(node: INode, className?: string): INode {
        if (className) node.addClasses(className);
        node.setId(this.raw.id);
        node.setName(this.raw.name);
        node.setRequired(this.raw.required);
        node.innerText(this.raw.text);
        node.addClasses("lto-" + this.raw.position || 'left');
        this.raw.class !== undefined ? node.addClasses(this.raw.class) : () => {};
        return node;
    }

}
