/**
 * The connector between two step dots. Fills left-to-right as the flow
 * advances, so the chrome confirms the direction the content just travelled.
 */
export default function StepConnector({
  done,
  className,
}: {
  done: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`relative h-px w-4 sm:w-6 overflow-hidden rounded-full bg-line ${
        className ?? ""
      }`}
    >
      <span
        className="absolute inset-y-0 left-0 bg-primary"
        style={{
          width: done ? "100%" : "0%",
          transition:
            "width var(--motion-slow) var(--motion-ease)",
        }}
      />
    </span>
  );
}
