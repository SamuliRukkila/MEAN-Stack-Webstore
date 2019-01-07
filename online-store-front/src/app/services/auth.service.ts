/* Servicet autentikaatioon liittyvissä tapahtumissa. Täältä voit kirjautua sisään
sekä rekisteröityä palveluun. Admin-käyttäjäksi et voi rekisteröityä suoraan sivun
kautta vaan se pitää tehdä manuaalisesti palvelimen kautta tietoturvasyistä. */

import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '../../environments/environment.prod';

import { Register } from '../dataclasses/Register';

// HTTP-kutsujen header - data lähetetään JSON tietona
const headers = { headers: new HttpHeaders({
  'Content-Type': 'application/json'
})};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  // Sisältää url-osoitteen johon navigoidaan kun autentikaatio on hoidossa
  public redirectUrl: string;
  // Root-osoite HTTP-kyselyille
  private url = environment.url + 'auth/';

  // Tieto (admin/)kirjautumisesta joka välitetään loppujen lopuksi sitä
  // tilaaville komponenteille Subject-olion avulla
  public logincond = new Subject<string>();
  public admincond = new Subject<boolean>();

  // Paikallinen muuttuja Javascript Web Token -helperistä
  private jwtHelp = new JwtHelperService();

  /*
   INFORMOI TILAAJIA UUDESTA ARVOSTA KIRJAUTUMISTILANTEESTA
    Näitä funktioita kutsutaan kun käyttäjän kirjautumistilanne muuttuu.
  */
  sendLoginInfo(firstname: string): void {
    this.logincond.next(firstname);
  } sendAdminInfo(isadmin: boolean): void {
    this.admincond.next(isadmin);
  }


  /*
   PALAUTTAA (ADMIN)KIRJAUTUMISTILANTEEN
    Palauttaa muutoksissa funktioiden tilaajille kirjautumistilanteen muutoksen.
  */
  returnLoginCond(): Observable<string> {
    return this.logincond.asObservable();
  } returnAdminCond(): Observable<boolean> {
    return this.admincond.asObservable();
  }


  /*
   ULOSKIRJAUTUMINEN
    Vaihtaa logincond -muuttujan tyhjäksi muuttujaksi, eli toisinsanoen
    kirjaa käyttäjän ulos.
  */
  logOut(): void {
    this.logincond.next();
    this.admincond.next();
  }


  /*
   KÄYTTÄJÄN REKISTERÖINTI
    Rekisteröi käyttäjän. Virheen sattuessa palauttaa virheen vastauksen sijaan.
  */
  register(data: Register): Observable<any> {
    return this.http.post(this.url + 'register', data, headers)
      .pipe(
        catchError(err => throwError(err.error))
      );
  }


  /*
   KÄYTTÄJÄN KIRJAUTUMINEN
    Kirjaa käyttäjän. Katsoo, että backend palauttaa tokenin. Jos kirjautumis-
    tunnukset ovat oikein, tallennetaan käyttäjän sessiostorageen etunimi,
    sähköposti sekä token. Tämän tokenin avulla käyttäjä voi päästä sivuille,
    jotka ovat tarkoitettu vain kirjautuneille.
  */
  login(data): Observable<any> {
    return this.http.post(this.url + 'login', data, headers)
      .pipe(map(res => {
        // Jos vastaus sisältää tokenin
        if (res['token']) {
          // Avataan HTTP-vastauksen payload (sisältö)
          const payload = this.jwtHelp.decodeToken(res['token']);
          // Jos sähköpostit vastaavat toisiaan, lisätään tieto
          // session-storageen
          if (payload.email === data.email) {
            sessionStorage.setItem('credentials', JSON.stringify({
              name: payload.firstname, email: data.email, token: res['token']
            }));
            // Tieto subjectille, että on kirjauduttu sisään
            this.sendLoginInfo(payload.firstname);
            this.sendAdminInfo(payload.isadmin);
          } else {
            console.error('Virhe sähköpostin tarkistuksessa.');
            throw new Error();
          }
        } else {
          console.error('Kirjautuminen epäonnistui. Kokeile uudestaan.');
          throw new Error();
        }
      }), catchError(err => throwError(err.error)
    ));
  }


  /*
   NORMAALIN KÄYTTÄJÄN AUTENTIKAATIO
    Normaalin käyttäjän autentikaatiovarmennus. Jos käyttäjällä on token,
    katsotaan onko se vanhentunut. Palautetaan true jos ei.
  */
  isAuthenticated(): boolean {
    const session = JSON.parse(sessionStorage.getItem('credentials'));
    return !this.jwtHelp.isTokenExpired(session.token);
  }


  /*
   ADMIN-KÄYTTÄJÄN AUTENTIKAATIO
    Admin-käyttäjän autentikaatio, käyttäjän sessionstoragessa oleva token
    "avataan" ja sieltä otetaan payloadi muuttujaan. Jos payloadin sisällä
    oleva arvo "isadmin" on true, hyväksytään käyttäjä admin-käyttäjäksi
  */
  isAdminAuthenticated(): boolean {
    const session = JSON.parse(sessionStorage.getItem('credentials'));
    if (session) {
      const payload = this.jwtHelp.decodeToken(session.token);
      return (payload.isadmin ? true : false);
    } return false;
  }

}
