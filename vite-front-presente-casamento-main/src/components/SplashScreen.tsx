import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Animate progress bar 0 → 100 over ~2 s
    const start = performance.now();
    const duration = 2200;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, (elapsed / duration) * 100);
      setProgress(pct);

      if (pct < 100) {
        requestAnimationFrame(tick);
      } else {
        // Fade out then unmount
        setTimeout(() => {
          setFadeOut(true);
          setTimeout(onDone, 500);
        }, 200);
      }
    };

    requestAnimationFrame(tick);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 0.5s ease',
      }}
    >
      {/* Background photo */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/img1.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(10,18,40,0.25) 0%, rgba(10,18,40,0.5) 50%, rgba(10,18,40,0.92) 100%)',
        }}
      />

      {/* Bottom content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 420,
          padding: '0 32px 52px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
        }}
      >
        {/* Names */}
        <div style={{ textAlign: 'center' }}>
          <p
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 8vw, 40px)',
              fontWeight: 500,
              color: '#fff',
              letterSpacing: '0.04em',
              lineHeight: 1.2,
              margin: 0,
              textShadow: '0 2px 16px rgba(0,0,0,0.5)',
            }}
          >
            Luís &amp; Natiele
          </p>
          <p
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: 13,
              fontWeight: 400,
              color: 'rgba(200,220,240,0.75)',
              letterSpacing: '0.25em',
              marginTop: 6,
              textTransform: 'uppercase',
            }}
          >
            25 · 07 · 2026 &nbsp;·&nbsp; Araguaína, TO
          </p>
        </div>

        {/* Loading row */}
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          {/* Dot spinner */}
          <DotsSpinner />

          {/* Progress bar */}
          <div
            style={{
              width: '100%',
              height: 3,
              borderRadius: 99,
              background: 'rgba(200,220,240,0.15)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: 99,
                background: 'linear-gradient(90deg, #4A7AB5, #C8DCF0)',
                transition: 'width 0.05s linear',
              }}
            />
          </div>

          <p
            style={{
              fontFamily: "'Raleway', sans-serif",
              fontSize: 11,
              color: 'rgba(200,220,240,0.5)',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Carregando…
          </p>
        </div>
      </div>
    </div>
  );
}

function DotsSpinner() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: '#4A7AB5',
            animation: `splashDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes splashDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
          40% { transform: scale(1.15); opacity: 1; background: #C8DCF0; }
        }
      `}</style>
    </div>
  );
}
