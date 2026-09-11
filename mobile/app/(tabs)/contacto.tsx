import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button, Card } from '../../components/ui';
import { company } from '../../constants/company';
import { colors, spacing } from '../../constants/theme';
import { callCompany, emailCompany, openWebsite, openWhatsApp } from '../../lib/contact';

export default function ContactScreen() {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Card>
        <Text style={styles.title}>Contacto directo</Text>
        <Text style={styles.text}>{company.location}</Text>
        <Text style={styles.text}>{company.coverage}</Text>
        <Text style={styles.text}>{company.hours}</Text>
      </Card>

      <Card>
        <Text style={styles.title}>Teléfono</Text>
        <Text style={styles.highlight}>{company.phoneDisplay}</Text>
        <Button label="Llamar" icon="call" onPress={callCompany} />
        <Button
          label="Escribir por WhatsApp"
          icon="logo-whatsapp"
          variant="outline"
          onPress={() => openWhatsApp('Hola, quiero hablar con un asesor técnico.')}
        />
      </Card>

      <Card>
        <Text style={styles.title}>Correo</Text>
        <Text style={styles.highlight}>{company.email}</Text>
        <Button
          label="Enviar correo"
          icon="mail"
          variant="outline"
          onPress={() => emailCompany('Consulta desde la app CI Concretos')}
        />
      </Card>

      <Card>
        <Text style={styles.title}>Sitio web</Text>
        <Text style={styles.text}>{company.website}</Text>
        <Button label="Abrir sitio web" icon="globe" variant="outline" onPress={openWebsite} />
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
  highlight: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '700',
  },
});
