import {IListener} from './api';
import {DefaultListener} from './listener/DefaultListener';
import {Connection} from "./connection/Connection";
import {QueueOptions} from "@leftshiftone/gaia-sdk/dist";

export class Gaia {

    private readonly listener: IListener;

    constructor(listener?: IListener) {
        this.listener = new DefaultListener(listener || null);
    }

    /**
     * Connect the client to the G.A.I.A ecosystem.
     *
     * @param options the ID of the identity
     */
    public connect(options: QueueOptions): Promise<Connection> {
        return new Promise<Connection>(resolve => resolve(new Connection(options, this.listener)));
    }
}
