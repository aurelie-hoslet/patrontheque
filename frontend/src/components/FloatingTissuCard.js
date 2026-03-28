import React, { useRef, useEffect, useCallback } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { X, Layers, ArrowUpRight } from 'lucide-react';

const COULEURS_MAP = {
  rouge: '#e53935', bleu: '#1e88e5', vert: '#43a047', jaune: '#fdd835',
  noir: '#212121', blanc: '#f0f0f0', orange: '#fb8c00', rose: '#e91e8c',
  violet: '#8e24aa', marron: '#6d4c41', gris: '#757575', beige: '#d4b896',
};

function FloatingTissuCard({ tissu, x, y, zIndex, onClose, onBringToFront, onMove, onOpenFull }) {
  const dragState = useRef({ active: false, startX: 0, startY: 0, origX: 0, origY: 0 });

  const handleMouseMove = useCallback((e) => {
    if (!dragState.current.active) return;
    onMove(
      dragState.current.origX + e.clientX - dragState.current.startX,
      dragState.current.origY + e.clientY - dragState.current.startY,
    );
  }, [onMove]);

  const handleMouseUp = useCallback(() => {
    dragState.current.active = false;
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  const handleHeaderMouseDown = (e) => {
    if (e.target.closest('button')) return;
    e.preventDefault();
    dragState.current = { active: true, startX: e.clientX, startY: e.clientY, origX: x, origY: y };
    onBringToFront();
  };

  return (
    <Box
      onMouseDown={onBringToFront}
      sx={{
        position: 'fixed',
        left: x,
        top: y,
        zIndex,
        width: 264,
        borderRadius: 3,
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        bgcolor: 'white',
        border: '1.5px solid rgba(51,101,138,0.2)',
      }}
    >
      {/* Header — poignée de drag */}
      <Box
        onMouseDown={handleHeaderMouseDown}
        sx={{
          display: 'flex', alignItems: 'center', gap: 1,
          px: 1.5, py: 0.9,
          bgcolor: '#f0f6fa',
          borderBottom: '1px solid rgba(51,101,138,0.12)',
          cursor: 'grab',
          userSelect: 'none',
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', flex: 1, color: '#1a1a2e' }} noWrap>
          {tissu.nom}
        </Typography>
        {onOpenFull && (
          <IconButton size="small" onClick={onOpenFull}
            sx={{ p: 0.25, color: '#33658a', '&:hover': { bgcolor: 'rgba(51,101,138,0.1)' } }}>
            <ArrowUpRight size={15} strokeWidth={2.5} />
          </IconButton>
        )}
        <IconButton size="small" onClick={onClose}
          sx={{ p: 0.25, color: 'text.secondary', '&:hover': { color: '#e85d75', bgcolor: 'rgba(232,93,117,0.08)' } }}>
          <X size={14} strokeWidth={2.5} />
        </IconButton>
      </Box>

      {/* Photo */}
      {tissu.image ? (
        <Box sx={{ height: 140, overflow: 'hidden' }}>
          <Box component="img" src={tissu.image} alt={tissu.nom}
            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </Box>
      ) : (
        <Box sx={{ height: 100, bgcolor: 'rgba(51,101,138,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Layers size={36} color="#33658a" strokeWidth={1.5} style={{ opacity: 0.2 }} />
        </Box>
      )}

      {/* Infos */}
      <Box sx={{ px: 1.5, pt: 1, pb: 1.25, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
        {tissu.typeTissu && (
          <Typography sx={{ fontSize: '0.75rem', color: '#33658a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {tissu.typeTissu}
          </Typography>
        )}
        {(tissu.precisionCouleur || tissu.teinte) && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            {tissu.teinte && COULEURS_MAP[tissu.teinte] && (
              <Box sx={{
                width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
                bgcolor: COULEURS_MAP[tissu.teinte],
                border: `1.5px solid ${tissu.teinte === 'blanc' ? '#ccc' : 'transparent'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }} />
            )}
            <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
              {tissu.precisionCouleur || tissu.teinte}
            </Typography>
          </Box>
        )}
        {tissu.matiere && (
          <Typography sx={{ fontSize: '0.78rem', color: 'text.secondary' }}>
            {tissu.matiere}
          </Typography>
        )}
        {tissu.quantite != null && (
          <Typography sx={{ fontSize: '0.88rem', fontWeight: 800, color: '#33658a', mt: 0.25 }}>
            {tissu.quantite} m disponibles
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default FloatingTissuCard;
