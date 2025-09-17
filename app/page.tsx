"use client"

import { useIsClient } from '@/hooks/useIsClient'
import ContadorDivida from '@/components/ContadorDivida'

export default function Page() {
  const isClient = useIsClient()

  if (!isClient) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
        fontFamily: 'system-ui, sans-serif'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          color: '#dc2626'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #dc2626',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
            Carregando...
          </h2>
        </div>
      </div>
    )
  }

  return <ContadorDivida />
}