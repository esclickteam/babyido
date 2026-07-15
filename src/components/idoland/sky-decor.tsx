export function SkyDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <span className="ido-cloud" style={{ top: "12%", left: "8%" }} />
      <span
        className="ido-cloud"
        style={{ top: "22%", right: "12%", width: 90, animationDuration: "36s", animationDirection: "alternate-reverse" }}
      />
      <span className="ido-sun" />
    </div>
  );
}
