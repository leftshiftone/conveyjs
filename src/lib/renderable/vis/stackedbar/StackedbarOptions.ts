export default class StackedbarOptions {
    public width: number = 500;
    public height: number = 500;
    public data: Promise<any> = Promise.resolve([]);
    public showLegend: boolean = true;
    public showAxis: boolean = true;
    public textX: string = "";
    public textY: string = "";
    public sort:boolean = false;
}
