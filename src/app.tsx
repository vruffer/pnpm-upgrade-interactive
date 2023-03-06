import {useEffect, useMemo, useState} from 'react';
import {Box, useApp, useInput} from 'ink';
import {Row} from './components/row.js';
import {Version} from './types.js';
import {Header} from './components/header.js';
import {dependencies} from './lib/dependencyParsing.js';

export function App() {
  const {exit} = useApp();

  const [selectedRow, setSelectedRow] = useState(0);
  const [data, setData] = useState<Version[]>([]);
  const workspaces = useMemo(
    () => data.some(value => Boolean(value.workspace)),
    [data],
  );

  useEffect(() => {
    dependencies()
      .then(result => {
        setData(
          result
            .map(value => ({...value, chosen: value.current}))
            .sort((a, b) => {
              const aLength = a.workspace?.length || 0;
              const bLength = b.workspace?.length || 0;
              return aLength - bLength;
            }),
        );
      })
      .catch(err => {
        exit();
        console.error('Could not fetch dependencies', err);
      });
  }, [exit]);

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
