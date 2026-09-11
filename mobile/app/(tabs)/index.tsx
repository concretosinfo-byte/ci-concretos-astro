import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, Footnote, Screen, Section } from '../../components/ui';
import { company, faqs, highlights, services, stats } from '../../constants/company';
import { media, serviceImages } from '../../constants/media';
import { colors, radius, shadows, spacing, typography } from '../../constants/theme';
import { callCompany, openWebsite, openWhatsApp } from '../../lib/contact';

export default function HomeScreen() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<string | null>(faqs[0].question);

  return (
    <Screen>
      <ImageBackground source={media.hero} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.heroOverlay}>
          <View style={styles.heroBody}>
          <View style={styles.logoPlate}>
            <Image source={media.logo} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.heroKicker}>{company.coverage} · Colombia</Text>
          <Text style={styles.heroTitle}>Concreto premezclado con cumplimiento en obra</Text>
          <Text style={styles.heroText}>
            Suministro estructural programado, obras civiles y estructuras metálicas para proyectos
            residenciales, comerciales, industriales e institucionales.
          </Text>
          <View style={styles.heroActions}>
            <Button
              label="Solicitar cotización"
              icon="document-text"
              onPress={() => router.push('/cotizar')}
            />
            <Button
              label="WhatsApp directo"
              icon="logo-whatsapp"
              variant="whatsapp"
              onPress={() =>
                openWhatsApp('Hola, quiero cotizar concreto premezclado para mi proyecto.')
              }
            />
              <Button label="Llamar ahora" icon="call" variant="outline" onPress={callCompany} />
            </View>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.statsBand}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.stat}>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Section
        kicker="Servicios"
        title="Soluciones integrales para su proyecto"
        subtitle="Un solo aliado para suministro, ejecución civil y soluciones metálicas, con respaldo técnico permanente."
      >
        {services.map((service) => (
          <Card
            key={service.slug}
            image={serviceImages[service.slug]}
            onPress={() => router.push(`/servicios?servicio=${service.slug}`)}
          >
            <Badge>{service.title}</Badge>
            <Text style={styles.cardTitle}>{service.title}</Text>
            <Text style={styles.cardText}>{service.summary}</Text>
            <View style={styles.cardLink}>
              <Text style={styles.cardLinkText}>Ver detalle</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.brand} />
            </View>
          </Card>
        ))}
      </Section>

      <Section
        kicker="Por qué elegirnos"
        title="Respaldo técnico en cada fase"
        subtitle="Planificación anticipada, supervisión en obra y control logístico para proteger el cronograma contractual."
      >
        <View style={styles.highlightGrid}>
          {highlights.map((item) => (
            <View key={item.title} style={styles.highlight}>
              <View style={styles.highlightIcon}>
                <Ionicons name={item.icon} size={20} color={colors.brand} />
              </View>
              <Text style={styles.highlightTitle}>{item.title}</Text>
              <Text style={styles.highlightText}>{item.text}</Text>
            </View>
          ))}
        </View>
      </Section>

      <View style={styles.ctaBand}>
        <Text style={styles.ctaKicker}>Contratos de alto volumen</Text>
        <Text style={styles.ctaTitle}>Programe su suministro con anticipación</Text>
        <Text style={styles.ctaText}>
          Experiencia en contratos anuales y suministros periódicos para constructoras,
          desarrolladores inmobiliarios y empresas industriales.
        </Text>
        <Button
          label="Hablar con un asesor"
          icon="logo-whatsapp"
          variant="whatsapp"
          onPress={() => openWhatsApp('Hola, quiero programar un contrato de suministro.')}
        />
      </View>

      <Section kicker="Preguntas frecuentes" title="Resolvemos sus dudas">
        {faqs.map((faq) => {
          const expanded = openFaq === faq.question;
          return (
            <Pressable
              key={faq.question}
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => setOpenFaq(expanded ? null : faq.question)}
              style={styles.faq}
            >
              <View style={styles.faqHead}>
                <Text style={styles.faqQuestion}>{faq.question}</Text>
                <Ionicons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.textMuted}
                />
              </View>
              {expanded ? <Text style={styles.faqAnswer}>{faq.answer}</Text> : null}
            </Pressable>
          );
        })}
      </Section>

      <View style={styles.footer}>
        <Text style={styles.footerTitle}>{company.name}</Text>
        <Text style={styles.footerText}>{company.tagline}</Text>
        <Text style={styles.footerText}>{company.location}</Text>
        <Text style={styles.footerText}>{company.hours}</Text>
        <Button label="Visitar sitio web" icon="globe-outline" variant="ghost" onPress={openWebsite} />
      </View>
      <Footnote>{`© ${new Date().getFullYear()} ${company.name}. Todos los derechos reservados.`}</Footnote>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.navy,
    justifyContent: 'flex-end',
    minHeight: 470,
    overflow: 'hidden',
  },
  heroImage: {
    opacity: 0.95,
  },
  heroOverlay: {
    backgroundColor: colors.overlay,
    flex: 1,
    justifyContent: 'flex-end',
  },
  heroBody: {
    gap: spacing.sm,
    padding: spacing.lg,
  },
  logoPlate: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    ...shadows.raised,
  },
  logo: {
    height: 46,
    width: 150,
  },
  heroKicker: {
    ...typography.kicker,
    color: colors.primary,
  },
  heroTitle: {
    ...typography.display,
    color: colors.textOnDark,
  },
  heroText: {
    ...typography.body,
    color: colors.textOnDarkMuted,
    paddingBottom: spacing.sm,
  },
  heroActions: {
    gap: spacing.sm,
  },
  statsBand: {
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  stat: {
    borderLeftColor: colors.primary,
    borderLeftWidth: 3,
    flexBasis: '50%',
    gap: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statValue: {
    color: colors.navy,
    fontSize: 26,
    fontWeight: '800',
  },
  statLabel: {
    ...typography.small,
    color: colors.textMuted,
  },
  cardTitle: {
    ...typography.cardTitle,
    color: colors.text,
  },
  cardText: {
    ...typography.small,
    color: colors.textMuted,
  },
  cardLink: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  cardLinkText: {
    color: colors.brand,
    fontSize: 14,
    fontWeight: '700',
  },
  highlightGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  highlight: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    gap: spacing.xs,
    padding: spacing.md,
  },
  highlightIcon: {
    alignItems: 'center',
    backgroundColor: colors.brandSoft,
    borderRadius: radius.pill,
    height: 38,
    justifyContent: 'center',
    marginBottom: spacing.xs,
    width: 38,
  },
  highlightTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  highlightText: {
    ...typography.small,
    color: colors.textMuted,
  },
  ctaBand: {
    backgroundColor: colors.navy,
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  ctaKicker: {
    ...typography.kicker,
    color: colors.primary,
  },
  ctaTitle: {
    ...typography.title,
    color: colors.textOnDark,
  },
  ctaText: {
    ...typography.small,
    color: colors.textOnDarkMuted,
    paddingBottom: spacing.sm,
  },
  faq: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.md,
  },
  faqHead: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  faqQuestion: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  faqAnswer: {
    ...typography.small,
    color: colors.textMuted,
  },
  footer: {
    backgroundColor: colors.surfaceAlt,
    gap: spacing.xs,
    marginTop: spacing.md,
    padding: spacing.lg,
  },
  footerTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  footerText: {
    ...typography.small,
    color: colors.textMuted,
  },
});
