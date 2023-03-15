import {useEffect, useMemo, useState} from 'react';
import {Box, useApp, useInput} from 'ink';
import {Row} from './components/row.js';
import {PackageToUpdate, Version} from './lib/types.js';
import {Header} from './components/header.js';
import {listOutdatedDependencies} from './lib/listOutdatedDependencies/index.js';
import {LoadingText} from './components/loadingText.js';
import {installUpdates} from './lib/updatePackages.js';

export function App() {
  const {exit} = useApp();

  const [selectedRow, setSelectedRow] = useState(0);
  const [data, setData] = useState<Version[]>([]);
  const [rootWorkspace, setRootWorkspace] = useState<string>();
  const [loading, setLoading] = useState(false);

  const workspaces = useMemo(
    () => data.some(value => Boolean(value.workspace)),
    [data],
  );

  useEffect(() => {
    setLoading(true);
    listOutdatedDependencies()
      .then(result => {
        if (Array.isArray(result)) {
          setData(result.map(value => ({...value, chosen: value.current})));
          if (result.length < 1) {
            exit();
            console.log('All dependencies are the latest version');
          }
        } else {
          setData(
            result.outdatedDependencies
              .map(value => ({...value, chosen: value.current}))
              .sort((a, b) => {
                const aLength = a.workspace?.length || 0;
                const bLength = b.workspace?.length || 0;
                return aLength - bLength;
              }),
          );
          setRootWorkspace(result.rootProject);
          if (result.outdatedDependencies.length < 1) {
            exit();
            console.log('All dependencies are the latest version');
          }
        }
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
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
      const packageVersions: PackageToUpdate[] = data
        .map(value => ({
          name: value.name,
          from: value.current,
          to: value.chosen,
          workspace: value.workspace,
          dev: value.dev,
        }))
        .filter(value => value.from !== value.to);
      exit();
      installUpdates({
        packages: packageVersions,
        rootWorkspace,
      });
    }
  });

  return (
    <Box flexDirection="column">
      <Header workspacesEnabled={workspaces} />
      {loading ? (
        <LoadingText />
      ) : (
        data.map((item, index) => (
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
        ))
      )}
    </Box>
  );
}
