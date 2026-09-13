import { useEffect } from 'react';

import { setupInterfaceController } from '../../../scripts/audio/interfaceController';

export default function InterfaceController() {
  useEffect(setupInterfaceController, []);
  return null;
}
