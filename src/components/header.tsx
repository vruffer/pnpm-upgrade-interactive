import {Box, Text} from 'ink';

export function Header() {
  return (
    <Box flexDirection="row" alignItems="center" width="100%">
      <Box borderStyle="round" width="58%">
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
