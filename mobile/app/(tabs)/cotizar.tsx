import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ChipGroup } from '../../components/ChipGroup';
import { Button } from '../../components/ui';
import { cities, company, concreteTypes, strengths } from '../../constants/company';
import { colors, radius, spacing } from '../../constants/theme';
import { emailCompany, openWhatsApp } from '../../lib/contact';

type Field = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  multiline?: boolean;
};

export default function QuoteScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState(cities[0]);
  const [type, setType] = useState(concreteTypes[0]);
  const [strength, setStrength] = useState(strengths[0]);
  const [volume, setVolume] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  const message = useMemo(
    () =>
      [
        `Solicitud de cotización - ${company.name}`,
        `Nombre: ${name || 'No indicado'}`,
        `Teléfono: ${phone || 'No indicado'}`,
        `Ciudad / obra: ${city}`,
        `Tipo de concreto: ${type}`,
        `Resistencia: ${strength}`,
        `Volumen estimado: ${volume ? `${volume} m³` : 'No indicado'}`,
        `Fecha requerida: ${date || 'Por definir'}`,
        notes ? `Detalles: ${notes}` : null,
      ]
        .filter(Boolean)
        .join('\n'),
    [city, date, name, notes, phone, strength, type, volume],
  );

  const missing = !name.trim() || !volume.trim();

  const fields: Field[] = [
    { label: 'Nombre y empresa', value: name, onChangeText: setName, placeholder: 'Ej. Juan Pérez - Constructora Andina' },
    { label: 'Teléfono de contacto', value: phone, onChangeText: setPhone, placeholder: '300 000 0000', keyboardType: 'phone-pad' },
    { label: 'Volumen estimado (m³)', value: volume, onChangeText: setVolume, placeholder: 'Ej. 45', keyboardType: 'numeric' },
    { label: 'Fecha requerida', value: date, onChangeText: setDate, placeholder: 'Ej. 20 de octubre' },
    { label: 'Detalles del vaciado', value: notes, onChangeText: setNotes, placeholder: 'Elemento estructural, bombeo, accesos, horario…', multiline: true },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.flex}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>
          Complete los datos del proyecto y envíe la solicitud. Un asesor técnico responde con la
          programación y el valor estimado del despacho.
        </Text>

        <View style={styles.group}>
          <Text style={styles.label}>Ciudad del proyecto</Text>
          <ChipGroup options={cities} value={city} onChange={setCity} />
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>Tipo de concreto</Text>
          <ChipGroup options={concreteTypes} value={type} onChange={setType} />
        </View>

        <View style={styles.group}>
          <Text style={styles.label}>Resistencia</Text>
          <ChipGroup options={strengths} value={strength} onChange={setStrength} />
        </View>

        {fields.map((field) => (
          <View key={field.label} style={styles.group}>
            <Text style={styles.label}>{field.label}</Text>
            <TextInput
              value={field.value}
              onChangeText={field.onChangeText}
              placeholder={field.placeholder}
              placeholderTextColor={colors.textMuted}
              keyboardType={field.keyboardType ?? 'default'}
              multiline={field.multiline}
              style={[styles.input, field.multiline && styles.inputMultiline]}
            />
          </View>
        ))}

        {missing ? (
          <Text style={styles.hint}>Indique al menos su nombre y el volumen estimado.</Text>
        ) : null}

        <Button
          label="Enviar por WhatsApp"
          icon="logo-whatsapp"
          onPress={() => openWhatsApp(message)}
        />
        <Button
          label="Enviar por correo"
          icon="mail"
          variant="outline"
          onPress={() => emailCompany('Solicitud de cotización desde la app', message)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  intro: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  group: {
    gap: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    padding: spacing.md,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  hint: {
    color: colors.primary,
    fontSize: 13,
  },
});
