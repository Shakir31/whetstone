import { Button, Panel, Tag } from "../ui/whetstone.jsx";
import { ACHIEVEMENTS } from "../lib/achievements.js";
import { dayMonth } from "../lib/format.js";

// Only earned achievements are shown. The rest stay sealed — no names, no
// requirements — so each one is discovered when it is earned.
export default function AchievementsPanel({ achievements, wornTitle, onWear }) {
  const earned = ACHIEVEMENTS.filter((a) => achievements[a.key]).sort((a, b) =>
    achievements[b.key].localeCompare(achievements[a.key]),
  );
  const sealed = ACHIEVEMENTS.length - earned.length;

  return (
    <Panel
      title="Achievements"
      actions={<Tag>{`${earned.length} / ${ACHIEVEMENTS.length}`}</Tag>}
      className="achievements"
    >
      {earned.length > 0 && (
        <ul className="achievements__grid">
          {earned.map((a) => (
            <Achievement
              key={a.key}
              achievement={a}
              earnedAt={achievements[a.key]}
              worn={Boolean(a.title) && a.title === wornTitle}
              onWear={onWear}
            />
          ))}
        </ul>
      )}

      {sealed > 0 && (
        <div className="achievements__sealed">
          <div className="sealed__slots achievements__slots" aria-hidden="true">
            {Array.from({ length: sealed }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <p className="sealed__text">
            {sealed === 1 ? "One remains sealed." : `${sealed} remain sealed.`}{" "}
            They are only revealed once earned.
          </p>
        </div>
      )}
    </Panel>
  );
}

function Achievement({ achievement: a, earnedAt, worn, onWear }) {
  return (
    <li className="achievement achievement--earned">
      <span className="ws-label achievement__name">{a.name}</span>
      <span className="ws-small">{a.how}</span>
      {a.title && <span className="achievement__title">Title: {a.title}</span>}
      <div className="achievement__foot">
        <span className="ws-micro achievement__state">
          Earned {dayMonth(earnedAt)}
        </span>
        {a.title && (
          <Button
            size="sm"
            variant={worn ? "ghost" : "secondary"}
            onClick={() => onWear(worn ? null : a.title)}
          >
            {worn ? "Remove" : "Wear"}
          </Button>
        )}
      </div>
    </li>
  );
}
