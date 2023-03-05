import {Box, Text} from 'ink';

interface Props {
  workspacesEnabled: boolean;
}

export function Header({workspacesEnabled}: Props) {
  return (
    <Box flexDirection="row" alignItems="center" width="100%">
      {workspacesEnabled && (
        <Box borderStyle="round" width="20%">
          <Text>Workspace</Text>
        </Box>
      )}
      <Box borderStyle="round" width={workspacesEnabled ? '38%' : '58%'}>
        <Text>Package name</Text>
      </Box>
      <Box borderStyle="round" width="14%" paddingX={2}>
        <Text>Current</Text>
      </Box>
      <Box borderStyle="round" width="14%" paddingX={2}>
        <Text>Range</Text>
      </Box>

      <Box borderStyle="round" width="14%" paddingX={2}>
        <Text>Latest</Text>
      </Box>
    </Box>
  );
}
