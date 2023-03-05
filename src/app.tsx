import {useMemo, useState} from 'react';
import {Box, useApp, useInput} from 'ink';
import {Row} from './components/row.js';
import {Version} from './types.js';
import {Header} from './components/header.js';

const MOCK_DATA: Array<Version> = [
  {
    name: 'navigate',
    current: '9.0.8',
    range: '4.4.0',
    latest: '9.5.0',
    chosen: '9.0.8',
    workspace: 'project-2',
  },
  {
    name: 'reboot',
    current: '7.4.4',
    range: '0.8.3',
    chosen: '7.4.4',
    workspace: 'project-2',
  },
  {
    name: 'transmit',
    current: '3.0.6',
    range: '8.7.9',
    latest: '5.9.6',
    chosen: '3.0.6',
    workspace: 'project-1',
  },
  {
    name: 'react',
    current: '3.2.1',
    range: '6.9.9',
    latest: '3.6.1',
    chosen: '3.2.1',
  },
];

export function App() {
  const {exit} = useApp();

  const [selectedRow, setSelectedRow] = useState(0);
  const [data, setData] = useState<Version[]>(
    MOCK_DATA.sort((a, b) => {
      const aLength = a.workspace?.length || 0;
      const bLength = b.workspace?.length || 0;
      return aLength - bLength;
    }),
  );
  const workspaces = useMemo(
    () => data.some(value => Boolean(value.workspace)),
    [data],
  );

  useInput((input, key) => {
    if (input === 'q') {
      exit();
    }

    if (key.upArrow) {
      setSelectedRow(prev => {
        let newRow = prev - 1;
        if (newRow < 0) {
          newRow = data.length - 1;
        }
        return newRow;
      });
    } else if (key.downArrow) {
      setSelectedRow(prev => {
        let newRow = prev + 1;
        if (newRow > data.length - 1) {
          newRow = 0;
        }
        return newRow;
      });
    } else if (key.return) {
      const packageVersions = data
        .map(value => ({
          name: value.name,
          from: value.current,
          to: value.chosen,
          workspace: value.workspace,
        }))
        .filter(value => value.from !== value.to);
      exit();
      console.log(`Going to update the following packages`);
      console.log(JSON.stringify(packageVersions, null, 4));
    }
  });

  return (
    <Box flexDirection="column">
      <Header workspacesEnabled={workspaces} />
      {data.map((item, index) => (
        <Row
          key={item.name}
          workspacesEnabled={workspaces}
          active={selectedRow === index}
          onChange={newChosen => {
            setData(prev => {
              const newData = [...prev];
              const version = newData[index];
              if (!version) {
                console.error(
                  `Couldn't update chosen status of index ${index} with name: ${item.name}`,
                );
                return newData;
              }
              version.chosen = newChosen;
              newData[index] = version;
              return newData;
            });
          }}
          {...item}
        />
      ))}
    </Box>
  );
}
