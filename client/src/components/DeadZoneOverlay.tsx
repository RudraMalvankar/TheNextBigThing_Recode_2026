type DeadZone = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type DeadZoneOverlayProps = {
  zones: DeadZone[];
};

export default function DeadZoneOverlay({ zones }: DeadZoneOverlayProps): JSX.Element {
  return (
    <div className="pointer-events-none absolute inset-0">
      {zones.map((zone, index) => (
        <div
          key={`${zone.x}-${zone.y}-${index}`}
          className="absolute bg-blue-500/10"
          style={{
            left: zone.x,
            top: zone.y,
            width: zone.w,
            height: zone.h,
          }}
        />
      ))}
    </div>
  );
}
