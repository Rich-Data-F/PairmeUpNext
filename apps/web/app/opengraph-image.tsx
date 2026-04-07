import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'PairAgain - Collaborative Earbud Exchange Platform';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #1D4ED8 50%, #4F46E5 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: 60,
            right: 120,
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            left: 80,
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
          }}
        />

        {/* Earbud icons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 24,
            marginBottom: 32,
          }}
        >
          <div
            style={{
              fontSize: 80,
              display: 'flex',
            }}
          >
            🎧
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-2px',
            marginBottom: 16,
            display: 'flex',
          }}
        >
          PairAgain
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.85)',
            maxWidth: 700,
            textAlign: 'center',
            lineHeight: 1.4,
            display: 'flex',
          }}
        >
          Buy, Sell &amp; Trade Earbuds, Cases &amp; Accessories
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: 16,
            marginTop: 40,
          }}
        >
          {['Lost & Found', 'Marketplace', 'Reviews'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                padding: '10px 24px',
                borderRadius: 24,
                fontSize: 20,
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 18,
            display: 'flex',
          }}
        >
          pairagain.com
        </div>
      </div>
    ),
    { ...size }
  );
}
