/** @jsx jsx */
import React, { useState } from 'react';
import { jsx } from '@emotion/core';
import { ThreeContainer } from './ThreeContainer';

import { styles } from './styles';

export const App = () => {
  const [status, setStatus] = useState(null);

  return (
    <div css={styles.app}>
      <header css={styles.appHeader}>
        <p>App Header</p>
      </header>
      <ThreeContainer
        status={status}
        setStatus={setStatus}
      />
    </div>
  );
};
