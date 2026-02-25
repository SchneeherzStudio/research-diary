import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const Skeleton = ({ width, height, style }: any) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [opacity]);

  return <Animated.View style={[{ width, height, opacity, backgroundColor: '#E1E9EE', borderRadius: 8 }, style]} />;
};

const ScalableImage = ({ uri }: { uri: string }) => {
  const [ratio, setRatio] = useState(16 / 9);

  return (
    <Image
      source={{ uri }}
      style={[styles.inlineImage, { aspectRatio: ratio }]}
      onLoad={(e) => {
        const { width, height } = e.nativeEvent.source;
        if (width && height) {
          setRatio(width / height);
        }
      }}
    />
  );
};

const quotes: string[] = [  
    "Whoa, Zeitreisender! 🕰️ Hier war damals noch Baustelle.",
    "Du bist zu früh dran – selbst die Vergangenheit war noch nicht so weit.",
    "404: Inhalt noch nicht erfunden.",
    "Bitte Geduld – wir müssen erst noch eine Zeitmaschine bauen.",
    "Damals war hier nur heiße Luft und gute Vorsätze.",
    "Netter Versuch! Aber selbst Marty McFly hätte hier nichts gefunden.",
    "Zurück in die Zukunft? Eher zurück ins Nichts.",
    "Dieser Tag hatte noch nichts zu erzählen.",
    "Du bist vor dem Anfang gelandet. Respekt!",
    "Hier gibt’s noch keinen Content – wir warten noch auf die Erfindung der Zeit."
];

export default function Forschungstagebuch() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 3)); 
  const today = new Date();
  const nextDate = new Date(currentDate);
  nextDate.setDate(currentDate.getDate() + 7);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}-${date.getFullYear()}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const dateStr = formatDate(currentDate);
      const url = `https://schneeherzstudio.github.io/research-diary/pages/${dateStr}.json?t=${new Date().getTime()}`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error();
        const json = await response.json();
        setData(json);
      } catch {
        setData({ name: dateStr, content: currentDate < new Date(2026, 1, 3) ? quotes[Math.floor(Math.random() * quotes.length)] : "Kein Internet oder kein Eintrag gefunden." });
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };
    fetchData();
  }, [currentDate]);

  const renderContent = (content: string) => {
    const dateStr = formatDate(currentDate);
    const parts = content.split(/(\$img\d+\$)/g);

    return parts.map((part, index) => {
        if (part.startsWith('$img')) {
        const imgKey = part.replace(/\$/g, '');
        const imageUrl = `https://schneeherzstudio.github.io/research-diary/pictures/${dateStr}/${imgKey}.png?t=${new Date().getTime()}`;
        
        return <ScalableImage key={index} uri={imageUrl} />;
        }
        return <Text key={index} style={styles.bodyText}>{part}</Text>;
    });
  };

  const isFuture = nextDate > today;
  const isPast = currentDate <= new Date(2026, 1, 3);

  return (
    <SafeAreaProvider>
        <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
            {loading ? (
            <View>
                <Skeleton width="60%" height={35} style={{ marginBottom: 10 }} />
                <Skeleton width="40%" height={20} style={{ marginBottom: 30 }} />
                <Skeleton width="100%" height={20} style={{ marginBottom: 10 }} />
                <Skeleton width="100%" height={20} style={{ marginBottom: 10 }} />
                <Skeleton width="90%" height={20} style={{ marginBottom: 20 }} />
                <Skeleton width="100%" height={200} style={{ marginBottom: 20 }} />
                <Skeleton width="100%" height={20} style={{ marginBottom: 10 }} />
            </View>
            ) : (
            <View>
                <Text style={styles.title}>{data?.name}</Text>
                <Text style={styles.description}>{data?.description}</Text>
                <View style={styles.contentWrapper}>
                {data?.content ? renderContent(data.content) : null}
                </View>
            </View>
            )}
        </ScrollView>

        <View style={styles.bottomNav}>
            <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}>
            <Text style={[styles.navArrow, { color: isPast ? '#616161' : '#ffffff' }]}>{"<<"}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.dateDisplay}>
            <Text style={styles.dateDisplayText}>{formatDate(currentDate)} 📅</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}>
            <Text style={[styles.navArrow, { color: isFuture ? '#616161' : '#ffffff' }]}>{">>"}</Text>
            </TouchableOpacity>
        </View>

        {showPicker && (
            <DateTimePicker
            value={currentDate}
            mode="date"
            onChange={(e, d) => { setShowPicker(false); if(d) setCurrentDate(d); }}
            />
        )}
        </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#313131' },
  scrollContainer: { flex: 1 },
  scrollContent: { padding: 25, paddingBottom: 120 },
  title: { fontSize: 32, fontWeight: '800', color: '#fbfbff', marginBottom: 5 },
  description: { fontSize: 16, color: '#b8b8b8', marginBottom: 25 },
  contentWrapper: { marginTop: 10 },
  bodyText: { fontSize: 18, lineHeight: 28, color: '#ffffff' },
  inlineImage: { width: '100%', marginVertical: 20, borderRadius: 15, backgroundColor: '#616161' },
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 90,
    backgroundColor: 'rgba(20, 20, 20, 0.95)', flexDirection: 'row',
    alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 30, paddingTop: 10,
    borderTopWidth: 0.5, borderTopColor: '#d1d1d6',
  },
  navArrow: { fontSize: 26, fontWeight: 'bold'},
  dateDisplay: { backgroundColor: '#333333', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25 },
  dateDisplayText: { fontSize: 16, fontWeight: '700', color: '#ffffff' }
});