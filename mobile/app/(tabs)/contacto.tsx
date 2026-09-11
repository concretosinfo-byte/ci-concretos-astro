import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, InfoRow, PageHeader, Screen, Section } from '../../components/ui';
import { company } from '../../constants/company';
import { media } from '../../constants/media';
import { colors, spacing, typography } from '../../constants/theme';
import { callCompany, emailCompany, openWebsite, openWhatsApp } from '../../lib/contact';

export default function ContactScreen() {
  return (
    <Screen>
      <PageHeader
        image={media.contact}
        kicker="Contacto"
        title="Hablemos de su proyecto"
        subtitle="Un asesor técnico responde con programación y valor estimado del despacho."
      />

      <Section kicker="Canales directos" title="Atención comercial">
        <Card>
          <View style={styles.rows}>
            <InfoRow icon="call" label="Teléfono / WhatsApp" value={company.phoneDisplay} />
            <InfoRow icon="mail" label="Correo comercial" value={company.email} />
            <InfoRow icon="location" label="Sede principal" value={company.location} />
            <InfoRow icon="time" label="Horario de atención" value={company.hours} />
          </View>
        </Card>

        <Button
          label="Escribir por WhatsApp"
          icon="logo-whatsapp"
          variant="whatsapp"
          onPress={() => openWhatsApp('Hola, quiero hablar con un asesor técnico.')}
        />
        <Button label="Llamar ahora" icon="call" onPress={callCompany} />
        <Button
          label="Enviar correo"
          icon="mail"
          variant="outline"
          onPress={() => emailCompany('Consulta desde la app CI Concretos')}
        />
        <Button label="Abrir sitio web" icon="globe-outline" variant="outline" onPress={openWebsite} />
      </Section>

      <Section kicker="Respaldo" title="Más de 20 años en el sector">
        <Card>
          <Text style={styles.text}>
            Hemos participado en proyectos de infraestructura, edificaciones institucionales,
            desarrollos industriales y obras privadas, con acompañamiento técnico permanente y
            cobertura en todo el territorio nacional.
          </Text>
        </Card>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: spacing.md,
  },
  text: {
    ...typography.body,
    color: colors.textMuted,
  },
});
