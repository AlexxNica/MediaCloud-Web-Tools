import React from 'react';
import { injectIntl } from 'react-intl';
import { Row } from 'react-flexbox-grid/lib';
import Stat from './Stat';

const StatBar = props => (
  <Row>
    {props.stats.map((stat, idx) => <Stat key={idx} {...stat} />)}
  </Row>
);

StatBar.propTypes = {
  // from parent
  stats: React.PropTypes.array.isRequired,
  className: React.PropTypes.string,
  // from context
  intl: React.PropTypes.object.isRequired,
};

export default
  injectIntl(
    StatBar
  );