import {ISpecification} from "../api";
import {INode} from "./node";

export class Specification {

    /**
     * Initializes the default specification attributes to the node
     *
     * @param node the node which will be initialized
     * @param spec the node specification
     * @param className the className which is set to the node
     */
    public static initNode(node: INode, spec: ISpecification, className?: string): INode{
        if(className) node.addClasses(className);
        node.setId(spec.id);
        node.setName(spec.name);
        node.setRequired(spec.required);
        spec.class !== undefined ? node.addClasses(spec.class) : () => {};
        return node;
    }

}
