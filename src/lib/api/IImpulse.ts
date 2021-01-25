import {IImpulseHeader} from "./IImpulseHeader";

export interface IImpulse {
    header: IImpulseHeader;
    payload: string | {};
}
