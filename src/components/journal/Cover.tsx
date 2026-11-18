// Covers use fixed artwork palettes so labels never change with the page theme.
type Props = { slug: string; className?: string };

const C = {
  ink: "#14123a",
  indigo: "#4338ca",
  lav: "#e4defe",
  lime: "#c6f57a",
  white: "#ffffff",
  slate: "#2d2a5a",
};

export function Cover({ slug, className = "" }: Props) {
  const cls = `block w-full h-auto rounded-xl ${className}`;
  if (slug === "introduction-to-api-gateway")
    return (
      <svg viewBox="0 0 640 360" className={cls} role="img" aria-labelledby="cv1">
        <title id="cv1">
          Diagram: web, mobile and partner clients send requests through one API gateway, which
          routes them to three backend services.
        </title>
        <rect width="640" height="360" fill={C.lav} />
        {["Web", "Mobile", "Partner"].map((t, i) => (
          <g key={t}>
            <rect
              x="36"
              y={64 + i * 88}
              width="118"
              height="52"
              rx="10"
              fill={C.white}
              stroke={C.slate}
              strokeWidth="2"
            />
            <text
              x="95"
              y={96 + i * 88}
              textAnchor="middle"
              fontFamily="IBM Plex Sans, sans-serif"
              fontSize="18"
              fill={C.ink}
            >
              {t}
            </text>
            <path d={`M154 ${90 + i * 88} L262 180`} stroke={C.slate} strokeWidth="2.5" />
          </g>
        ))}
        <rect x="262" y="120" width="128" height="120" rx="14" fill={C.indigo} />
        <text
          x="326"
          y="174"
          textAnchor="middle"
          fontFamily="IBM Plex Sans, sans-serif"
          fontWeight="700"
          fontSize="20"
          fill={C.white}
        >
          API
        </text>
        <text
          x="326"
          y="198"
          textAnchor="middle"
          fontFamily="IBM Plex Sans, sans-serif"
          fontWeight="700"
          fontSize="20"
          fill={C.white}
        >
          Gateway
        </text>
        {["Service A", "Service B", "Service C"].map((t, i) => (
          <g key={t}>
            <path d={`M390 180 L486 ${90 + i * 88}`} stroke={C.slate} strokeWidth="2.5" />
            <rect
              x="486"
              y={64 + i * 88}
              width="124"
              height="52"
              rx="10"
              fill={C.lime}
              stroke={C.slate}
              strokeWidth="2"
            />
            <text
              x="548"
              y={96 + i * 88}
              textAnchor="middle"
              fontFamily="IBM Plex Sans, sans-serif"
              fontSize="17"
              fill={C.ink}
            >
              {t}
            </text>
          </g>
        ))}
        <text
          x="36"
          y="36"
          fontFamily="IBM Plex Sans, sans-serif"
          fontSize="14"
          fontWeight="600"
          fill={C.slate}
          letterSpacing="2"
        >
          CLIENTS
        </text>
        <text
          x="610"
          y="36"
          textAnchor="end"
          fontFamily="IBM Plex Sans, sans-serif"
          fontSize="14"
          fontWeight="600"
          fill={C.slate}
          letterSpacing="2"
        >
          SERVICES
        </text>
      </svg>
    );
  if (slug === "setting-up-an-api-ateway-for-your-microservices")
    return (
      <svg viewBox="0 0 640 360" className={cls} role="img" aria-labelledby="cv2">
        <title id="cv2">
          Diagram: the host reaches Kong on ports 8000 and 8001 and Konga on port 1337; inside a
          Docker network, Kong routes to Nginx, Apache, HTTPBin and two application servers that are
          not reachable from the host.
        </title>
        <rect width="640" height="360" fill={C.ink} />
        <text
          x="28"
          y="42"
          fontFamily="IBM Plex Sans, sans-serif"
          fontSize="14"
          fontWeight="600"
          fill={C.lav}
          letterSpacing="2"
        >
          HOST ACCESS
        </text>
        <rect x="28" y="62" width="150" height="46" rx="8" fill={C.lime} />
        <text
          x="103"
          y="91"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="14"
          fill={C.ink}
        >
          :8000 / :8001
        </text>
        <rect x="28" y="120" width="150" height="46" rx="8" fill={C.lime} />
        <text
          x="103"
          y="149"
          textAnchor="middle"
          fontFamily="JetBrains Mono, monospace"
          fontSize="14"
          fill={C.ink}
        >
          :1337 Konga
        </text>
        <rect
          x="200"
          y="28"
          width="418"
          height="306"
          rx="16"
          fill="none"
          stroke={C.lav}
          strokeWidth="2"
          strokeDasharray="8 6"
        />
        <text
          x="226"
          y="56"
          fontFamily="IBM Plex Sans, sans-serif"
          fontSize="14"
          fontWeight="600"
          fill={C.lav}
          letterSpacing="2"
        >
          DOCKER NETWORK
        </text>
        <path d="M178 85 L236 160" stroke={C.lime} strokeWidth="2.5" />
        <rect x="236" y="130" width="110" height="64" rx="12" fill={C.indigo} />
        <text
          x="291"
          y="168"
          textAnchor="middle"
          fontFamily="IBM Plex Sans, sans-serif"
          fontWeight="700"
          fontSize="20"
          fill={C.white}
        >
          Kong
        </text>
        <rect x="236" y="250" width="110" height="46" rx="8" fill={C.slate} />
        <text
          x="291"
          y="279"
          textAnchor="middle"
          fontFamily="IBM Plex Sans, sans-serif"
          fontSize="14"
          fill={C.white}
        >
          Postgres
        </text>
        <path d="M291 194 V250" stroke={C.lav} strokeWidth="2" />
        {["Nginx", "Apache", "HTTPBin", "App server A", "App server B"].map((t, i) => (
          <g key={t}>
            <path d={`M346 162 L420 ${86 + i * 52}`} stroke={C.lav} strokeWidth="2" />
            <rect x="420" y={66 + i * 52} width="176" height="40" rx="8" fill={C.lav} />
            <text
              x="508"
              y={91 + i * 52}
              textAnchor="middle"
              fontFamily="IBM Plex Sans, sans-serif"
              fontSize="15"
              fill={C.ink}
            >
              {t}
            </text>
          </g>
        ))}
      </svg>
    );
  return (
    <svg viewBox="0 0 640 360" className={cls} role="img" aria-labelledby="cv3">
      <title id="cv3">
        Typographic cover: “Extension Pack” for VS Code and Code Server, shown as code.
      </title>
      <rect width="640" height="360" fill={C.indigo} />
      <text x="40" y="70" fontFamily="JetBrains Mono, monospace" fontSize="18" fill={C.lav}>
        {'{ "extensionPack": ['}
      </text>
      <text
        x="40"
        y="170"
        fontFamily="IBM Plex Sans, sans-serif"
        fontWeight="700"
        fontSize="60"
        fill={C.white}
      >
        Extension
      </text>
      <text
        x="40"
        y="236"
        fontFamily="IBM Plex Sans, sans-serif"
        fontWeight="700"
        fontSize="60"
        fill={C.lime}
      >
        Pack
      </text>
      <text x="40" y="296" fontFamily="JetBrains Mono, monospace" fontSize="18" fill={C.lav}>
        {"] } // VS Code · code-server"}
      </text>
    </svg>
  );
}
