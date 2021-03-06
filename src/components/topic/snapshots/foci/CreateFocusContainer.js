import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { push } from 'react-router-redux';
import { reset } from 'redux-form';
import FocusBuilderWizard from './builder/FocusBuilderWizard';
import { FOCAL_TECHNIQUE_BOOLEAN_QUERY, FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP } from '../../../../lib/focalTechniques';
import { submitFocusUpdateOrCreate, setTopicNeedsNewSnapshot, createRetweetFocalSet } from '../../../../actions/topicActions';
import { LEVEL_ERROR } from '../../../common/Notice';
import { updateFeedback, addNotice } from '../../../../actions/appActions';

const localMessages = {
  booleanFocusSaved: { id: 'focus.create.booleanSaved', defaultMessage: 'We saved your new Subtopic.' },
  retweetFocusSaved: { id: 'focus.create.retweetSaved', defaultMessage: 'We created a new set of Subtopics based on our parisan retweet measure.' },
  focusNotSaved: { id: 'focus.create.notSaved', defaultMessage: 'That didn\'t work for some reason!' },
  invalid: { id: 'focus.create.invalid', defaultMessage: 'Sorry - the data has an unknown subtopic technique. It failed!' },
};

const CreateFocusContainer = (props) => {
  const { topicId, location, handleDone } = props;
  const { focalSetDefId, focalTechnique } = props.location.query;
  const initialValues = {};
  if (focalTechnique !== undefined) {
    initialValues.focalTechnique = focalTechnique;
  } else {
    initialValues.focalTechnique = FOCAL_TECHNIQUE_BOOLEAN_QUERY;
  }
  // if there aren't any focal set defs, the user should have to create a new one
  if (focalSetDefId !== undefined) {
    initialValues.focalSetDefinitionId = parseInt(focalSetDefId, 10);
  }
  return (
    <FocusBuilderWizard
      topicId={topicId}
      startStep={focalTechnique ? 1 : 0}
      initialValues={initialValues}
      location={location}
      onDone={handleDone}
    />
  );
};

CreateFocusContainer.propTypes = {
  // from dispatch
  handleDone: PropTypes.func.isRequired,
  // from state
  formData: PropTypes.object,
  // from context:
  topicId: PropTypes.number.isRequired,
  location: PropTypes.object.isRequired,
  intl: PropTypes.object.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
  topicId: parseInt(ownProps.params.topicId, 10),
});

const mapDispatchToProps = (dispatch, ownProps) => ({
  handleDone: (topicId, formValues) => {
    switch (formValues.focalTechnique) {
      case FOCAL_TECHNIQUE_BOOLEAN_QUERY:
        return dispatch(submitFocusUpdateOrCreate(topicId, formValues))
          .then((results) => {
            if (results.length === 1) {
              const focusSavedMessage = ownProps.intl.formatMessage(localMessages.booleanFocusSaved);
              dispatch(setTopicNeedsNewSnapshot(true));           // user feedback
              dispatch(updateFeedback({ open: true, message: focusSavedMessage }));  // user feedback
              dispatch(push(`/topics/${topicId}/snapshot/foci`)); // go back to focus management page
              dispatch(reset('snapshotFocus')); // it is a wizard so we have to do this by hand
            } else {
              const focusNoteSavedMessage = ownProps.intl.formatMessage(localMessages.focusNotSaved);
              dispatch(updateFeedback({ open: true, message: focusNoteSavedMessage }));  // user feedback
            }
          });
      case FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP:
        return dispatch(createRetweetFocalSet(topicId, formValues))
          .then(() => {
            const focusSavedMessage = ownProps.intl.formatMessage(localMessages.retweetFocusSaved);
            dispatch(setTopicNeedsNewSnapshot(true));           // user feedback
            dispatch(updateFeedback({ open: true, message: focusSavedMessage }));  // user feedback
            dispatch(push(`/topics/${topicId}/snapshot/foci`)); // go back to focus management page
            dispatch(reset('snapshotFocus')); // it is a wizard so we have to do this by hand
          });
      default:
        return dispatch(addNotice({ level: LEVEL_ERROR, message: ownProps.intl.formatMessage(localMessages.invalid) }));
    }
  },
});

export default
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(
      CreateFocusContainer
    )
  );
