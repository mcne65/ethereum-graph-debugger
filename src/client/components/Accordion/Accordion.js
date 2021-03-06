import React from 'react';

import styles from './Accordion.scss';

const Accordion = ({ children }) => (
  <div className={styles['accordion']}>
    {children}
  </div>
)

Accordion.displayName = 'Accordion';

export default Accordion;