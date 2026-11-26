import { Inter_400Regular, Inter_500Medium, Inter_500Medium_Italic, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Roboto_500Medium } from '@expo-google-fonts/roboto';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { HomeScreen, SCREEN_H, SCREEN_W } from './src/HomeScreen';

/**
 * On Android the screen fills the device. On web it sits in an Android phone frame for the
 * showcase recording. Web query params:
 *   ?loop=1        entrance → hold → back to skeleton, forever (what gets recorded)
 *   ?bg=f4f1ec     page background behind the phone (hex, no #, or `transparent`)
 *   ?frame=0       screen only, no phone frame
 *   ?record=1      wait for window.__letaStart() (scripts/record.mjs drives a fake clock)
 */
const params = Platform.OS === 'web' ? new URLSearchParams(window.location.search) : new URLSearchParams();
const LOOP = params.get('loop') === '1';
const BG_PARAM = params.get('bg');
const BG = BG_PARAM === 'transparent' ? 'transparent' : BG_PARAM ? `#${BG_PARAM}` : '#F4F2EE';
const FRAME = params.get('frame') !== '0';
const RECORD = params.get('record') === '1';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_500Medium_Italic,
    Inter_600SemiBold,
    Roboto_500Medium,
  });
  if (!fontsLoaded) return null;

  if (Platform.OS !== 'web') {
    return (
      <View style={{ flex: 1, backgroundColor: '#192037' }}>
        <StatusBar style="light" />
        <HomeScreen />
      </View>
    );
  }

  return (
    <View style={[styles.page, { backgroundColor: BG }]} nativeID="stage">
      {FRAME ? (
        <View style={styles.phone} nativeID="phone">
          <View style={[styles.sideButton, { top: 150, height: 56 }]} />
          <View style={[styles.sideButton, { top: 230, height: 108 }]} />
          <View style={styles.screen}>
            <HomeScreen loop={LOOP} record={RECORD} />
            <View style={styles.camera} pointerEvents="none" />
          </View>
        </View>
      ) : (
        <View nativeID="phone">
          <HomeScreen loop={LOOP} record={RECORD} />
        </View>
      )}
    </View>
  );
}

const BEZEL = 10;
const styles = StyleSheet.create({
  page: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '100%' as unknown as number },
  phone: {
    padding: BEZEL,
    borderRadius: 46,
    backgroundColor: '#0E0F12',
    borderWidth: 2,
    borderColor: '#3A3D44',
    boxShadow: '0px 30px 60px -20px rgba(16,24,40,0.35), 0px 12px 24px -12px rgba(16,24,40,0.25)',
  },
  screen: { width: SCREEN_W, height: SCREEN_H, borderRadius: 36, overflow: 'hidden' },
  camera: {
    position: 'absolute',
    top: 12,
    left: SCREEN_W / 2 - 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#05060A',
    borderWidth: 3,
    borderColor: '#14161C',
  },
  sideButton: {
    position: 'absolute',
    right: -5,
    width: 4,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: '#2A2C31',
  },
});
