import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { isNative } from './platform';

/** Take a photo using native camera. Returns base64 data URI or null. */
export async function takePhoto(): Promise<string | null> {
  if (!isNative()) return null;

  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      width: 1024,
      height: 1024,
    });

    return image.dataUrl || null;
  } catch {
    return null;
  }
}

/** Pick a photo from gallery. Returns base64 data URI or null. */
export async function pickPhoto(): Promise<string | null> {
  if (!isNative()) return null;

  try {
    const image = await Camera.getPhoto({
      quality: 80,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      width: 1024,
      height: 1024,
    });

    return image.dataUrl || null;
  } catch {
    return null;
  }
}
