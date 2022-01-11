export interface DummyInterFace {
    name: string;
    data: number;
}
export class CheckStore {
    static readonly type = 'Check visited';
    constructor(public data: DummyInterFace) {

    }
}
export class SetData {
    static readonly type = "Set data";
    constructor(public data: number) {

    }
}