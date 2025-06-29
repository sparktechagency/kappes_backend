export enum BUSINESS_TYPES {
    RETAIL = "RETAIL",
    WHOLESALE = "WHOLESALE",
}

export interface IBusinessMessage {
    senderName: string;
    senderEmail: string;
    message: string;
}