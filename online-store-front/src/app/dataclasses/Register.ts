// Rekisteröinti tietotyyppi
export class Register {
  constructor (
    public firstname: string,
    public surname: string,
    public email: string,
    public address: string,
    public postnumber: number,
    public city: string,
    public password: string,
    public send_email: boolean
  ) {}
}

