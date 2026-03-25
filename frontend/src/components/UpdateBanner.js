import React, { useEffect, useState } from 'react';
import { updateService } from '../services/api';

export default function UpdateBanner() {
  const [update, setUpdate] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    updateService.check()
      .then(res => { if (res.data.hasUpdate) setUpdate(res.data); })
      .catch(() => {});
  }, []);

  if (!update || dismissed) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: '#1a4a6b', color: '#fff',
      borderRadius: 14, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
      maxWidth: 380, fontSize: 13,
    }}>
      <span style={{ fontSize: 20 }}>🎁</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
          Sewing Box v{update.latestVersion} est disponible !
        </div>
        <a
          href={update.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#7dd3fc', fontWeight: 600, textDecoration: 'underline' }}
        >
          Télécharger la mise à jour →
        </a>
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0,
        }}
      >
        ✕
      </button>
    </div>
  );
}
