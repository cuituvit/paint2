


export class Latch {
    constructor(private _count: number) {
        if (_DEV)
        if (!Number.isInteger(_count) || 0 > _count) {
            throw Error("Latch received an invalid argument");
        }

        this._promise = new Promise((_res)=>{
            this._res = _res;
        });

        if (_count === 0) {
            this._res();
        }
    }

    countDown() {
        if (this._count > 0) {
            this._count--;

            if (this._count === 0) {
                this._res();
            }
        }
    }

    async wait() {
        await this._promise;
    }

    tryWait(): boolean {
        if (this._count < 1) {
            return true;
        }

        return false;
    }

    private _promise: Promise<void>;
    private _res!:    ()=>void;
}