// Einfacher In-Memory-Speicher fuer eingehende Anfragen.
// TEMPORAER: Nicht persistent (geht bei Redeploy/Cold-Start verloren) und nicht
// zwischen mehreren Isolates synchron. Sobald Deno KV auf diesem Projekt
// eingerichtet ist, hier auf Deno.openKv() umstellen.

export interface Klassifikation {
  ist_seriös: boolean;
  ist_spam: boolean;
  kategorie: string;
  budget_einschätzung: string;
  dringlichkeit: "niedrig" | "mittel" | "hoch";
  zusammenfassung: string;
}

export interface Anfrage {
  id: string;
  von: string;
  profilName: string;
  nachricht: string;
  klassifikation: Klassifikation;
  eingegangen: string;
  status: string;
}

export const anfragenSpeicher: Anfrage[] = [];

