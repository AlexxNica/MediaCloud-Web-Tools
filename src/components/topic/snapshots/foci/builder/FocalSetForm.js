import PropTypes from 'prop-types';
import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import composeIntlForm from '../../../../common/IntlForm';
import { FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP } from '../../../../../lib/focalTechniques';
import { notEmptyString } from '../../../../../lib/formValidators';

const localMessages = {
  focalSetName: { id: 'focalSet.name', defaultMessage: 'Set Name' },
  focalSetDescription: { id: 'focalSet.description', defaultMessage: 'Set Description' },
  focalSetWhy: { id: 'focalSet.why', defaultMessage: 'Give your new Set a name and description so others can recognize what it is for.' },
  errorNoName: { id: 'focalSet.name.error', defaultMessage: 'You need to name this.' },
  errorNoDescription: { id: 'focalSet.description.error', defaultMessage: 'You need a description.' },
  defaultSetName: { id: 'focalSet.default.setName', defaultMessage: 'Conversations' },
  defaultSetDescription: { id: 'focalSet.default.setDescription', defaultMessage: 'A set of difference conversations within this topic.' },
  defaultSetNameRetweet: { id: 'focalSet.default.setName.retweet', defaultMessage: 'Retweet Partisanship' },
  defaultSetDescriptionRetweet: { id: 'focalSet.default.setDescription.retweet', defaultMessage: 'Subtopics driven by our analysis of Twitter followers of Trump and Clinton during the 2016 election season.  Each media soure is scored based on the ratio of retweets of their stories in those two groups.' },
};


class FocalSetForm extends React.Component {

  componentWillMount() {
    const { change, focalTechnique } = this.props;
    const { formatMessage } = this.props.intl;
    // set smart-looking default set name/description based on the focal technique currently selected
    let setName;
    let setDescription;
    switch (focalTechnique) {
      case FOCAL_TECHNIQUE_RETWEET_PARTISANSHIP:
        setName = formatMessage(localMessages.defaultSetNameRetweet);
        setDescription = formatMessage(localMessages.defaultSetDescriptionRetweet);
        break;
      default:
        setName = formatMessage(localMessages.defaultSetName);
        setDescription = formatMessage(localMessages.defaultSetDescription);
        break;
    }
    change('focalSetName', setName);
    change('focalSetDescription', setDescription);
  }

  render() {
    const { renderTextField, introContent, fullWidth } = this.props;
    const defaultIntroContent = (<p className="light"><i><FormattedMessage {...localMessages.focalSetWhy} /></i></p>);
    const fullWidthFields = fullWidth || false;
    const intro = introContent || defaultIntroContent;
    return (
      <div className="new-focal-set">
        {intro}
        <Field
          name="focalSetName"
          component={renderTextField}
          floatingLabelText={localMessages.focalSetName}
          fullWidth={fullWidthFields}
        />
        <br />
        <Field
          name="focalSetDescription"
          component={renderTextField}
          floatingLabelText={localMessages.focalSetDescription}
          fullWidth={fullWidthFields}
        />
      </div>
    );
  }

}

FocalSetForm.propTypes = {
  // form compositinal chain
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  // from parent
  initialValues: PropTypes.object,
  introContent: PropTypes.object,
  fullWidth: PropTypes.bool,
  focalTechnique: PropTypes.string.isRequired,
};

function validate(values) {
  const errors = {};
  if (!notEmptyString(values.focalSetName)) {
    errors.focalSetName = localMessages.errorNoName;
  }
  if (!notEmptyString(values.focalSetDescription)) {
    errors.focalSetDescription = localMessages.errorNoDescription;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'snapshotFocus', // make sure this matches the sub-components and other wizard steps
  destroyOnUnmount: false,  // so the wizard works
  validate,
};

export default
  composeIntlForm(
    reduxForm(reduxFormConfig)(
      injectIntl(
        FocalSetForm
      )
    )
  );
