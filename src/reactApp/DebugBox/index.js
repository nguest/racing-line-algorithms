/** @jsx jsx */
import React from 'react';
import { func, object, string } from 'prop-types';
import { jsx } from '@emotion/core';

import { styles } from './styles';


export const DebugBox = ({
}) => {
  return (
    <section css={styles.debugBox}>
      <button
        css={styles.resetButton}
        onClick={() =>  {}}
      >
        Reset
      </button>
    </section>
  );
};

DebugBox.propTypes = {

};
