import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { isNative } from './platform';

/** Light haptic impact (e.g., button tap). */
export async function hapticLight(): Promise<void> {
  if (!isNative()) return;
  await Haptics.impact({ style: ImpactStyle.Light });
}

/** Medium haptic impact (e.g., toggle, selection). */
export async function hapticMedium(): Promise<void> {
  if (!isNative()) return;
  await Haptics.impact({ style: ImpactStyle.Medium });
}

/** Heavy haptic impact (e.g., important action). */
export async function hapticHeavy(): Promise<void> {
  if (!isNative()) return;
  await Haptics.impact({ style: ImpactStyle.Heavy });
}

/** Success notification haptic. */
export async function hapticSuccess(): Promise<void> {
  if (!isNative()) return;
  await Haptics.notification({ type: NotificationType.Success });
}

/** Error notification haptic. */
export async function hapticError(): Promise<void> {
  if (!isNative()) return;
  await Haptics.notification({ type: NotificationType.Error });
}

/** Selection changed haptic. */
export async function hapticSelection(): Promise<void> {
  if (!isNative()) return;
  await Haptics.selectionChanged();
}
