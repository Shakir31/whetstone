export default function EntryList({ entries }) {
  if (entries.length === 0) {
    return <p className="empty">No deeds recorded yet.</p>
  }

  return (
    <section className="entry-list">
      <h2>Past Entries</h2>
      {entries.map((entry) => (
        <article key={entry.id} className="panel entry">
          <header>
            <time>{new Date(entry.createdAt).toLocaleString()}</time>
            <span className="gains">
              {entry.body > 0 && <span className="gain">BODY +{entry.body}</span>}
              {entry.mind > 0 && <span className="gain">MIND +{entry.mind}</span>}
            </span>
          </header>
          <p>{entry.text}</p>
        </article>
      ))}
    </section>
  )
}
