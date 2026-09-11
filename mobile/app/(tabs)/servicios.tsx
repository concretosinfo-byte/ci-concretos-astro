import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bullet, Button, Card } from '../../components/ui';
import { services } from '../../constants/company';
import { colors, spacing } from '../../constants/theme';
import { openWhatsApp } from '../../lib/contact';

export default function ServicesScreen() {
  const { servicio } = useLocalSearchParams<{ servicio?: string }>();
  const ordered = servicio
    ? [...services].sort((a, b) => Number(b.slug === servicio) - Number(a.slug === servicio))
    : services;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.intro}>
        Coordinamos suministro, ejecución civil y estructuras metálicas bajo un modelo integral que
        prioriza cumplimiento y control de calidad en cada fase del proyecto.
      </Text>
      {ordered.map((service) => (
        <Card key={service.slug}>
          <Text style={styles.title}>{service.title}</Text>
          <Text style={styles.summary}>{service.summary}</Text>
          <View style={styles.bullets}>
            {service.details.map((detail) => (
              <Bullet key={detail}>{detail}</Bullet>
            ))}
          </View>
          <Button
            label={`Consultar ${service.title.toLowerCase()}`}
            icon="logo-whatsapp"
            variant="outline"
            onPress={() => openWhatsApp(`Hola, necesito información sobre ${service.title}.`)}
          />
        </Card>
      ))}
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
  title: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '700',
  },
  summary: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  bullets: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
