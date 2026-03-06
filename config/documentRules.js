const REQUIRED_DOCUMENTS_BY_TYPE = {
  hospital:       ['commercial_register', 'tax_card', 'licenseNumber'],
  clinic:         ['commercial_register', 'tax_card', 'licenseNumber'],
  medical_center: ['commercial_register', 'tax_card', 'licenseNumber'],
  pharmacy:       ['commercial_register', 'tax_card', 'licenseNumber'],
  charity:        ['founding_decision', 'association_registration'],
  ngo:            ['founding_decision', 'association_registration'],
  other:          ['commercial_register'], // minimum
};

module.exports={REQUIRED_DOCUMENTS_BY_TYPE}