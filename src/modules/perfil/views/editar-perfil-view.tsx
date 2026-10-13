import { View } from 'react-native';
import { accountSectionStyles as styles } from '@/components/ui/account-section-styles';
import { Button } from '@/components/ui/button';
import { ResourceStatus } from '@/components/feedback/resource-status';
import { TextField } from '@/components/ui/text-field';
import { useEditarPerfilViewModel } from '@/modules/perfil/viewmodels/use-editar-perfil-view-model';

export function EditarPerfilView() {
  const vm = useEditarPerfilViewModel();
  const { campos, cambiarNombre, cambiarTelefono } = vm;
  return (
    <View style={styles.form}>
      <TextField label="Nombre" placeholder="Tu nombre" autoComplete="name" value={campos.nombre} onChangeText={cambiarNombre} editable={!vm.ocupado && !!vm.perfil} />
      <TextField label="Correo electrónico" keyboardType="email-address" autoComplete="email" value={campos.correo} editable={false} />
      <TextField label="Teléfono" keyboardType="phone-pad" autoComplete="tel" value={campos.telefono} onChangeText={cambiarTelefono} editable={!vm.ocupado} />
      <ResourceStatus {...vm} />
      <Button label="Guardar cambios" disabled={!vm.puedeGuardar} loading={vm.ocupado} onPress={() => { void vm.guardar(); }} />
    </View>
  );
}
