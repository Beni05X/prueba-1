import { useState } from 'react';
import { imageUri } from './media-state';
import type { JsonValue } from '../models/json-value';
// The reusable view keys this hook's component by URI. Changing the source
// remounts it, including A → B → A, and drops errors from previous requests.
export function useMediaViewModel(source?: JsonValue) {
  const [failed, setFailed] = useState(false);
  const uri = imageUri(source);
  return { uri, showImage: !!uri && !failed, onError: () => setFailed(true) };
}
