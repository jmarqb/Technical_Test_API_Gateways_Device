import { v4 as uuidv4 } from 'uuid';


export default class GatewaysSchema{
   
    private serialNumber : string;

    constructor( private name: string,private address: string){
        this.serialNumber = uuidv4(); // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d';
        this.name = name;
        this.address = address;
    }

    
    public get serialId() : string {
        return this.serialNumber;
    }
    
    public get nombre() : string {
        return this.name;
    }
    
    
    public get ipv4() : string {
        return this.address;
    }
    
}