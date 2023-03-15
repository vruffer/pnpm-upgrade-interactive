import {Text} from 'ink';
import {useEffect, useState} from 'react';

export function LoadingText() {
  const [numOfDots, setNumOfDots] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setNumOfDots(prev => {
        if (prev === 3) return 0;
        return prev + 1;
      });
    }, 400);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <Text>Loading{'.'.repeat(numOfDots)}</Text>;
}
