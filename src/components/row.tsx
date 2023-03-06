import {Box, Text, useInput} from 'ink';
import {Version} from '../types.js';
import {Gem} from './gem.js';

interface Props extends Version {
  active: boolean;
  onChange: (selected: string) => void;
  workspacesEnabled: boolean;
}

export function Row({
  name,
  active,
  current,
  range,
  latest,
  onChange,
  chosen,
  workspace,
  workspacesEnabled,
}: Props) {
  useInput(
    (_input, key) => {
      if (key.leftArrow) {
        let selected: string;
        if (chosen === current) {
          selected = latest || range || current;
        } else if (chosen === range) {
          selected = current;
        } else {
          selected = range || current;
        }
        onChange(selected);
      } else if (key.rightArrow) {
        let selected: string;
        if (chosen === current) {
          selected = range || latest || current;
        } else if (chosen === range) {
          selected = latest || current;
        } else {
          selected = current;
        }
        onChange(selected);
      }
    },
    {
      isActive: active,
    },
  );

  const borderColor = active ? 'cyanBright' : 'white';

  return (
    <Box flexDirection="row" alignItems="center" width="100%" marginY={0}>
      {workspacesEnabled && (
        <Box borderStyle="round" width="20%" borderColor={borderColor}>
          <Text bold={active} color="whiteBright">
            {workspace || 'root'}
          </Text>
        </Box>
      )}
      <Box
        borderStyle="round"
        width={workspacesEnabled ? '38%' : '58%'}
        borderColor={borderColor}
      >
        <Text bold={active} color="whiteBright">
          {name}
        </Text>
      </Box>
      <Box
        borderStyle="round"
        width="14%"
        paddingX={2}
        alignItems="center"
        borderColor={active && chosen === current ? 'greenBright' : borderColor}
      >
        <Gem active={chosen === current} />
        <Text bold={active} color="whiteBright">
          {' '}
          {current}
        </Text>
      </Box>
      <Box
        borderStyle="round"
        width="14%"
        paddingX={2}
        height="100%"
        borderColor={active && chosen === range ? 'greenBright' : borderColor}
        alignItems="center"
      >
        {range && (
          <>
            <Gem active={chosen === range} />
            <Text bold={active} color="whiteBright">
              {' '}
              {range}
            </Text>
          </>
        )}
      </Box>
      <Box
        borderStyle="round"
        width="14%"
        paddingX={2}
        height="100%"
        alignItems="center"
        borderColor={active && chosen === latest ? 'greenBright' : borderColor}
      >
        {latest && (
          <>
            <Gem active={chosen === latest} />
            <Text bold={active} color="whiteBright">
              {' '}
              {latest}
            </Text>
          </>
        )}
      </Box>
    </Box>
  );
}
