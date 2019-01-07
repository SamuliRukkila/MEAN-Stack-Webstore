// Tuotteen tietotyyppi
export class Product {
  public _id: number;
  public ean: string;
  public name: string;
  public safename: string;
  public type: string;
  public safetype: string;
  public desc: string;
  public price: number;
  public weight: number;
  public img: string;
  public bulletpoints: [string];
  // Tuotteen lisäykseen tulevat lisäattribuutit
  public bpoint0: string;
  public bpoint1: string;
  public bpoint2: string;
  public bpoint3: string;
}
