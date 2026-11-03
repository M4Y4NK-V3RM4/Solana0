import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export interface PickedImage {
  uri: string;
  base64: string;
  mediaType: 'image/jpeg';
}

/** Shrink to at most 1600px on the long side and re-encode as JPEG to keep uploads small. */
async function prepare(asset: ImagePicker.ImagePickerAsset): Promise<PickedImage> {
  const ctx = ImageManipulator.manipulate(asset.uri);
  if (Math.max(asset.width, asset.height) > 1600) {
    ctx.resize(asset.width >= asset.height ? { width: 1600 } : { height: 1600 });
  }
  const rendered = await ctx.renderAsync();
  const out = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.8, base64: true });
  return { uri: out.uri, base64: out.base64 ?? '', mediaType: 'image/jpeg' };
}

/** Opens the camera or the gallery. Returns null if the user cancels. Throws with a readable message on failure. */
export async function pickImage(fromCamera: boolean): Promise<PickedImage | null> {
  if (fromCamera && Platform.OS !== 'web') {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) throw new Error('Camera permission is needed to take a photo.');
  }
  const opts: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 1 };
  const res = fromCamera ? await ImagePicker.launchCameraAsync(opts) : await ImagePicker.launchImageLibraryAsync(opts);
  if (res.canceled || !res.assets[0]) return null;
  return prepare(res.assets[0]);
}
