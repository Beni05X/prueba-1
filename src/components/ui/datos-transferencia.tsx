import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { InfoRow } from './style-guide';
import { accountSectionStyles as styles } from './account-section-styles';
import type { DatosBancarios } from '@/shared/models/transferencia';
export function DatosTransferencia({ datos }: { datos: DatosBancarios }) {
  return <View style={styles.section}>
    <ThemedText type="subtitle">Transferencia bancaria</ThemedText>
    <InfoRow label="Titular" value={datos.titular} /><InfoRow label="Banco" value={datos.banco} />
    {datos.cuenta ? <InfoRow label="Cuenta" value={datos.cuenta} /> : null}
    {datos.clabe ? <InfoRow label="CLABE" value={datos.clabe} /> : null}
    {datos.celular ? <InfoRow label="Celular" value={datos.celular} /> : null}
    <ThemedText type="small" themeColor="textSecondary">Registrar tu solicitud no realiza una transferencia ni acredita el pago.</ThemedText>
  </View>;
}
