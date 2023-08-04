

export default class DeviceSchema {

    private provider: string;
    private _status: boolean ;

    constructor(provider:string) {
        this.provider = provider;
        this._status = false;
    }
    
    public get vendor() : string {
        return this.provider;
    }
    
    public get status() : string {
        if(this._status === false){
            return 'offline'
        }else{
            return 'online'
        }
    }
    
    
}