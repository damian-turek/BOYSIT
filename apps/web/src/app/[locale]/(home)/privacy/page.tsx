import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Polityka prywatności | PrepCode',
}

export default function PrivacyPage() {
  return (
    <main className="mt-16 max-w-3xl mx-auto px-4 py-16">
      <h1 className="tiles-title-font text-gray-100 mb-2">Polityka prywatności PrepCode</h1>
      <p className="body-small text-gray-60 mb-8">Ostatnia aktualizacja: 13 września 2026 r.</p>

      <div className="mb-8 rounded-xl border border-warning-50/30 bg-warning-50/10 p-4 body-small text-gray-100">
        To jest wzór polityki prywatności przygotowany jako punkt wyjścia, dopasowany do
        rzeczywistego zakresu danych przetwarzanych przez aplikację. Przed publikacją uzupełnij
        dane swojej działalności i adres kontaktowy oraz skonsultuj treść z prawnikiem lub
        inspektorem ochrony danych.
      </div>

      <div className="flex flex-col gap-6 body-font text-gray-100">
        <section>
          <h2 className="body-large mb-2">1. Administrator danych</h2>
          <p>
            Administratorem danych osobowych zbieranych w serwisie PrepCode jest [nazwa
            działalności / spółki], z siedzibą pod adresem [adres siedziby], NIP: [NIP]. Kontakt
            w sprawach dotyczących danych osobowych: [adres e-mail kontaktowy].
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">2. Jakie dane zbieramy</h2>
          <p>
            W związku z korzystaniem z Serwisu przetwarzamy: dane konta (adres e-mail, opcjonalnie
            imię/nazwę, identyfikator dostawcy logowania Supabase Auth); dane dotyczące aktywności
            w Serwisie (przeglądane i zapisane pytania, wyniki egzaminów, wpisy w śledziku
            rekrutacji); dane rozliczeniowe związane z subskrypcją (status planu, identyfikator
            klienta i subskrypcji w Stripe) - nie przechowujemy przy tym numerów kart płatniczych,
            którymi zajmuje się bezpośrednio Stripe.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">3. Cele i podstawy prawne przetwarzania</h2>
          <p>
            Dane przetwarzamy w celu: świadczenia usługi i realizacji umowy (art. 6 ust. 1 lit. b
            RODO); wypełnienia obowiązków prawnych, np. rachunkowych i podatkowych (art. 6 ust. 1
            lit. c RODO); a także w prawnie uzasadnionym interesie administratora, takim jak
            zapewnienie bezpieczeństwa Serwisu i przeciwdziałanie nadużyciom (art. 6 ust. 1 lit. f
            RODO).
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">4. Komu przekazujemy dane</h2>
          <p>
            Do przetwarzania danych korzystamy z zaufanych dostawców usług: Supabase (uwierzytelnianie
            i baza danych), Stripe (obsługa płatności i subskrypcji) oraz dostawców hostingu
            aplikacji. Dane nie są sprzedawane ani udostępniane podmiotom trzecim w celach
            marketingowych. Część z wymienionych dostawców może przetwarzać dane poza Europejskim
            Obszarem Gospodarczym (np. w USA) - w takich przypadkach transfer odbywa się w oparciu
            o standardowe klauzule umowne zatwierdzone przez Komisję Europejską.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">5. Okres przechowywania danych</h2>
          <p>
            Dane konta przechowujemy przez czas korzystania z Serwisu, do momentu usunięcia konta
            przez użytkownika. Dokumenty rozliczeniowe (np. faktury) przechowujemy przez okres
            wymagany przepisami prawa podatkowego (co do zasady 5 lat, licząc od końca roku, w
            którym powstał obowiązek podatkowy).
          </p>
        </section>

        <section id="cookies">
          <h2 className="body-large mb-2">6. Pliki cookies</h2>
          <p>
            Serwis korzysta wyłącznie z niezbędnych plików cookies, w tym ciasteczka sesyjnego
            odpowiedzialnego za utrzymanie zalogowanej sesji (Supabase Auth). Te pliki są konieczne
            do działania Serwisu i nie wymagają zgody użytkownika. Obecnie Serwis nie wykorzystuje
            cookies analitycznych ani marketingowych - jeśli to się zmieni, poprosimy o odrębną
            zgodę przed ich włączeniem.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">7. Prawa użytkownika</h2>
          <p>
            Użytkownikowi przysługuje prawo dostępu do swoich danych, ich sprostowania, usunięcia,
            ograniczenia przetwarzania, przenoszenia danych oraz wniesienia sprzeciwu wobec
            przetwarzania opartego na prawnie uzasadnionym interesie. Konto wraz z powiązanymi
            danymi można usunąć samodzielnie w ustawieniach profilu. Użytkownikowi przysługuje
            także prawo wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (UODO).
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">8. Bezpieczeństwo danych</h2>
          <p>
            Dane przesyłane są w sposób szyfrowany (HTTPS), a dostęp do konta zabezpieczony jest
            mechanizmami uwierzytelniania dostarczanymi przez Supabase Auth. Dostęp do danych
            wewnątrz organizacji Operatora mają wyłącznie osoby, którym jest to niezbędne do
            wykonywania obowiązków.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">9. Zmiany polityki prywatności</h2>
          <p>
            Niniejsza polityka może być okresowo aktualizowana, w szczególności w związku ze
            zmianami przepisów lub funkcjonalności Serwisu. O istotnych zmianach poinformujemy
            użytkowników drogą mailową lub poprzez komunikat w Serwisie.
          </p>
        </section>

        <section>
          <h2 className="body-large mb-2">10. Kontakt</h2>
          <p>
            W sprawach dotyczących ochrony danych osobowych prosimy o kontakt pod adresem [adres
            e-mail kontaktowy].
          </p>
        </section>
      </div>
    </main>
  )
}
