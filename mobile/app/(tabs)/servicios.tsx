import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Bullet, Button, Card, PageHeader, Screen } from '../../components/ui';
import { services } from '../../constants/company';
import { media, serviceImages } from '../../constants/media';
import { colors, spacing, typography } from '../../constants/theme';
import { openWhatsApp } from '../../lib/contact';

export default function ServicesScreen() {
  const { servicio } = useLocalSearchParams<{ servicio?: string }>();
  const ordered = servicio
    ? [...services].sort((a, b) => Number(b.slug === servicio) - Number(a.slug === servicio))
    : services;

  return (
    <Screen>
      <PageHeader
        image={media.hero}
        kicker="Servicios"
        title="Suministro, obra civil y estructuras metálicas"
        subtitle="Modelo integral que prioriza cumplimiento y control de calidad en cada fase del proyecto."
      />

      <View style={styles.list}>
        {ordered.map((service) => (
          <Card key={service.slug} image={serviceImages[service.slug]}>
            {service.slug === servicio ? <Badge tone="amber">Seleccionado</Badge> : null}
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
              variant="whatsapp"
              onPress={() => openWhatsApp(`Hola, necesito información sobre ${service.title}.`)}
            />
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md,
    padding: spacing.md,
  },
  title: {
    ...typography.cardTitle,
    color: colors.text,
    fontSize: 19,
  },
  summary: {
    ...typography.small,
    color: colors.textMuted,
  },
  bullets: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
});
