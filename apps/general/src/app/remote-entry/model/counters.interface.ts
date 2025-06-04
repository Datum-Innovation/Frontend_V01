export interface COUNTER{
    id:number;
    machineName:string;
    counterCode:string;
    counterName:string;
    machineIP:string;
    active:boolean;
}

export interface COUNTERS{
    machineName:string;
    counterCode:string;
    counterName:string;
    machineIP:string;
    active:boolean;
}

export interface NAME{
    machinename:string;
    machineIp:string;
}