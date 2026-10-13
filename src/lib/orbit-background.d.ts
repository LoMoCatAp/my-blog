export interface OrbitBackgroundController {
  setPaused(value: boolean): void;
  destroy(): void;
}
export function mountOrbitBackground(host: HTMLElement): OrbitBackgroundController;
