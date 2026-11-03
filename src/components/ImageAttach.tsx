import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { pickImage, type PickedImage } from '@/lib/image';
import { useT } from '@/lib/i18n';
import { radius, space, useTheme } from '@/lib/theme';
import { Button, Row } from './ui';

/** Optional photo attachment: camera or gallery, with preview and remove. */
export function ImageAttach({ value, onChange, label }: { value: PickedImage | null; onChange: (img: PickedImage | null) => void; label?: string }) {
  const c = useTheme();
  const { t } = useT();
  const [error, setError] = useState<string | null>(null);

  async function pick(camera: boolean) {
    setError(null);
    try {
      const img = await pickImage(camera);
      if (img) onChange(img);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open the image.');
    }
  }

  return (
    <View style={{ gap: space.sm }}>
      {label ? <Text style={{ color: c.muted, fontSize: 13, fontWeight: '600' }}>{label}</Text> : null}
      {value ? (
        <View>
          <Image source={{ uri: value.uri }} style={{ width: '100%', height: 200, borderRadius: radius.md, backgroundColor: c.chip }} resizeMode="contain" accessibilityLabel="Attached photo" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Remove photo"
            onPress={() => onChange(null)}
            style={{ position: 'absolute', top: 8, right: 8, backgroundColor: c.card, borderRadius: 16, padding: 4 }}
          >
            <Ionicons name="close" size={20} color={c.text} />
          </Pressable>
        </View>
      ) : (
        <Row wrap gap={space.md}>
          <View style={{ flexGrow: 1, flexBasis: 140 }}>
            <Button label={t('takePhoto')} icon="camera-outline" variant="secondary" onPress={() => pick(true)} />
          </View>
          <View style={{ flexGrow: 1, flexBasis: 140 }}>
            <Button label={t('choosePhoto')} icon="images-outline" variant="secondary" onPress={() => pick(false)} />
          </View>
        </Row>
      )}
      {error ? <Text style={{ color: c.danger, fontSize: 13 }}>{error}</Text> : null}
    </View>
  );
}
