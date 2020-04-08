import {MqttConnection} from '../connection/MqttConnection';

/**
 * Classes which implement this interface can bind
 * specific control elements to publish messages
 */
export abstract class IBehaviour {

    protected readonly target: HTMLElement;
    protected gateway: MqttConnection | null;
    protected bindings: BehaviorBinding[];

    protected constructor(target: HTMLElement, bindings: BehaviorBinding | BehaviorBinding[]) {
        this.target = target;
        this.gateway = null;
        this.bindings = Array.isArray(bindings) ? bindings : [bindings];
    }

    /**
     * Adds event listeners to the invoker.
     * The user is able to publish a message by
     * clicking the invoker.
     *
     * @param gateway the {@link MqttConnection}
     */
    bind(gateway: MqttConnection) {
        this.gateway = gateway;
        this.bindings.forEach(binding => {
            this.target.addEventListener(binding.type, binding.handler, true);
        });
    }

    /**
     * Removes the active event listeners
     */
    unbind() {
        this.bindings.forEach(binding => {
            this.target.removeEventListener(binding.type, binding.handler, true);
        });
    }

}

type BehaviorBinding = { type: string, handler: (event: Event) => void };
