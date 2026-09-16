import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Regulamin | PrepCode',
}

export default function TermsPage() {
  return (
    <main className="mt-16 max-w-3xl mx-auto px-4 py-16">
      <h1 className="tiles-title-font text-gray-100 mb-2">Regulamin świadczenia usług PrepCode</h1>
      <p className="body-small text-gray-60 mb-8">Ostatnia aktualizacja: 13 września 2026 r.</p>

      <div className="mb-8 rounded-xl border border-warning-50/30 bg-warning-50/10 p-4 body-small text-gray-100">
        To jest wzór regulaminu przygotowany jako punkt wyjścia. Przed udostępnieniem go
        użytkownikom uzupełnij dane swojej działalności (nazwa, adres siedziby, NIP) oraz adres
        kontaktowy, i skonsultuj całość z prawnikiem - zwłaszcza w zakresie prawa odstąpienia od
        umowy i podatku VAT dla sprzedaży cyfrowej w UE.
      </div>

      <div className="flex flex-col gap-6 body-font text-gray-100">
        <section>
          <h2 className="body-large mb-2">1. Postanowienia ogólne</h2>
          <p>
            Niniejszy regulamin określa zasady korzystania z serwisu PrepCode (&quot;Serwis&quot;),
            dostępnego pod adresem [adres domeny], którego operatorem jest [nazwa działalności /
            spółki], z siedzibą pod adresem [adres siedziby], NIP: [NIP] (&quot;Operator&quot;).
            Serwis umożliwia naukę do rozmów kwalifikacyjnych z branży IT poprzez bazę pytań
            i odpowiedzi, tryb egzaminu oraz narzędzia do śledzenia procesu rekrutacyjnego.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">2. Konto użytkownika</h2>
          <p>
            Korzystanie z pełnej funkcjonalności Serwisu wymaga założenia konta. Użytkownik
            zobowiązuje się podać prawdziwe dane (w tym adres e-mail) i ponosi odpowiedzialność za
            działania podejmowane przy użyciu swojego konta. Jedno konto może być używane wyłącznie
            przez jedną osobę - udostępnianie danych logowania osobom trzecim jest zabronione.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">3. Plany i płatności</h2>
          <p>
            Serwis oferuje plan bezpłatny (Free) o ograniczonym dostępie do treści oraz plan
            płatny (Pro) w modelu subskrypcji miesięcznej, którego aktualna cena jest widoczna na
            stronie cennika przed zakupem. Płatności obsługuje zewnętrzny dostawca - Stripe -
            Operator nie przechowuje danych kart płatniczych. Subskrypcja odnawia się automatycznie
            co okres rozliczeniowy, aż do jej anulowania. Operator zastrzega sobie prawo do zmiany
            cen z odpowiednim wyprzedzeniem, z zachowaniem cen już opłaconych okresów.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">4. Prawo odstąpienia od umowy</h2>
          <p>
            Konsumentowi przysługuje prawo odstąpienia od umowy zawartej na odległość w terminie 14
            dni bez podania przyczyny. Prawo to nie przysługuje jednak w odniesieniu do treści
            cyfrowych dostarczanych natychmiast po zawarciu umowy, jeżeli konsument wyraźnie
            zgodził się na rozpoczęcie świadczenia przed upływem terminu do odstąpienia i przyjął
            do wiadomości utratę tego prawa. Taką zgodę Operator zbiera przed rozpoczęciem
            korzystania z planu Pro.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">5. Rezygnacja z subskrypcji</h2>
          <p>
            Użytkownik może w każdej chwili anulować subskrypcję samodzielnie z poziomu ustawień
            konta (panel zarządzania płatnościami udostępniany przez Stripe). Anulowanie skutkuje
            zaprzestaniem naliczania kolejnych opłat, a dostęp do planu Pro pozostaje aktywny do
            końca opłaconego okresu rozliczeniowego. Operator nie zwraca proporcjonalnej części
            opłaty za niewykorzystaną część okresu, chyba że przepisy prawa stanowią inaczej.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">6. Zasady korzystania z Serwisu</h2>
          <p>
            Zabronione jest kopiowanie, rozpowszechnianie lub udostępnianie osobom trzecim treści
            Serwisu (w tym pytań, odpowiedzi i materiałów) w celach komercyjnych, automatyczne
            pobieranie danych (scraping) oraz podejmowanie działań mogących zakłócić działanie
            Serwisu lub naruszyć bezpieczeństwo innych użytkowników.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">7. Własność intelektualna</h2>
          <p>
            Wszelkie prawa do treści udostępnianych w Serwisie należą do Operatora lub jego
            licencjodawców. Użytkownik otrzymuje niewyłączną licencję na korzystanie z treści
            wyłącznie do własnego użytku niekomercyjnego, w celach związanych z nauką.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">8. Odpowiedzialność</h2>
          <p>
            Serwis udostępniany jest w stanie &quot;tak jak jest&quot;. Operator dokłada starań, aby
            treści były rzetelne i aktualne, jednak nie gwarantuje konkretnych rezultatów (np.
            uzyskania zatrudnienia). Odpowiedzialność Operatora wobec konsumenta ogranicza się do
            kwoty opłat uiszczonych przez użytkownika w ciągu ostatnich 12 miesięcy, w zakresie
            dopuszczalnym przez obowiązujące przepisy.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">9. Zawieszenie i usunięcie konta</h2>
          <p>
            Operator może zawiesić lub usunąć konto użytkownika w przypadku naruszenia niniejszego
            regulaminu, prób oszustwa płatniczego lub działań szkodzących innym użytkownikom.
            Użytkownik może samodzielnie usunąć swoje konto z poziomu ustawień profilu.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">10. Reklamacje</h2>
          <p>
            Reklamacje dotyczące działania Serwisu lub rozliczeń można zgłaszać na adres [adres
            e-mail kontaktowy]. Operator rozpatrzy reklamację w terminie 14 dni od jej otrzymania.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">11. Zmiany regulaminu</h2>
          <p>
            Operator zastrzega sobie prawo do zmiany regulaminu z ważnych przyczyn (zmiana
            przepisów, funkcjonalności Serwisu lub warunków cenowych). O zmianach użytkownicy
            zostaną poinformowani z co najmniej 14-dniowym wyprzedzeniem drogą mailową lub poprzez
            komunikat w Serwisie.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">12. Postanowienia końcowe</h2>
          <p>
            W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa
            polskiego, w tym Kodeksu cywilnego oraz ustawy o prawach konsumenta. Ewentualne spory
            będą rozstrzygane przez sąd właściwy zgodnie z obowiązującymi przepisami.
          </p>
        </section>
      </div>
    </main>
  )
}
