export default function BackgroundLayers() {
  return (
    <div className="pointer-events-none fixed inset-0 z-1" aria-hidden="true">
      <div className="fixed left-[-16vw] top-[-14vh] h-[48vw] w-[48vw] rounded-full bg-[radial-gradient(circle,rgba(76,29,149,0.2)_0%,transparent_70%)] blur-3xl" />
      <div className="fixed bottom-[-20vh] right-[-12vw] h-[42vw] w-[42vw] rounded-full bg-[radial-gradient(circle,rgba(6,78,59,0.15)_0%,transparent_70%)] blur-3xl" />
    </div>
  );
}
