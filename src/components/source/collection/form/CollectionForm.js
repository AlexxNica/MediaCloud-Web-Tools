import PropTypes from 'prop-types';
import React from 'react';
import { injectIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import { Row, Col } from 'react-flexbox-grid/lib';
import composeIntlForm from '../../../common/IntlForm';
import AppButton from '../../../common/AppButton';
import CollectionDetailsForm from './CollectionDetailsForm';
import CollectionMediaForm from './CollectionMediaForm';
import SourceList from '../../../common/SourceList';
import { emptyString } from '../../../../lib/formValidators';

const localMessages = {
  mainTitle: { id: 'collection.maintitle', defaultMessage: 'Create New Collection' },
  collectionName: { id: 'collection.add.name', defaultMessage: 'New Collection Name' },
  collectionDescription: { id: 'collection.add.description', defaultMessage: 'New Collection Description' },
};

const CollectionForm = (props) => {
  const { initialValues, buttonLabel, pristine, submitting, handleSubmit, onSave } = props;
  let sourceContent = null; // show as editable or not depending on disabled flag
  const submitButton = (
    <AppButton
      type="submit"
      label={buttonLabel}
      disabled={pristine || submitting}
      primary
      className="submit-button"
    />
  );
  if (!initialValues.disabled) {
    sourceContent = (
      <CollectionMediaForm
        initialValues={initialValues}
        submitButton={submitButton}
      />
    );
  } else {
    sourceContent = (
      <SourceList
        collectionId={parseInt(initialValues.id, 10)}
        sources={initialValues.sources}
      />
    );
  }
  return (
    <form className="app-form collection-form" name="collectionForm" onSubmit={handleSubmit(onSave.bind(this))}>
      <CollectionDetailsForm
        initialValues={initialValues}
      />
      {sourceContent}
      <Row>
        <Col lg={10}>
          {submitButton}
        </Col>
      </Row>
    </form>
  );
};

CollectionForm.propTypes = {
  // from parent
  onSave: PropTypes.func.isRequired,
  buttonLabel: PropTypes.string.isRequired,
  initialValues: PropTypes.object,
  // from context
  intl: PropTypes.object.isRequired,
  renderTextField: PropTypes.func.isRequired,
  renderSelectField: PropTypes.func.isRequired,
  collections: PropTypes.array,
  // from form healper
  handleSubmit: PropTypes.func,
  pristine: PropTypes.bool.isRequired,
  submitting: PropTypes.bool.isRequired,
};

function validate(values) {
  const errors = {};
  if (emptyString(values.name)) {
    errors.name = localMessages.nameError;
  }
  if (emptyString(values.url)) {
    errors.url = localMessages.urlError;
  }
  return errors;
}

const reduxFormConfig = {
  form: 'collectionForm',
  validate,
};

export default
  injectIntl(
    composeIntlForm(
      reduxForm(reduxFormConfig)(
        CollectionForm
      ),
    ),
  );
