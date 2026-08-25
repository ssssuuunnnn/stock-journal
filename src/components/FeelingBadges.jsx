export default function FeelingBadges({ feelings }) {
  if (!feelings || feelings.length === 0) return null

  return (
    <div className="feeling-badges">
      {feelings.map((feeling) => (
        <span className="feeling-badge" key={feeling}>
          {feeling}
        </span>
      ))}
    </div>
  )
}
