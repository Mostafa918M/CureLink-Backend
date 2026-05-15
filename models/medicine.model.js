// models/medicine.model.js

const mongoose = require('mongoose');

const MEDICINE_CATEGORIES = [
  // Pain & Inflammation
  'Analgesic',
  'Anti-inflammatory (NSAID)',
  'Antipyretic',
  'Muscle Relaxant',
  'Gout Treatment',
  'Opioid Analgesic',
  'Topical Analgesic',
  'Cox-2 Inhibitor',

  // Anti-infectives
  'Antibiotic',
  'Antifungal',
  'Antiviral',
  'Antiparasitic',
  'Antimalarial',
  'Antituberculosis',
  'Antiseptic / Disinfectant',
  'Antiretroviral (HIV)',
  'Anthelmintic',
  'Antiprotozoal',

  // Central Nervous System
  'Antidepressant',
  'Antipsychotic',
  'Anxiolytic / Sedative',
  'Anticonvulsant / Antiepileptic',
  'Neurological',
  'Migraine Treatment',
  'Sleep Aid',
  'Stimulant / ADHD',
  'Substance Abuse Treatment',
  'Mood Stabilizer',
  'Nootropic / Cognitive Enhancer',
  'Alzheimer & Dementia Treatment',
  'Parkinson Disease Treatment',
  'Multiple Sclerosis Treatment',
  'Neuropathic Pain Treatment',

  // Cardiovascular & Blood
  'Antihypertensive',
  'Cardiovascular',
  'Anticoagulant / Blood Thinner',
  'Antithrombotic',
  'Antiarrhythmic',
  'Lipid-Lowering / Statin',
  'Diuretic',
  'Vasodilator',
  'Heart Failure Treatment',
  'Angina Treatment',
  'ACE Inhibitor',
  'Beta Blocker',
  'Calcium Channel Blocker',
  'Iron & Anemia Treatment',
  'Plasma Expander',

  // Respiratory
  'Respiratory',
  'Bronchodilator',
  'Antiasthmatic',
  'Cough & Cold',
  'Decongestant',
  'Antihistamine',
  'Pulmonary Hypertension Treatment',
  'COPD Treatment',
  'Mucolytic / Expectorant',
  'Oxygen Therapy',

  // Gastrointestinal
  'Gastrointestinal',
  'Antacid / Proton Pump Inhibitor',
  'Antiemetic',
  'Laxative',
  'Antidiarrheal',
  'Hepatoprotective',
  'Antispasmodic',
  'Inflammatory Bowel Disease (IBD) Treatment',
  'Irritable Bowel Syndrome (IBS) Treatment',
  'Antiulcer',
  'Pancreatic Enzyme',
  'Probiotic',

  // Endocrine & Metabolic
  'Antidiabetic',
  'Hormonal',
  'Thyroid Treatment',
  'Corticosteroid',
  'Bone & Calcium Metabolism',
  'Obesity Treatment',
  'Insulin',
  'Growth Hormone',
  'Adrenal Treatment',
  'Pituitary Treatment',
  'Electrolyte Supplement',
  'Metabolic Syndrome Treatment',

  // Oncology & Immunology
  'Anticancer / Chemotherapy',
  'Immunosuppressant',
  'Immunomodulator',
  'Biological / Monoclonal Antibody',
  'Targeted Therapy',
  'Hormonal Anticancer',
  'Radioactive / Nuclear Medicine',
  'CAR-T / Gene Therapy',
  'Supportive Oncology (Anti-nausea, G-CSF)',

  // Urology & Reproductive
  'Urological',
  'Contraceptive',
  'Erectile Dysfunction Treatment',
  'Fertility Treatment',
  'Benign Prostatic Hyperplasia (BPH) Treatment',
  'Overactive Bladder Treatment',
  'Kidney Stone Treatment',
  'Postmenopausal Treatment',
  'Oxytocic / Uterine Stimulant',

  // Rheumatology & Autoimmune
  'Antirheumatic (DMARD)',
  'Anti-gout',
  'Systemic Lupus Treatment',
  'Psoriasis Treatment',
  'Ankylosing Spondylitis Treatment',

  // Nephrology
  'Chronic Kidney Disease (CKD) Treatment',
  'Dialysis Support',
  'Phosphate Binder',
  'Erythropoiesis Stimulating Agent',

  // Pediatrics
  'Pediatric Analgesic',
  'Pediatric Antibiotic',
  'Pediatric Vitamin',
  'Pediatric Antiparasitic',
  'Pediatric Vaccine',

  // Geriatrics
  'Osteoporosis Treatment',
  'Fall Prevention',
  'Geriatric Multivitamin',

  // Sensory Organs
  'Ophthalmological',
  'Glaucoma Treatment',
  'Dry Eye Treatment',
  'Otic (Ear)',
  'Nasal',

  // Skin & Topical
  'Dermatological',
  'Topical Anesthetic',
  'Wound Care',
  'Antiacne',
  'Antipsoriatic (Topical)',
  'Emollient / Moisturizer',
  'Sunscreen / Photoprotective',
  'Antifungal (Topical)',
  'Hair & Scalp Treatment',

  // Nutrition & Vitamins
  'Nutritional Supplement',
  'Vitamin & Mineral',
  'Oral Rehydration',
  'Protein Supplement',
  'Omega-3 / Fish Oil',
  'Prebiotic',
  'Amino Acid Supplement',
  'Enteral / Parenteral Nutrition',

  // Emergency & Critical Care
  'Emergency Medicine',
  'Vasopressor',
  'Antidote / Reversal Agent',
  'Resuscitation Agent',
  'Anticonvulsant (Acute)',

  // Preventive & Other
  'Vaccine',
  'Dental / Oral Care',
  'Diagnostic Agent',
  'Anesthetic',
  'Local Anesthetic',
  'General Anesthetic',
  'Hematological',
  'Coagulation Factor',
  'Antiallergic',
  'Desensitization / Allergy Immunotherapy',
  'Sports Medicine',
  'Veterinary (Dual Use)',
  'Radiological Contrast Agent',
  'Surgical Adjunct',
  'Palliative Care',
  'Other',
];

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    genericName: {
      type: String,
      trim: true,
      index: true,
    },

    barcode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    manufacturer: {
      type: String,
      trim: true,
      index: true,
    },

    strength: {
      type: String,
      trim: true,
    },

    dosageForm: {
      type: String,
      enum: ['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'other'],
    },

    category: {
      type: String,
      enum: MEDICINE_CATEGORIES,
      default: 'Other',
      index: true,
    },

    prescriptionRequired: {
      type: Boolean,
      default: false,
    },

    verification: {
      verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      verifiedAt: Date,
      notes: String,
    },

    usageCount: {
      type: Number,
      default: 0,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* Text index for search */
medicineSchema.index({
  name: 'text',
  genericName: 'text',
  manufacturer: 'text',
  dosageForm: 'text',
});

const Medicine = mongoose.model('Medicine', medicineSchema);

module.exports = Medicine;
module.exports.MEDICINE_CATEGORIES = MEDICINE_CATEGORIES;
