import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, PageHeader, Screen, Section } from '../../components/ui';
import { cities } from '../../constants/company';
import { media } from '../../constants/media';
import { colors, radius, spacing, typography } from '../../constants/theme';
import { openWhatsApp } from '../../lib/contact';

export default function CoverageScreen() {
  return (
    <Screen>
      <PageHeader
        image={media.contact}
        kicker="Cobertura"
        title="Operación coordinada en todo el país"
        subtitle="Capacidad logística para atender múltiples ciudades con programación estructurada."
      />

      <Section kicker="Ciudades" title="Principales ciudades atendidas">
        <View style={styles.grid}>
          {cities.map((city) => (
            <View key={city} style={styles.city}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.cityName}>{city}</Text>
            </View>
          ))}
        </View>

        <Card>
          <Text style={styles.title}>¿Su obra está en otra ciudad?</Text>
          <Text style={styles.text}>
            Evaluamos accesos, distancia de planta y programación para confirmar cobertura y tiempos
            de despacho en cualquier municipio del país.
          </Text>
          <Button
            label="Consultar cobertura"
            icon="logo-whatsapp"
            variant="whatsapp"
            onPress={() =>
              openWhatsApp('Hola, quiero confirmar si tienen cobertura en la ciudad de mi obra.')
            }
          />
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  city: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '47%',
    flexDirection: 'row',
    flexGrow: 1,
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  cityName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
  },
  text: {
    ...typography.small,
    color: colors.textMuted,
  },
});
