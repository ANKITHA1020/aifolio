import { useEffect, useState } from "react";
import ComponentErrorBoundary from "./ComponentErrorBoundary";

interface Counter {
  label?: string;
  value?: number;
  suffix?: string;
  prefix?: string;
}

interface AchievementsCountersProps {
  counters: Counter[];
  templateType: string;
  config?: Record<string, any>;
}

export default function TemplateAchievementsCounters({
  counters = [],
  templateType,
  config,
}: AchievementsCountersProps) {
  const [animatedValues, setAnimatedValues] = useState<number[]>([]);

  useEffect(() => {
    if (counters.length === 0) return;

    const targetValues = counters.map((c) => c.value || 0);
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = Math.min(currentStep / steps, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic

      setAnimatedValues(
        targetValues.map((target) => Math.floor(target * easedProgress))
      );

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues(targetValues);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [counters]);

  if (!counters || counters.length === 0) {
    return null;
  }

  return (
    <ComponentErrorBoundary componentName="Achievements Counters">
      <section id="section-achievements_counters" className={`achievements-counters achievements-counters-${templateType}`}>
        <div className="achievements-counters-container">
          <div className="achievements-counters-grid">
            {counters.map((counter, idx) => (
              <div key={idx} className="achievements-counter-item">
                <div className="achievements-counter-value">
                  {counter.prefix || ""}
                  {animatedValues[idx] !== undefined
                    ? animatedValues[idx]
                    : counter.value || 0}
                  {counter.suffix || ""}
                </div>
                {counter.label && (
                  <div className="achievements-counter-label">
                    {counter.label}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </ComponentErrorBoundary>
  );
}

