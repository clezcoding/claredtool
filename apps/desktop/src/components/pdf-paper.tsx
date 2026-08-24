import { SAMPLE_INVOICE } from "../data/sample-invoice";

export function PdfPaper() {
  const invoice = SAMPLE_INVOICE;

  return (
    <article
      data-testid="pdf-paper"
      className="rounded-sm border border-black/10 shadow-2xl"
      style={{
        background: "#fff",
        color: "#111",
        width: 595,
        minHeight: 842,
        padding: "48px 56px",
      }}
    >
      <header className="mb-8">
        <p className="font-serif text-3xl tracking-tight">INVOICE</p>
      </header>

      <p className="mb-6 text-sm">
        <span>{invoice.rechnungsnummer}</span>
        {" · Datum "}
        {invoice.datum}
        {" · Fällig "}
        {invoice.faellig}
      </p>

      <div className="mb-8 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide">Absender</p>
          <p>{invoice.seller.name}</p>
          <p>{invoice.seller.address}</p>
          <p>{invoice.seller.ustid}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Empfänger</p>
          <p>{invoice.buyer.name}</p>
          <p>{invoice.buyer.address}</p>
          <p>{invoice.buyer.country}</p>
        </div>
      </div>

      <table className="mb-8 w-full text-left text-sm">
        <thead>
          <tr>
            <th className="border-b border-black/20 py-1 font-medium">Bezeichnung</th>
            <th className="border-b border-black/20 py-1 font-medium">Menge</th>
            <th className="border-b border-black/20 py-1 font-medium">Einzelpreis</th>
            <th className="border-b border-black/20 py-1 font-medium">Netto</th>
          </tr>
        </thead>
        <tbody>
          {invoice.lineItems.map((item) => (
            <tr key={item.bezeichnung}>
              <td className="break-words whitespace-normal py-1">{item.bezeichnung}</td>
              <td className="py-1 tabular-nums">{item.menge}</td>
              <td className="py-1 tabular-nums">{item.einzelpreis.toFixed(2)}</td>
              <td className="py-1 tabular-nums">{item.netto.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-8 ml-auto w-56 text-right text-sm tabular-nums">
        <p>Netto {invoice.nettoGesamt.toFixed(2)}</p>
        <p>Brutto {invoice.bruttoGesamt.toFixed(2)}</p>
        <p className="mt-2 font-serif text-2xl tracking-tight">
          {invoice.bruttoGesamt.toFixed(2)}
        </p>
      </div>

      <p className="break-words whitespace-normal text-xs">
        {invoice.taxDecision.legal_reference}
      </p>
    </article>
  );
}
