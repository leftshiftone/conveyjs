import {EventType} from "./EventType";
import {IEvent} from "../api/IEvent";

export default class EventStream {

    public static readonly SYSTEM_EVENT_TYPE_PREFIX = "GAIA::";

    /**
     *  Emits an event of the given type with the given data. All callbacks that are listening to the particular
     *  event type will be notified.
     *
     * @param eventType
     * @param args
     */
    public static emit(eventType: string, ...args: any[]) {
        EventStream.listeners(eventType).forEach((listener: (args: any[]) => void) => listener(args));
    }

    /**
     *  Emits an event of the given type with the given data. All callbacks that are listening to the particular
     *  event type will be notified.
     *
     * @param event
     */
    public static emitEvent(event: IEvent) {
        this.emit(event.type, event.payload);
    }

    /**
     * Return an array of listeners that are currently registered for the given event type.
     *
     * @param eventType
     */
    public static listeners(eventType: string) {
        return EventStream.theListeners[eventType] || [];
    }

    /**
     * Removes all of the registered listeners. eventType is optional, if provided only listeners for that
     * event type are removed.
     *
     * @param eventType
     */
    public static removeAllListeners(eventType?: string) {
        if (eventType) {
            delete this.theListeners[eventType];
        } else {
            delete this.theListeners
        }
    }

    /**
     * Register a specific callback to be called on a particular event. A token is returned that can be used
     * to remove the listener.
     */
    public static addListener(eventType: EventType | string, listener: (...args: any[]) => void) {
        if (this.theListeners[eventType]) {
            this.theListeners[eventType].push(listener);
        } else {
            this.theListeners[eventType] = [listener];
        }

        return {
            remove: () => {
                const index = this.theListeners[eventType].findIndex(e => e === listener);
                if (index >= 0) {
                    this.theListeners[eventType].splice(index, 1);
                }
            }
        };
    }

    private static theListeners: { [key: string]: Array<(args: any[]) => void> } = {};

}
