import PropTypes from 'prop-types';
import React from 'react';
import FlatButton from 'material-ui/FlatButton';
import { FormattedMessage, injectIntl } from 'react-intl';

const localMessages = {
  errorCantLoad: { id: 'error.cantLoad', defaultMessage: "Can't load the data" },
  errorTryAgain: { id: 'error.tryAgain', defaultMessage: 'Try Again' },
};

const ErrorTryAgain = (props) => {
  const { onTryAgain } = props;
  const { formatMessage } = props.intl;
  const tryAgainMsg = formatMessage(localMessages.errorTryAgain);
  return (
    <div className="error-try-again">
      <p><FormattedMessage {...localMessages.errorCantLoad} /></p>
      <FlatButton label={tryAgainMsg} primary onClick={onTryAgain} />
    </div>
  );
};

ErrorTryAgain.propTypes = {
  intl: PropTypes.object.isRequired,
  onTryAgain: PropTypes.func.isRequired,
};

export default injectIntl(ErrorTryAgain);
