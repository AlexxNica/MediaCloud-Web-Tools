import PropTypes from 'prop-types';
import React from 'react';
import { formValueSelector } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import EditKeywordSearchContainer from './keywordSearch/EditKeywordSearchContainer';
import EditRetweetPartisanshipContainer from './retweetPartisanship/EditRetweetPartisanshipContainer';
import { goToCreateFocusStep } from '../../../../../actions/topicActions';
import { FOCAL_TECHNIQUE_BOOLEAN_QUERY, FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP } from '../../../../../lib/focalTechniques';
import messages from '../../../../../resources/messages';

const formSelector = formValueSelector('snapshotFocus');

const FocusForm2ConfigureContainer = (props) => {
  const { topicId, initialValues, handleNextStep, currentFocalTechnique, handlePreviousStep } = props;
  let content = null;
  switch (currentFocalTechnique) {
    case FOCAL_TECHNIQUE_BOOLEAN_QUERY:
      content = (<EditKeywordSearchContainer
        topicId={topicId}
        initialValues={initialValues}
        onPreviousStep={handlePreviousStep}
        onNextStep={handleNextStep}
      />);
      break;
    case FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP:
      content = (<EditRetweetPartisanshipContainer
        topicId={topicId}
        initialValues={initialValues}
        onPreviousStep={handlePreviousStep}
        onNextStep={handleNextStep}
      />);
      break;
    default:
      content = <FormattedMessage {...messages.unimplemented} />;
  }
  return (
    <div>
      { content }
    </div>
  );
};

FocusForm2ConfigureContainer.propTypes = {
  // from parent
  topicId: PropTypes.number.isRequired,
  initialValues: PropTypes.object,
  // form context
  intl: PropTypes.object.isRequired,
  // from dipatch
  handlePreviousStep: PropTypes.func.isRequired,
  handleNextStep: PropTypes.func.isRequired,
  // from state:
  currentFocalTechnique: PropTypes.string.isRequired,
};

const mapStateToProps = state => ({
  currentFocalTechnique: formSelector(state, 'focalTechnique'),
});

const mapDispatchToProps = dispatch => ({
  handlePreviousStep: () => {
    dispatch(goToCreateFocusStep(0));
  },
  handleNextStep: () => {
    dispatch(goToCreateFocusStep(2));
  },
});

export default
  connect(mapStateToProps, mapDispatchToProps)(
    injectIntl(
      FocusForm2ConfigureContainer
    )
  );
