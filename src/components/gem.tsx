// This component is taken from https://github.com/yarnpkg/berry/blob/master/packages/yarnpkg-libui/sources/components/Gem.tsx
import {Text} from 'ink';
import {useMemo} from 'react';

interface Props {
  active: boolean;
}

export function Gem({active}: Props) {
  const text = useMemo(() => (active ? `◉` : `◯`), [active]);
  const color = useMemo(() => (active ? `green` : `yellow`), [active]);
  return <Text color={color}>{text}</Text>;
}
