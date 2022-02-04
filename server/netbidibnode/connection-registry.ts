const connections = new Map();

interface SerialInterfaceDescriptor {
  uid: number[];
  prod: string;
  user: string;
  pVersion: number[];
  swVersion: number[];
}
export const serialInterfaceDescriptor = new Map();

serialInterfaceDescriptor.set('prod', 'BiDiB IF2');
serialInterfaceDescriptor.set('user', 'Developer');

export function setDescriptorValue(
  key: keyof SerialInterfaceDescriptor,
  value: SerialInterfaceDescriptor[typeof key]
) {
  serialInterfaceDescriptor.set(key, value);
}

export function getDescriptorValue(key: keyof SerialInterfaceDescriptor) {
  return serialInterfaceDescriptor.get(key);
}
