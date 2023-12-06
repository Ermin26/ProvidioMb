# Izdaja blaga ( Interna )

## Kratek opis

Spletna stran je narejena samo za interno izdajo blaga in se uporablja za beleženje blaga ki ga je kupil zaposleni.
V bazo podatkov se shranjujejo podatki o delavcu, produktu, datumu prevzetja/plačila, številka računa v tekočem letu, številka računa v tekočem mesecu ter cene produktov in skupne cene računov.

## Funkcionalnosti

Na spletni strani je možno dodati, urediti ali izbrisati račun. 
Lahko se tudi spremenio podatki o kupljenih/izdanih izdelki, datumu, mesecu in tednu prevzetja.


## Tehnologije

* HTML
* CSS
* Bootstrap   
* JavaScript 
* Node.js
* Ejs-mate 
* Express 
* Nodemailer 
* Dotenv 
* Flash 
* Method-override 
* Passport 
* Mongoose 
    



## Uporaba
1. Domaća stran
     
   Domaća stran je narejena za dodavanje računov. Korisnik naredi novi račun tako,da s klikom na
       gumb "Dodaj izdelek" doda vrstico v katero vpiše ime izdelka, količino, ceno, "ddv" (interni ddv),
       z checkboxom označi, če je izdelek brezplačen in potem s klikom na gumb "Zaključi"
       aktivira JS za izračun cene za ta produkt. 
  
   Korisnik lahko doda neomejeno število produktov na ta način. 
         
   Ko je korisnik končal z dodavanjem produktov s klikom na gumb "Plačaj"
       aktivira JS za izračun cene za celoten račun.

   Z gumbom "Print" sharani podatke v bazo podatkov in eventualno printa račun na formatu A4.

3. "All bills" stran 

   Po kliku na "all bills" (vsi računi) boste preusmereni na stran "all bils" kjer bojo prikazani vsi računi,
       v navbar-u pa boste meli dodatna 2 gumba za prikaz plačanih ali ne plačanih računov.
   
   Vsaka vrstica/račun je hiper povezava do pogleda v podatke izbranega računa.
   Po kliku na eden od računov boste preusmereni na stran kjer bodo prikazani podatki za izbrani račun.
   Boste meli tudi gumbe za Edit, Delete ali pa Print računa.

   S klikom na gumb DELETE boste izbrisali račun in potem dobili tudi obvestilo o tem ter boste preusmereni na stranicu z          vsemi računi. S klikom na print boste seveda meli opcijo za printat račun.

   Z klikom na EDIT boste preusmereni na stran edit kjer boste lahko spremenili podatke o produktih ali
       pa podatke o izdaji in plačilu.
    
5. Search Employee

    Na search strani lahko vpišete ime delavca in kot rezultat boste dobili seznam produktov ki jih je slednji kupil.
    Če pa dodate še ime produkta v input polju za produkte boste dobili še eno tabelo na levi strani v kateri bo ime                produkta ter kolikokrat ga je delavec v kupil. 
            
    Po kliku na submit boste imeli na voljo opcije za prikaz vseh (default) ali ne plačanih računov ter
       opcijo za printanje podatkov ki ste jih dobili kot rezultat vašega iskanja.
                
4. Vacations

    Stran je razdeljena v 3 stolpca.
   
   - 1 stolpec
     Na vacation strani so prikazani podatki o dopustih vseh delavcih. Prvi stolpec oziroma na levi strani
         (če ste na računalniku) na vrhu bo tabela s podatki o dopustih kot so,
         ime delavca ter lanski in letošnji dopust ter število koriščenega in preostalega dopusta. 

     Spodaj bo za vsakega delavca posebej tabela v kateri so prikazani odobreni dopusti s prikazanim
         začetkom in koncem dopusta ter številom dni.
    
   - 2 stolpec
     V drugem stolpcu so 3 tabele. Prva tabela je tabela oddanih dopustov ki še niso odobreni ali zavrnjeni. 
       Tabela zajema tudi gumb za odobritev ali zavrnitev dopusta.
                
     V drugi tabeli pa so podatki o odobrenom dopustu ampak samo če je zadji dan dopusta posle današnjeg datuma!
       Tabela zajema tudi gumb za zavrnitev dopusta.
                
     V tretji tabeli pa so zavrnjene vloge dopustov ampak samo če je prvi dan dopusta pred današnjim datumom.
       Tabela zajema tudi gumb za odobritev dopusta.
     
   - 3 stolpec
      V tretjem stolpcu je form za urejanje dopusta in nadur za delavce ki se prikaže ob kliku na button "Submit".
       V prvem input oziroma select polju se izbere ime delavca, v drugem se vpiše število lanskega dopusta, 
       v tretjem pa letošnji dopust in na koncu v  četrtem polju upišemo število nadur delavca. 



   

6. Users
   

        Stran users je razdeljena v 2 stolpca.

   _ 1 stolpec

    V prvem stolpcu je tabela s podatki korisnikov ki se lahko prijavijo na spletno stran-
       Tabela zajema podatke kot so username, role, Edit ter Delete.

   S klikom na delete izbrišemo korisnika iz baze podatkov (People).
   Edit gumb pa nas preusmeri na users edit page kjer imamo 2 opciji. Lahko spremenimo username ali pa role.

   _ 2 stolpec

   Drugi stolpec zajema tabelo v kateri so shranjeni vsi zaposleni in tisti ki so včasih bili zaposleni v podjetju.
    V tabeli so prikazani podatki kot so ime,priimek, zaposlitveni status ter trenutni status (active, inactive) ter
    gumb edit.

   Zaposleni ki imajo status activen so zeleno označeni na drugi strani pa neactivni so označeni z rdečim ozadjem.

   Edit pa nas preusmeri na stran employee/edit kjer lahko spremenimo podatke zaposlenog kot so ime,priimek, zaposlitveni         status in trenutni status zaposlenog v podjetju.
            
8. Add employee

   Add employee stran je stran ki zajema form za dodavanje novega zaposlenga. Podatke ki jih je potrebno vnest so                 Ime,priimek,geslo, zaposlitveni status ter trenutni status.

9. Add user

   Na add user strani imamo form z username-om, password-om ter Role.
        

# Baza podatkov

    Za bazo podatkov sem uporabljal Mongoose. Število baz ki jih uporabljam je 8.
    Baze podatkov ki jih uporabljam:

1. Costs - V bazo podatkov se shranjujejo računi od porabljenega denarja od interne prodaje blaga.
                 _ Podatki ki se shranjujejo v bazo so:
                     _ Datum računa,
                     _ Kupljeni produkti,
                     _ Končni znesek računa;


### Employees - Shranjevanje podatkov zaposlenih delavcev.
     Podatki ki se shranjujejo so:
        * username,
        * lastname,
        * password,
        * status,
        * vrsta zaposliteve;
                 
### People - V to bazo so shranjeni podatki oseb ki se lahko prijavijo na spletno stran "Izdaja blaga" in eventualno pregledajo ali spremenijo podatke.
              Podatki ki se shranjujejo so:
                 * username,
                 * role,
                 * password;

### Users - V to bazo so shranjeni vsi podatki kadar se doda novi račun.
            Podatki ki se shranjujejo so:
                  * izdal,
                  * kupec,
                  * datum prodaje,
                  * koledarski teden,
                  * leto,
                  * mesec,
                  * številka v tekočem letu,
                  * številka v tekočem mesecu,
                  * datum plačila,
                  * plačano (boolean),
                  * products - nested array object :
                      * ime produkta,
                      * količina,
                      * cena,
                      * 1 izdelek na teden,
                      * skupna cena,

### Vacations - V to bazo so shranjeni podatki zaposlenog ter število ur, dopust iz preteklega in tekočega leta ter oddane vloge za dopust.
                 Podatki ki se shranjujejo so:
                    * delavec
                    * lanski dopust
                    * letošnji dopust
                    * koriščen dopust
                    * nadure
                    * oddane vloge za dopust NESTED OBJECTS kjer se shranjujejo vse oddane vloge:
                        * 1 dan dopusta,
                        * zadnji dan dopusta,
                        * število dni,
                        * status (default "pending"),
                        * datum oddaje vloge
                        
### Notifications - V to bazo podatkov so shranjeni podatki o obvestilih. Obvestila so prikazana na spletni strani kadar user odda vlogo za dopust.
                      Podatki ki se shranjujejo so:
                         * Ime in priimek delavca,
                         * id delavca
                         * id dopust objecta
                         * število dni
                         * status (default "false") se spremeni kadar šef odobri ali ne odobri dopust.

### Session - session podatki kadar se korisnik prijavi na spletno stran.


# Avtor

## Ermin Joldić


# Kontakt

    * Ermin Joldić,
    * +38640415987
    * erminjoldic26@gmail.com
    * https://www.linkedin.com/in/ermin-joldić-a6774729a


# Dodatni Nasveti
    ## Za kakršnokoli spreminjanje podatkov na spletni strani je mogoče samo za korisnike čigav role == Admin ali Moderator.

    Visitor role ima dostop do pogleda strani in lahko testira req, post forms in kot 
    rezultat bo dobil flash msg z info sporočilom da je urejanje dovoljeno samo za Admina ali moderatora.

## Za testiranje spletne strani se lahko prijavite:

     username: test1
     geslo: test1

