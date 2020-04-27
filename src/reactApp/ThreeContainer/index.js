/** @jsx jsx */
import React, { useRef, useState } from 'react';
import { func, string } from 'prop-types';
import { jsx } from '@emotion/core';
import { Main } from '../../threeApp';
import { Loader } from '../Loader';
import { DebugBox } from '../DebugBox';

import { styles } from '../styles';


export const ThreeContainer = ({
  setStatus,
  status,
}) => {
  const threeRootElement = useRef();
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      <Main
        ref={threeRootElement}
        setStatus={setStatus}
        setIsLoading={setIsLoading}
      />
      <DebugBox
        threeRootElement={threeRootElement}
        status={status}
      />
      {
        isLoading
        && (<div css={styles.loadingScreen}><Loader /></div>)
      }
    </>
  );
};

ThreeContainer.propTypes = {
  setStatus: func,
  status: string,
};
