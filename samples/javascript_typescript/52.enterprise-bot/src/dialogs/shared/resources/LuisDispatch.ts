/**
* <auto-generated>
* Code generated by LUISGen .\deploymentScripts\msbotClone\152.luis -ts LuisDispatch -o .\src\dialogs\shared\resources
* Tool github: https://github.com/microsoft/botbuilder-tools
* Changes may cause incorrect behavior and will be lost if the code is
* regenerated.
* </auto-generated>
*/ 
import {DateTimeSpec, IntentData, InstanceData, NumberWithUnits} from 'botbuilder-ai';

export interface _Intents { 
    l_General: IntentData;
    None: IntentData;
    q_FAQ: IntentData;
};

export interface _Instance {
}

export interface _Entities {
    $instance : _Instance;
}

export interface LuisDispatch {
    text: string;
    alteredText?: string;
    intents: _Intents;
    entities: _Entities;
    [propName: string]: any;
}
