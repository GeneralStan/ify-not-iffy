/**
 * LETA Express home ("Home/Operating hours", Figma 5233:78553), 360 x 800 dp.
 * Positions and sizes are the Figma frame's; see useEntrance.ts for the motion.
 */
import { Image, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, type SharedValue } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import {
  BatteryIcon,
  DashedConnector,
  DiscountIcon,
  HomeIcon,
  LetaLogo,
  MoonIcon,
  OrdersIcon,
  PersonIcon,
  ReceiptIcon,
  SignalIcon,
  TripOriginIcon,
  WifiIcon,
} from './icons';
import { BANNER_SHIFT, useEntrance, type Entrance } from './useEntrance';

export const SCREEN_W = 360;
export const SCREEN_H = 800;

const C = {
  navy: '#192037',
  page: '#EFEFEF',
  surface: '#FEFEFE',
  ink: '#101010',
  muted: '#808080',
  tabIdle: '#4F4F4F',
  red: '#FF3941',
  blue: '#5053E9',
  green: '#50A20F',
  moon: '#F9B330',
  onNavy: '#FAFAFA',
  line: 'rgba(227,227,227,0.8)',
  border: '#E3E3E3',
  discountBg: '#E7F2DE',
  skeleton: '#EFEFEF',
  skeletonOnNavy: 'rgba(255,255,255,0.10)',
};

const F = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  mediumItalic: 'Inter_500Medium_Italic',
  roboto: 'Roboto_500Medium',
};

/** Figma's three-layer card shadow. */
const CARD_SHADOW =
  '0px 4px 10px -4px rgba(0,0,0,0.10), 1px 0px 8px -8px rgba(0,0,0,0.10), 0px -1px 8px -8px rgba(37,37,37,0.04)';

const IMG = {
  rider: require('../assets/img/rider.png'),
  wave: require('../assets/img/wave.png'),
  parcel: require('../assets/img/parcel.png'),
  food: require('../assets/img/food.png'),
  documents: require('../assets/img/documents.png'),
  bag: require('../assets/img/bag.png'),
};

/** Illustration boxes inside each 160 x 72 card (Figma absolute bounds; rotation baked into the PNG). */
const CATEGORIES: { label: string; img: ImageSourcePropType; x: number; y: number; size: number }[] = [
  { label: 'Parcel', img: IMG.parcel, x: 101.4, y: 12.8, size: 72 },
  { label: 'Food & Drinks', img: IMG.food, x: 82, y: 3, size: 100 },
  { label: 'Documents', img: IMG.documents, x: 84, y: 4, size: 106.44 },
  { label: 'Other', img: IMG.bag, x: 88.52, y: 7.92, size: 91.96 },
];

export function HomeScreen({ loop = false, record = false }: { loop?: boolean; record?: boolean }) {
  const a = useEntrance({ loop, record });

  const contentStyle = useAnimatedStyle(() => ({ opacity: a.content.value }));
  const skeletonStyle = useAnimatedStyle(() => ({ opacity: a.skeleton.value }));

  const riderStyle = useAnimatedStyle(() => ({
    opacity: a.riderOpacity.value,
    transform: [{ translateY: a.riderY.value }, { scale: a.riderScale.value }],
  }));
  const waveStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${a.wave.value}deg` }] }));
  // Banner and body share one progress so the layout change stays locked together.
  const bannerStyle = useAnimatedStyle(() => ({
    // Fades in over its first few pixels so its shadow doesn't peek out from under the card.
    opacity: interpolate(a.banner.value, [0, 0.25], [0, 1], 'clamp'),
    transform: [{ translateY: -BANNER_SHIFT * (1 - a.banner.value) }],
  }));
  const bodyStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: BANNER_SHIFT * a.banner.value }],
  }));
  const moonStyle = useAnimatedStyle(() => ({ transform: [{ scale: a.moon.value }] }));
  const discountIconStyle = useAnimatedStyle(() => ({ transform: [{ scale: a.discount.value }] }));

  return (
    <View style={s.screen}>
      {/* Navy header: status bar, logo, greeting, rider */}
      <View style={s.top}>
        <StatusBar />
        <Pressable onPress={a.replay} style={s.logoRow} hitSlop={8} accessibilityLabel="Replay animation">
          <LetaLogo height={16} />
          <Text style={s.express}>Express</Text>
        </Pressable>

        <Animated.View style={[s.greetingBlock, contentStyle]}>
          <View style={s.greetingRow}>
            <Text style={s.greeting}>Hi Mama Mboga</Text>
            <Animated.Image source={IMG.wave} style={[s.wave, waveStyle]} />
          </View>
          <Text style={s.headline}>Get your items delivered{'\n'}in minutes</Text>
        </Animated.View>

        <Animated.View style={[s.greetingBlock, skeletonStyle]} pointerEvents="none">
          <Shimmer shimmer={a.shimmer} w={110} h={14} r={7} onNavy style={{ marginTop: 3 }} />
          <Shimmer shimmer={a.shimmer} w={220} h={18} r={6} onNavy style={{ marginTop: 19 }} />
          <Shimmer shimmer={a.shimmer} w={112} h={18} r={6} onNavy style={{ marginTop: 6 }} />
        </Animated.View>

        <Animated.View style={[s.rider, riderStyle]}>
          <Image source={IMG.rider} style={s.riderImg} />
        </Animated.View>
      </View>

      {/* Body: discount, categories, recent deliveries */}
      <Animated.View style={[s.body, bodyStyle]}>
        <View style={s.bodyTop}>
          <View style={s.discountSlot}>
            <Animated.View style={[s.discount, contentStyle]}>
              <Animated.View style={discountIconStyle}>
                <DiscountIcon size={18} color={C.green} />
              </Animated.View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.discountTitle}>Delivery discount</Text>
                <Text style={s.discountText}>
                  Send your items for <Text style={{ fontFamily: F.semibold }}>Kes 1</Text> only. Limited offer.
                </Text>
              </View>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, skeletonStyle]} pointerEvents="none">
              <Shimmer shimmer={a.shimmer} w={328} h={64} r={8} />
            </Animated.View>
          </View>

          <View>
            <View style={s.sectionHeading}>
              <Animated.Text style={[s.sectionTitle, contentStyle]}>What are you sending?</Animated.Text>
              <Animated.View style={[StyleSheet.absoluteFill, s.headingSkeleton, skeletonStyle]} pointerEvents="none">
                <Shimmer shimmer={a.shimmer} w={168} h={14} r={7} />
              </Animated.View>
            </View>
            <View style={s.grid}>
              {CATEGORIES.map((c, i) => (
                <View key={c.label} style={s.cardSlot}>
                  <CategoryCard index={i} a={a} contentStyle={contentStyle} {...c} />
                  <Animated.View style={[StyleSheet.absoluteFill, skeletonStyle]} pointerEvents="none">
                    <Shimmer shimmer={a.shimmer} w={160} h={72} r={8} />
                  </Animated.View>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={s.bodyBottom}>
          <View style={[s.sectionHeading, s.recentHeading]}>
            <Animated.Text style={[s.sectionTitle, contentStyle]}>Recent Deliveries</Animated.Text>
            <Animated.View style={[s.viewAll, contentStyle]}>
              <Text style={s.viewAllText}>View all</Text>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, s.recentHeading, skeletonStyle]} pointerEvents="none">
              <Shimmer shimmer={a.shimmer} w={140} h={14} r={7} />
              <Shimmer shimmer={a.shimmer} w={68} h={32} r={16} />
            </Animated.View>
          </View>
          <View style={s.deliveryCard}>
            <Animated.View style={[s.deliveryRow, contentStyle]}>
              <ReceiptIcon size={20} color="#2F2F2F" />
              <View style={{ gap: 4 }}>
                <Text style={s.deliveryTitle}>Exeter Height Apartments</Text>
                <Text style={s.deliverySub}>11 Nov 2026, 6:00 AM · Kes 200</Text>
              </View>
            </Animated.View>
            <Animated.View style={[s.badge, contentStyle]}>
              <Text style={s.badgeText}>Awaiting Pickup</Text>
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, skeletonStyle]} pointerEvents="none">
              <Shimmer shimmer={a.shimmer} w={20} h={20} r={6} style={{ position: 'absolute', left: 14.5, top: 26.5 }} />
              <Shimmer shimmer={a.shimmer} w={170} h={12} r={6} style={{ position: 'absolute', left: 42.5, top: 18.5 }} />
              <Shimmer shimmer={a.shimmer} w={130} h={12} r={6} style={{ position: 'absolute', left: 42.5, top: 42.5 }} />
              <Shimmer shimmer={a.shimmer} w={80} h={16} r={8} style={{ position: 'absolute', left: 230.5, top: 10.5 }} />
            </Animated.View>
          </View>
        </View>
      </Animated.View>

      {/* Navy status banner, tucked under the address card */}
      <Animated.View style={[s.banner, bannerStyle]}>
        <Animated.View style={moonStyle}>
          <MoonIcon size={16} color={C.moon} />
        </Animated.View>
        <Text style={s.bannerText} numberOfLines={1}>Riders are available 8:00 AM to 10:00 PM</Text>
      </Animated.View>

      {/* Address card, above the rider and the banner */}
      <View style={s.addressCard}>
        <View style={s.connector}>
          <Animated.View style={contentStyle}>
            <TripOriginIcon size={18} color={C.blue} />
          </Animated.View>
          <Animated.View style={contentStyle}>
            <DashedConnector height={25} />
          </Animated.View>
          <Animated.View style={contentStyle}>
            <TripOriginIcon size={18} color={C.red} />
          </Animated.View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={s.field}>
            <Animated.Text style={[s.fieldText, contentStyle]}>Mbuzi Hut</Animated.Text>
          </View>
          <View style={s.demarcator} />
          <View style={s.field}>
            <Animated.Text style={[s.fieldText, { color: C.muted }, contentStyle]}>Where to deliver?</Animated.Text>
          </View>
        </View>
        <Animated.View style={[StyleSheet.absoluteFill, skeletonStyle]} pointerEvents="none">
          <Shimmer shimmer={a.shimmer} w={14} h={14} r={7} style={{ position: 'absolute', left: 9, top: 12 }} />
          <Shimmer shimmer={a.shimmer} w={14} h={14} r={7} style={{ position: 'absolute', left: 9, top: 55 }} />
          <Shimmer shimmer={a.shimmer} w={96} h={12} r={6} style={{ position: 'absolute', left: 38, top: 14 }} />
          <Shimmer shimmer={a.shimmer} w={140} h={12} r={6} style={{ position: 'absolute', left: 38, top: 55 }} />
        </Animated.View>
      </View>

      <TabBar />
    </View>
  );
}

function CategoryCard({
  index,
  a,
  contentStyle,
  label,
  img,
  x,
  y,
  size,
}: {
  index: number;
  a: Entrance;
  contentStyle: ReturnType<typeof useAnimatedStyle>;
  label: string;
  img: ImageSourcePropType;
  x: number;
  y: number;
  size: number;
}) {
  const p = a.ill[index];
  const press = a.press[index];

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(press.value, [0, 1], [1, 0.97]) }],
  }));
  // Label scales in from its top-left corner on the same progress as the illustration.
  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0, 0.6], [0, 1], 'clamp'),
    transform: [{ scale: interpolate(p.value, [0, 1], [0.8, 1]) }],
  }));
  const illStyle = useAnimatedStyle(() => ({
    // Short fade so the illustration is not parked in its start pose before its turn.
    opacity: interpolate(p.value, [0, 0.35], [0, 1], 'clamp'),
    transform: [
      { translateX: interpolate(p.value, [0, 1], [24, 0]) - 3 * press.value },
      { translateY: interpolate(p.value, [0, 1], [24, 0]) - 3 * press.value },
      { rotate: `${interpolate(p.value, [0, 1], [14, 0]) - 3 * press.value}deg` },
      { scale: interpolate(p.value, [0, 1], [0.85, 1]) },
    ],
  }));

  return (
    <Pressable onPressIn={() => a.pressIn(index)} onPressOut={() => a.pressOut(index)}>
      <Animated.View style={[s.card, cardStyle, contentStyle]}>
        <Animated.Text style={[s.cardLabel, { transformOrigin: 'top left' }, labelStyle]}>{label}</Animated.Text>
        <Animated.Image
          source={img}
          style={[{ position: 'absolute', left: x, top: y, width: size, height: size }, illStyle]}
        />
      </Animated.View>
    </Pressable>
  );
}

/** Skeleton block with a linear highlight sweep. */
function Shimmer({
  shimmer,
  w,
  h,
  r,
  onNavy = false,
  style,
}: {
  shimmer: SharedValue<number>;
  w: number;
  h: number;
  r: number;
  onNavy?: boolean;
  style?: object;
}) {
  const band = Math.max(80, w * 0.6);
  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-band, w]) }],
  }));
  const hi = onNavy ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.75)';
  const id = onNavy ? 'shimmerNavy' : 'shimmerLight'; // ids are page-global on web
  return (
    <View
      style={[
        { width: w, height: h, borderRadius: r, overflow: 'hidden', backgroundColor: onNavy ? C.skeletonOnNavy : C.skeleton },
        style,
      ]}
    >
      <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, width: band }, sweep]}>
        <Svg width={band} height={h}>
          <Defs>
            <LinearGradient id={id} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={hi} stopOpacity={0} />
              <Stop offset="0.5" stopColor={hi} stopOpacity={1} />
              <Stop offset="1" stopColor={hi} stopOpacity={0} />
            </LinearGradient>
          </Defs>
          <Rect width={band} height={h} fill={`url(#${id})`} />
        </Svg>
      </Animated.View>
    </View>
  );
}

function StatusBar() {
  return (
    <View style={s.statusBar}>
      <Text style={s.clock}>12:30</Text>
      <View style={s.statusIcons}>
        <WifiIcon size={17} color="#FEFEFE" />
        <SignalIcon size={14} color="#FEFEFE" />
        <BatteryIcon size={17} color="#FEFEFE" />
      </View>
    </View>
  );
}

function TabBar() {
  const tabs = [
    { label: 'Home', Icon: HomeIcon, active: true },
    { label: 'Deliveries', Icon: OrdersIcon, active: false },
    { label: 'Profile', Icon: PersonIcon, active: false },
  ];
  return (
    <View style={s.tabBar}>
      <View style={s.tabRow}>
        {tabs.map(({ label, Icon, active }) => (
          <View key={label} style={s.tab}>
            <Icon size={24} color={active ? C.red : C.tabIdle} />
            <Text style={[s.tabLabel, { color: active ? C.red : C.tabIdle }]}>{label}</Text>
          </View>
        ))}
      </View>
      <View style={s.gestureBar}>
        <View style={s.handle} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { width: SCREEN_W, height: SCREEN_H, backgroundColor: C.page, overflow: 'hidden' },

  top: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: SCREEN_W,
    height: 228,
    backgroundColor: C.navy,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    zIndex: 1,
    elevation: 1,
  },
  statusBar: {
    height: 48,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clock: { fontFamily: F.roboto, fontSize: 14, lineHeight: 20, color: '#FEFEFE', letterSpacing: 0.1 },
  statusIcons: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  logoRow: { position: 'absolute', left: 16, top: 64, height: 20, flexDirection: 'row', alignItems: 'center', gap: 8 },
  express: { fontFamily: F.mediumItalic, fontSize: 18, letterSpacing: -0.27, lineHeight: 20, color: '#F1F3F9' },

  greetingBlock: { position: 'absolute', left: 16, top: 104, width: 240 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 20 },
  greeting: { fontFamily: F.regular, fontSize: 14, letterSpacing: -0.21, lineHeight: 20, color: C.onNavy },
  wave: { width: 16, height: 16, transformOrigin: '70% 70%' },
  headline: { marginTop: 16, fontFamily: F.semibold, fontSize: 20, letterSpacing: -0.3, lineHeight: 24, color: C.onNavy },

  rider: { position: 'absolute', left: 247, top: 84, width: 113, height: 220, transformOrigin: '50% 100%' },
  riderImg: { width: 113, height: 220 },

  addressCard: {
    position: 'absolute',
    left: 16,
    top: 204,
    width: 328,
    height: 81,
    flexDirection: 'row',
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: `${CARD_SHADOW}, ${CARD_SHADOW}`,
    zIndex: 10,
    elevation: 6,
  },
  connector: { width: 26, paddingTop: 10 - 1.5, paddingLeft: 6 - 1.5, alignItems: 'center' },
  field: { height: 40, paddingHorizontal: 12, justifyContent: 'center' },
  fieldText: { fontFamily: F.regular, fontSize: 14, letterSpacing: -0.21, lineHeight: 20, color: C.ink },
  demarcator: { height: 1, marginLeft: 12, backgroundColor: C.line },

  banner: {
    position: 'absolute',
    left: 16,
    top: 273,
    width: 328,
    height: 56,
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.navy,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    boxShadow: CARD_SHADOW,
    zIndex: 2,
    elevation: 2,
  },
  bannerText: { fontFamily: F.medium, fontSize: 14, letterSpacing: -0.21, lineHeight: 20, color: C.onNavy },

  body: {
    position: 'absolute',
    left: 0,
    top: 293, // default layout; the banner moves it to 337
    width: SCREEN_W,
    height: 507,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  bodyTop: {
    height: 304,
    padding: 16,
    gap: 16,
    backgroundColor: C.surface,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  discountSlot: { width: 328, height: 64 },
  discount: {
    height: 64,
    padding: 12,
    flexDirection: 'row',
    gap: 8,
    borderRadius: 8,
    backgroundColor: C.discountBg,
  },
  discountTitle: { fontFamily: F.semibold, fontSize: 14, letterSpacing: -0.21, lineHeight: 20, color: C.ink },
  discountText: { fontFamily: F.regular, fontSize: 12, letterSpacing: -0.18, lineHeight: 16, color: C.ink },

  sectionHeading: { height: 32, justifyContent: 'center' },
  headingSkeleton: { justifyContent: 'center' },
  sectionTitle: { fontFamily: F.medium, fontSize: 16, letterSpacing: -0.24, lineHeight: 24, color: C.ink },
  grid: { marginTop: 8, flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cardSlot: { width: 160, height: 72 },
  card: {
    width: 160,
    height: 72,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.surface,
    overflow: 'hidden',
  },
  cardLabel: { fontFamily: F.medium, fontSize: 12, letterSpacing: -0.18, lineHeight: 16, color: C.ink },

  bodyBottom: { padding: 16, backgroundColor: C.surface, flex: 1 },
  recentHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewAll: {
    height: 32,
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: C.page,
  },
  viewAllText: { fontFamily: F.semibold, fontSize: 12, letterSpacing: -0.18, lineHeight: 16, color: C.ink },
  deliveryCard: {
    marginTop: 16,
    height: 76,
    paddingHorizontal: 16 - 1.5,
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: C.surface,
  },
  badge: {
    position: 'absolute',
    left: 228 - 1.5,
    top: 10 - 1.5,
    width: 90,
    height: 20,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#FBD183',
    backgroundColor: '#FEF0D6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontFamily: F.semibold, fontSize: 10, letterSpacing: -0.15, lineHeight: 16, color: '#956B1D' },
  deliveryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  deliveryTitle: { fontFamily: F.semibold, fontSize: 14, letterSpacing: -0.21, lineHeight: 20, color: C.ink },
  deliverySub: { fontFamily: F.regular, fontSize: 14, letterSpacing: -0.21, lineHeight: 20, color: C.ink },

  tabBar: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: SCREEN_W,
    height: 82,
    paddingHorizontal: 16,
    backgroundColor: C.surface,
    borderTopWidth: 1.5,
    borderTopColor: C.line,
    zIndex: 20,
  },
  tabRow: { height: 58 - 1.5, flexDirection: 'row' },
  tab: { flex: 1, alignItems: 'center', paddingTop: 14 - 1.5, gap: 4 },
  tabLabel: { fontFamily: F.medium, fontSize: 12, letterSpacing: -0.18, lineHeight: 16 },
  gestureBar: { height: 24, alignItems: 'center', justifyContent: 'center' },
  handle: { width: 108, height: 4, borderRadius: 12, backgroundColor: '#2F2F2F' },
});
