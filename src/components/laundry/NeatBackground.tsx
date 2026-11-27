import React, { useEffect, useRef, useState } from 'react';
import { NeatGradient, type NeatConfig } from '@firecms/neat';
import { cn } from '@/lib/utils';

const NEAT_PRESET_CONFIG: NeatConfig = {
  colors: [
    { color: '#FFFFFF', enabled: true },
    { color: '#EFE2CE', enabled: true },
    { color: '#D5ECEB', enabled: true },
    { color: '#E4E4E4', enabled: true },
    { color: '#F6FFFF', enabled: true },
  ],
  speed: 2,
  horizontalPressure: 4,
  verticalPressure: 5,
  waveFrequencyX: 4,
  waveFrequencyY: 3,
  waveAmplitude: 2,
  secondaryWaveEnabled: false,
  secondaryWaveFrequencyX: 3,
  secondaryWaveFrequencyY: 3,
  secondaryWaveAmplitude: 5,
  secondaryWaveSpeed: 0.6,
  secondaryWaveAngle: 1,
  shadows: 5,
  highlights: 7,
  colorBrightness: 1,
  colorSaturation: -3,
  wireframe: false,
  antialias: false,
  colorBlending: 7,
  backgroundColor: '#00A2FF',
  backgroundAlpha: 1,
  grainScale: 100,
  grainSparsity: 0,
  grainIntensity: 0.05,
  grainSpeed: 0.3,
  resolution: 0.35,
  yOffset: 600,
  yOffsetWaveMultiplier: 5,
  yOffsetColorMultiplier: 4.5,
  yOffsetFlowMultiplier: 5.5,
  flowDistortionA: 0.4,
  flowDistortionB: 3,
  flowScale: 3.3,
  flowEase: 0.53,
  flowEnabled: true,
  enableProceduralTexture: false,
  transparentTextureVoid: false,
  textureMode: 'bitmap',
  bakeEdgeSoftness: 1,
  textureVoidLikelihood: 0.06,
  textureVoidWidthMin: 10,
  textureVoidWidthMax: 500,
  textureBandDensity: 0.8,
  textureColorBlending: 0.06,
  textureSeed: 333,
  textureEase: 0.48,
  proceduralBackgroundColor: '#003FFF',
  textureShapeTriangles: 20,
  textureShapeCircles: 15,
  textureShapeBars: 15,
  textureShapeSquiggles: 10,
  domainWarpEnabled: true,
  domainWarpIntensity: 0.05,
  domainWarpScale: 0.5,
  vignetteIntensity: 0,
  vignetteRadius: 0.8,
  fresnelEnabled: false,
  fresnelPower: 2,
  fresnelIntensity: 0.5,
  fresnelColor: '#FFFFFF',
  iridescenceEnabled: false,
  iridescenceIntensity: 0.5,
  iridescenceSpeed: 1,
  prismEdgeEnabled: false,
  prismEdgeIntensity: 0.5,
  prismEdgeThinness: 3,
  prismEdgeSpread: 1,
  prismEdgeSpeed: 0.5,
  prismEdgeRipple: 1,
  bloomIntensity: 0,
  bloomThreshold: 0.7,
  chromaticAberration: 0,
  shapeType: 'plane',
  shapeRotationX: 0,
  shapeRotationY: 0,
  shapeRotationZ: 0,
  shapeAutoRotateSpeedX: 0,
  shapeAutoRotateSpeedY: 0,
  sphereRadius: 15,
  torusRadius: 15,
  torusTube: 5,
  cylinderRadius: 10,
  cylinderHeight: 40,
  planeBend: 0,
  planeTwist: 0,
  silhouetteFade: 0.25,
  cylinderFade: 0.08,
  ribbonFade: 0.05,
  flatShading: true,
  cameraLock: true,
  cameraX: 0,
  cameraY: 0,
  cameraZ: 0,
  cameraRotationX: 0,
  cameraRotationY: 0,
  cameraRotationZ: 0,
  cameraZoom: 1,
};

interface NeatBackgroundProps {
  scrollReactive?: boolean;
  className?: string;
}

export const NeatBackground: React.FC<NeatBackgroundProps> = ({
  scrollReactive = false,
  className,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setUseFallback(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    let gradient: NeatGradient | null = null;

    try {
      gradient = new NeatGradient({
        ref: canvas,
        ...NEAT_PRESET_CONFIG,
      });
    } catch {
      setUseFallback(true);
      return;
    }

    const handleScroll = () => {
      if (gradient) {
        gradient.yOffset = 600 + window.scrollY;
      }
    };

    if (scrollReactive) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (scrollReactive) {
        window.removeEventListener('scroll', handleScroll);
      }
      if (gradient) {
        gradient.destroy();
      }
    };
  }, [scrollReactive]);

  if (useFallback) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          'w-full h-full bg-gradient-to-br from-[#D5ECEB] via-[#FFFFFF] to-[#EFE2CE] pointer-events-none print:hidden',
          className
        )}
      />
    );
  }

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn('w-full h-full block pointer-events-none print:hidden', className)}
    />
  );
};

export default NeatBackground;
