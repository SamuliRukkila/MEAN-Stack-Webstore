// Käyttäjän tietotyyppi
export class User {
    public _id: string;
    public firstname: string;
    public surname: string;
    public email: string;
    public address: string;
    public postnumber: number;
    public city: string;
    public send_email: boolean;
    public purchase_history: [Object];
}
