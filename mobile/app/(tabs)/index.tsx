import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button, Card, Section } from '../../components/ui';
import { company, faqs, services, stats } from '../../constants/company';
import { colors, radius, spacing } from '../../constants/theme';
import { callCompany, openWhatsApp } from '../../lib/contact';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>{company.coverage.toUpperCase()}</Text>
        <Text style={styles.heroTitle}>Concreto premezclado con cumplimiento en obra</Text>
        <Text style={styles.heroText}>
          Suministro estructural programado, obras civiles y estructuras metálicas para proyectos
          residenciales, comerciales, industriales e institucionales.
        </Text>
        <View style={styles.heroActions}>
          <Button
            label="Cotizar por WhatsApp"
            icon="logo-whatsapp"
            onPress={() =>
              openWhatsApp('Hola, quiero cotizar concreto premezclado para mi proyecto.')
            }
          />
          <Button label="Llamar ahora" icon="call" variant="outline" onPress={callCompany} />
        </View>
      </View>

      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Section
        title="Servicios integrales"
        subtitle="Un solo aliado para suministro, ejecución civil y soluciones metálicas."
      >
        {services.map((service) => (
          <Card
            key={service.slug}
            onPress={() => router.push(`/servicios?servicio=${service.slug}`)}
          >
            <Text style={styles.cardTitle}>{service.title}</Text>
            <Text style={styles.cardText}>{service.summary}</Text>
          </Card>
        ))}
      </Section>

      <Section
        title="Control técnico en cada despacho"
        subtitle="Programamos volumen, accesibilidad de obra, capacidad de bombeo y cronograma estructural para reducir tiempos muertos y proteger la estabilidad del proyecto."
      >
        <Card>
          <Text style={styles.cardTitle}>Suministro programado</Text>
          <Text style={styles.cardText}>
            Entregas parciales, volúmenes escalonados y ajustes técnicos según avance de obra, con
            coordinación directa con residentes e ingenieros.
          </Text>
        </Card>
      </Section>

      <Section title="Preguntas frecuentes">
        {faqs.map((faq) => (
          <Card key={faq.question}>
            <Text style={styles.cardTitle}>{faq.question}</Text>
            <Text style={styles.cardText}>{faq.answer}</Text>
          </Card>
        ))}
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: colors.background,
    paddingBottom: spacing.xl,
  },
  hero: {
    backgroundColor: colors.surface,
    gap: spacing.md,
    padding: spacing.lg,
  },
  heroKicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  heroText: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  heroActions: {
    gap: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.md,
  },
  stat: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    flexBasis: '47%',
    flexGrow: 1,
    padding: spacing.md,
  },
  statValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 13,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '700',
  },
  cardText: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
});
