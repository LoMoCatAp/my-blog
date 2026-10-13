import styles from "./food.module.css";

export function snapshotCard(card: HTMLElement): HTMLElement {
  const face = card.querySelector<HTMLElement>("[data-ticket-face]")!;
  const snapshot = face.cloneNode(true) as HTMLElement;
  snapshot.style.width = `${card.clientWidth}px`;
  snapshot.style.height = `${card.clientHeight}px`;
  snapshot.style.flex = "none";
  snapshot.style.background = getComputedStyle(card).background;
  return snapshot;
}

/** Split-flap calendar: the old upper leaf folds down, then the new lower
 * leaf settles. The real result stays underneath the temporary paper layers. */
export async function turnCalendar(card: HTMLElement, before: HTMLElement, after: HTMLElement, tracked: Animation[], delay = 0, duration = 780): Promise<void> {
  const overlay = card.querySelector<HTMLElement>("[data-calendar]")!;
  const half = card.clientHeight / 2;
  card.classList.add(styles.turning);
  const leaf = (snapshot: HTMLElement, lower: boolean, className: string) => {
    const sheet = document.createElement("div");
    sheet.className = `${styles.calendarLeaf} ${className}`;
    sheet.style.height = `${half}px`;
    sheet.style.top = lower ? `${half}px` : "0";
    const copy = snapshot.cloneNode(true) as HTMLElement;
    copy.style.height = `${card.clientHeight}px`;
    if (lower) copy.style.transform = `translateY(-${half}px)`;
    sheet.append(copy); overlay.append(sheet); return sheet;
  };
  overlay.replaceChildren();
  const bottomOld = leaf(before, true, styles.bottomLeaf);
  const topOld = leaf(before, false, styles.topLeaf);
  const bottomNew = leaf(after, true, styles.bottomLeaf);
  const hinge = document.createElement("span");
  hinge.className = styles.calendarHinge; hinge.style.top = `${half}px`; overlay.append(hinge);
  const topDuration = duration * .48, bottomDuration = duration * .52;
  const own = [
    topOld.animate([{ transform: "rotateX(0deg)", filter: "brightness(1)" }, { transform: "rotateX(-92deg)", filter: "brightness(.55)" }], { duration: topDuration, delay, easing: "cubic-bezier(.45,0,.8,.45)", fill: "forwards" }),
    bottomNew.animate([{ transform: "rotateX(90deg)", filter: "brightness(.65)" }, { transform: "rotateX(-8deg)", filter: "brightness(1.08)", offset: .8 }, { transform: "rotateX(0deg)", filter: "brightness(1)" }], { duration: bottomDuration, delay: delay + topDuration, easing: "cubic-bezier(.1,.6,.22,1)", fill: "both" }),
    hinge.animate([{ opacity: 0 }, { opacity: .8, offset: .48 }, { opacity: 0 }], { duration, delay, fill: "both" }),
  ];
  // Explicit stacking prevents the old lower half from covering the new leaf.
  bottomOld.style.zIndex = "1"; bottomNew.style.zIndex = "3"; topOld.style.zIndex = "4";
  tracked.push(...own);
  await Promise.all(own.map(animation => animation.finished.catch(() => {})));
  own.forEach(animation => animation.cancel());
  if (overlay.contains(bottomOld)) { overlay.replaceChildren(); card.classList.remove(styles.turning); }
}

export function particles(card: HTMLElement, tracked: Animation[], landing = false): void {
  const layer = card.parentElement?.querySelector<HTMLElement>("[data-particles]");
  if (!layer) return;
  const mobile = window.matchMedia("(max-width: 620px)").matches;
  const count = mobile ? (landing ? 8 : 10) : (landing ? 12 : 16);
  const colors = ["#ffad66", "#bd8cdf", "#77bdaa", "#ffc550"];
  for (let i = 0; i < count; i++) {
    const dot = document.createElement("span"); dot.className = styles.particle;
    const size = 3 + Math.random() * 5;
    dot.style.width = dot.style.height = `${size}px`;
    dot.style.left = `${card.offsetLeft + card.clientWidth / 2}px`;
    dot.style.top = `${card.offsetTop + card.clientHeight / 2}px`;
    dot.style.background = colors[i % colors.length];
    dot.style.borderRadius = i % 3 ? "50%" : "2px";
    layer.append(dot);
    const angle = (i / count) * Math.PI * 2 + Math.random() * .4;
    const distance = (Math.min(card.clientWidth * .58, 150)) * (.55 + Math.random() * .45);
    const x = Math.cos(angle) * distance, y = Math.sin(angle) * distance * .7;
    const animation = dot.animate([
      { opacity: 0, transform: "translate(-50%,-50%) scale(.2) rotate(0deg)" },
      { opacity: .95, offset: .15 },
      { opacity: .8, transform: `translate(${x}px,${y}px) scale(1) rotate(130deg)`, offset: .7 },
      { opacity: 0, transform: `translate(${x * 1.15}px,${y + 28}px) scale(.15) rotate(220deg)` },
    ], { duration: landing ? 950 : 1150, easing: "cubic-bezier(.15,.65,.35,1)", delay: i * 9 });
    tracked.push(animation);
    animation.finished.catch(() => {}).finally(() => dot.remove());
  }
}
