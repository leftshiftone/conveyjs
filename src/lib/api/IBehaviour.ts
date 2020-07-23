import {Subscription} from "../connection/Subscription";

/**
 * Classes which implement this interface can bind
 * specific control elements to publish messages
 */
export abstract class IBehaviour {

    protected readonly target: HTMLElement;
    protected subscription: Subscription  | null;
    protected bindings: BehaviorBinding[];
    channelId: string|null = null;

    protected constructor(target: HTMLElement, bindings: BehaviorBinding | BehaviorBinding[]) {
        this.target = target;
        this.subscription = null;
        this.bindings = Array.isArray(bindings) ? bindings : [bindings];
    }

    init(channelId: string) {
        this.channelId = channelId;
    }

    /**
     * Adds event listeners to the invoker.
     * The user is able to publish a message by
     * clicking the invoker.
     *
     * @param gateway the {@link Subscription}
     */
    bind(gateway: Subscription) {
        this.subscription = gateway;
        this.bindings.forEach(binding => {
            this.target.addEventListener(binding.type, binding.handler, true);
        });
    }

    isValueValid = (value: string) =>
        this.channelId && this.subscription && value.replace(/^\s+|\s+$/g, "") !== "";

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
