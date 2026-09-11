import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card } from '../../components/ui';
import { cities } from '../../constants/company';
import { colors, radius, spacing } from '../../constants/theme';
import { openWhatsApp } from '../../lib/contact';

export default function CoverageScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Coordinación activa en las principales ciudades del país y suministro programado en otros
        municipios según requerimiento del proyecto.
      </Text>

      <View style={styles.grid}>
        {cities.map((city) => (
          <View key={city} style={styles.city}>
            <Text style={styles.cityName}>{city}</Text>
          </View>
        ))}
      </View>

      <Card>
        <Text style={styles.title}>¿Su obra está en otra ciudad?</Text>
        <Text style={styles.text}>
          Evaluamos accesos, distancia de planta y programación para confirmar cobertura y tiempos
          de despacho.
        </Text>
        <Button
          label="Consultar cobertura"
          icon="logo-whatsapp"
          variant="outline"
          onPress={() =>
            openWhatsApp('Hola, quiero confirmar si tienen cobertura en la ciudad de mi obra.')
          }
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  intro: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  city: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.md,
  },
  cityName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  text: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
