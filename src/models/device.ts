

export default class DeviceSchema {

    private provider: string;
    private estado: boolean ;

    constructor(provider:string) {
        this.provider = provider;
        this.estado = false;
    }
    
    public get vendor() : string {
        return this.provider;
    }
    
    public get status() : string {
        if(this.estado === false){
            return 'offline'
        }else{
            return 'online'
        }
    }
    
    
}