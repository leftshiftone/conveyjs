export default class HorizontalStackedbarOptions {
    public width: number = 500;
    public height: number = 500;
    public data: Promise<any> = Promise.resolve([]);
    public legend: boolean = true;
    public textX: string = "";
    public textY: string = "";
    public sort:boolean = false;
    public horizontal:boolean = false;
}
