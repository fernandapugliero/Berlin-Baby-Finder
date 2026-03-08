import { PageShell } from "@/components/PageShell";

const sections = [
  {
    title: "1. Verantwortliche Stelle",
    text: "[bitte ergänzen]",
  },
  {
    title: "2. Zugriffsdaten",
    text: "Beim Besuch dieser Website können technisch notwendige Daten verarbeitet werden (z.\u00A0B. IP-Adresse, Zeitpunkt des Zugriffs). Diese Daten werden ausschließlich zur Bereitstellung und Sicherheit der Website verwendet.",
  },
  {
    title: "3. Nutzerkonto",
    text: "Wenn du ein Konto erstellst, werden die von dir angegebenen Daten zur Bereitstellung deines Accounts verarbeitet. Du kannst dein Konto jederzeit löschen lassen.",
  },
  {
    title: "4. Gespeicherte Aktivitäten",
    text: "Wenn du Aktivitäten speicherst, werden diese Informationen deinem Nutzerkonto zugeordnet, um dir deine gespeicherten Inhalte anzuzeigen.",
  },
  {
    title: "5. Kontaktaufnahme",
    text: "Wenn du uns kontaktierst, verarbeiten wir deine Angaben zur Bearbeitung deiner Anfrage. Deine Daten werden nicht an Dritte weitergegeben.",
  },
  {
    title: "6. Deine Rechte",
    text: "Du hast das Recht auf Auskunft, Berichtigung, Löschung und weitere Rechte nach den geltenden Datenschutzgesetzen. Wende dich hierzu an die verantwortliche Stelle.",
  },
];

const Datenschutz = () => (
  <PageShell title="Datenschutz">
    <p className="text-lg text-muted-foreground leading-relaxed">
      Der Schutz deiner Daten ist uns wichtig. Diese Seite informiert dich darüber, welche personenbezogenen Daten auf Rausi verarbeitet werden.
    </p>

    <div className="space-y-8">
      {sections.map((s) => (
        <section key={s.title} className="space-y-2">
          <h2 className="font-display font-bold text-xl text-foreground">{s.title}</h2>
          <p className="text-muted-foreground leading-relaxed">{s.text}</p>
        </section>
      ))}
    </div>
  </PageShell>
);

export default Datenschutz;
