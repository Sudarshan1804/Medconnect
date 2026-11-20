"""
Management command: python manage.py seed_data

Seeds the database with comprehensive, realistic production-grade data for a live hospital:
  - 6 Medical Specialties
  - 1 System Admin (admin@hospital.com / Admin123!)
  - 8 Doctors (6 verified, 2 pending admin approval)
  - Full weekly AvailabilitySlots (Monday through Saturday + Emergency)
  - 12 Patients with complete profiles (blood group, DOB, phone, address)
  - 15-Day Historical & Live Token Booking Activity (Nov 5 - Nov 23):
      * 60+ Realistic Appointments across all 15 past days up to today and upcoming
      * ~45 Completed Outpatient Consultations with detailed Clinical Diagnoses,
        Prescriptions (medicines, dosages, regimens), and Physician EHR Notes
      * Real Payment Transactions (UPI, Credit/Debit Card, Net Banking)
      * Pending 50% Refund Requests for the Admin Dashboard to review & approve
      * Active Tokens for Today (Morning completed, Afternoon queue confirmed)
      * Upcoming Bookings for the next 3 days
      * Real Patient & Doctor Notifications and System Announcements

All created records are idempotent — running the command multiple times won't create duplicates.
"""

import datetime
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from core.models import (
    Specialty,
    DoctorProfile,
    PatientProfile,
    AvailabilitySlot,
    Appointment,
    MedicalRecord,
    Payment,
    Notification,
)

User = get_user_model()


SPECIALTIES = [
    {
        "name": "Cardiology",
        "description": "Comprehensive cardiac diagnostics, echocardiography, coronary disease management, and arrhythmia therapy.",
    },
    {
        "name": "Dermatology",
        "description": "Clinical and cosmetic dermatology, allergy patch testing, eczema, psoriasis, and skin oncological care.",
    },
    {
        "name": "Pediatrics",
        "description": "Infant care, pediatric development, adolescent wellness, routine immunizations, and acute illness treatment.",
    },
    {
        "name": "Orthopedics",
        "description": "Musculoskeletal injury care, joint replacement, sports trauma, arthroscopy, and spine rehabilitation.",
    },
    {
        "name": "General Medicine",
        "description": "Primary healthcare, metabolic disorder screening, hypertension, diabetic care, and preventive diagnostics.",
    },
    {
        "name": "Neurology",
        "description": "Clinical neurology, migraine therapeutics, neurodegenerative management, stroke rehab, and epilepsy management.",
    },
]

DOCTORS = [
    {
        "email": "james@hospital.com",
        "password": "Doctor123!",
        "first_name": "James",
        "last_name": "Smith",
        "specialty": "Cardiology",
        "bio": "Senior Consultant Interventional Cardiologist with 15+ years of clinical excellence in coronary intervention and preventive cardiac wellness.",
        "fee": Decimal("800.00"),
        "experience_years": 15,
        "is_verified": True,
        "slots": [
            {"day": 0, "start": "09:00", "end": "11:00"},
            {"day": 1, "start": "14:00", "end": "16:00"},
            {"day": 2, "start": "09:00", "end": "11:00"},
            {"day": 3, "start": "14:00", "end": "16:00"},
            {"day": 4, "start": "09:00", "end": "11:00"},
            {"day": 5, "start": "10:00", "end": "12:00"},
        ],
    },
    {
        "email": "emily@hospital.com",
        "password": "Doctor123!",
        "first_name": "Emily",
        "last_name": "Johnson",
        "specialty": "Dermatology",
        "bio": "Fellow of Dermatology with 10 years of experience in inflammatory skin disorders, allergy diagnostics, and clinical dermatosurgery.",
        "fee": Decimal("650.00"),
        "experience_years": 10,
        "is_verified": True,
        "slots": [
            {"day": 0, "start": "10:00", "end": "12:00"},
            {"day": 1, "start": "10:00", "end": "12:00"},
            {"day": 2, "start": "14:00", "end": "16:00"},
            {"day": 3, "start": "10:00", "end": "12:00"},
            {"day": 4, "start": "14:00", "end": "16:00"},
            {"day": 5, "start": "10:00", "end": "12:00"},
        ],
    },
    {
        "email": "anika@hospital.com",
        "password": "Doctor123!",
        "first_name": "Anika",
        "last_name": "Patel",
        "specialty": "Pediatrics",
        "bio": "Pediatric specialist dedicated to child health, neonatal developmental surveillance, routine vaccinations, and pediatric asthma management.",
        "fee": Decimal("500.00"),
        "experience_years": 8,
        "is_verified": True,
        "slots": [
            {"day": 0, "start": "11:00", "end": "13:00"},
            {"day": 1, "start": "11:00", "end": "13:00"},
            {"day": 2, "start": "11:00", "end": "13:00"},
            {"day": 3, "start": "11:00", "end": "13:00"},
            {"day": 4, "start": "11:00", "end": "13:00"},
            {"day": 5, "start": "09:00", "end": "11:00"},
        ],
    },
    {
        "email": "michael@hospital.com",
        "password": "Doctor123!",
        "first_name": "Michael",
        "last_name": "Lee",
        "specialty": "Orthopedics",
        "bio": "Orthopedic surgeon specializing in joint replacement, sports injury reconstruction, spinal degenerative disorders, and fracture recovery.",
        "fee": Decimal("1200.00"),
        "experience_years": 20,
        "is_verified": True,
        "slots": [
            {"day": 0, "start": "14:00", "end": "16:00"},
            {"day": 1, "start": "09:00", "end": "11:00"},
            {"day": 2, "start": "14:00", "end": "16:00"},
            {"day": 3, "start": "09:00", "end": "11:00"},
            {"day": 4, "start": "14:00", "end": "16:00"},
            {"day": 5, "start": "09:00", "end": "11:00"},
        ],
    },
    {
        "email": "sarah@hospital.com",
        "password": "Doctor123!",
        "first_name": "Sarah",
        "last_name": "Wilson",
        "specialty": "General Medicine",
        "bio": "Attending physician specializing in adult internal medicine, lifestyle metabolic diseases, geriatric wellness, and diagnostic triage.",
        "fee": Decimal("600.00"),
        "experience_years": 12,
        "is_verified": True,
        "slots": [
            {"day": 0, "start": "09:00", "end": "12:00"},
            {"day": 1, "start": "09:00", "end": "12:00"},
            {"day": 2, "start": "09:00", "end": "12:00"},
            {"day": 3, "start": "09:00", "end": "12:00"},
            {"day": 4, "start": "09:00", "end": "12:00"},
            {"day": 5, "start": "09:00", "end": "12:00"},
            {"day": 6, "start": "10:00", "end": "12:00"},  # Sunday OPD
        ],
    },
    {
        "email": "rajesh@hospital.com",
        "password": "Doctor123!",
        "first_name": "Rajesh",
        "last_name": "Sharma",
        "specialty": "Neurology",
        "bio": "Consultant Neurologist focusing on refractory headaches, movement disorders, peripheral neuropathies, and post-stroke rehabilitation.",
        "fee": Decimal("1000.00"),
        "experience_years": 18,
        "is_verified": True,
        "slots": [
            {"day": 1, "start": "11:00", "end": "13:00"},
            {"day": 2, "start": "14:00", "end": "16:00"},
            {"day": 3, "start": "11:00", "end": "13:00"},
            {"day": 5, "start": "11:00", "end": "13:00"},
        ],
    },
    # Unverified doctors pending Admin approval
    {
        "email": "sofia@hospital.com",
        "password": "Doctor123!",
        "first_name": "Sofia",
        "last_name": "Garcia",
        "specialty": "Cardiology",
        "bio": "Cardiologist specializing in non-invasive echocardiography, cardiac CT interpretation, and outpatient hypertension management.",
        "fee": Decimal("750.00"),
        "experience_years": 7,
        "is_verified": False,
        "slots": [
            {"day": 0, "start": "14:00", "end": "16:00"},
            {"day": 2, "start": "14:00", "end": "16:00"},
            {"day": 4, "start": "14:00", "end": "16:00"},
        ],
    },
    {
        "email": "david.doc@hospital.com",
        "password": "Doctor123!",
        "first_name": "David",
        "last_name": "Chen",
        "specialty": "Dermatology",
        "bio": "Consultant Dermatologist with focus on autoimmune bullous conditions and pediatric skin ailments.",
        "fee": Decimal("700.00"),
        "experience_years": 9,
        "is_verified": False,
        "slots": [
            {"day": 1, "start": "15:00", "end": "17:00"},
            {"day": 3, "start": "15:00", "end": "17:00"},
        ],
    },
]

PATIENTS = [
    {
        "email": "alice@patient.com",
        "password": "Patient123!",
        "first_name": "Alice",
        "last_name": "Walker",
        "dob": "1992-05-12",
        "phone": "+91-9845012341",
        "address": "402 Greenview Heights, Indiranagar, Bangalore",
        "blood_group": "A+",
    },
    {
        "email": "bob@patient.com",
        "password": "Patient123!",
        "first_name": "Bob",
        "last_name": "Martin",
        "dob": "1985-11-23",
        "phone": "+91-9845012342",
        "address": "78 Silver Palm Residency, Koramangala 4th Block, Bangalore",
        "blood_group": "O+",
    },
    {
        "email": "charlie@patient.com",
        "password": "Patient123!",
        "first_name": "Charlie",
        "last_name": "Brown",
        "dob": "1998-03-08",
        "phone": "+91-9845012343",
        "address": "12 Maple Tree Apartments, HSR Layout, Bangalore",
        "blood_group": "B+",
    },
    {
        "email": "david@patient.com",
        "password": "Patient123!",
        "first_name": "David",
        "last_name": "Wilson",
        "dob": "1974-07-19",
        "phone": "+91-9845012344",
        "address": "301 Lakeview Enclave, Whitefield, Bangalore",
        "blood_group": "AB+",
    },
    {
        "email": "emma@patient.com",
        "password": "Patient123!",
        "first_name": "Emma",
        "last_name": "Thompson",
        "dob": "1995-09-30",
        "phone": "+91-9845012345",
        "address": "14 Willow Creek Road, Jayanagar 7th Block, Bangalore",
        "blood_group": "O+",
    },
    {
        "email": "frank@patient.com",
        "password": "Patient123!",
        "first_name": "Frank",
        "last_name": "Miller",
        "dob": "1978-04-14",
        "phone": "+91-9845012346",
        "address": "88 Prestige Boulevard, Bannerghatta Road, Bangalore",
        "blood_group": "A-",
    },
    {
        "email": "grace@patient.com",
        "password": "Patient123!",
        "first_name": "Grace",
        "last_name": "Hopper",
        "dob": "1996-12-09",
        "phone": "+91-9845012347",
        "address": "205 Cyber Park View, Electronic City Phase 1, Bangalore",
        "blood_group": "B-",
    },
    {
        "email": "henry@patient.com",
        "password": "Patient123!",
        "first_name": "Henry",
        "last_name": "Cavill",
        "dob": "1988-06-25",
        "phone": "+91-9845012348",
        "address": "55 Magnolia Court, Malleshwaram, Bangalore",
        "blood_group": "O+",
    },
    {
        "email": "ivy@patient.com",
        "password": "Patient123!",
        "first_name": "Ivy",
        "last_name": "Chen",
        "dob": "2001-01-18",
        "phone": "+91-9845012349",
        "address": "103 Sunrise Terraces, Bellandur, Bangalore",
        "blood_group": "AB-",
    },
    {
        "email": "jack@patient.com",
        "password": "Patient123!",
        "first_name": "Jack",
        "last_name": "Ryan",
        "dob": "1982-08-31",
        "phone": "+91-9845012350",
        "address": "77 Palm Grove, Richmond Town, Bangalore",
        "blood_group": "A+",
    },
    {
        "email": "karen@patient.com",
        "password": "Patient123!",
        "first_name": "Karen",
        "last_name": "Page",
        "dob": "1991-10-15",
        "phone": "+91-9845012351",
        "address": "40 Oakridge Vista, Sarjapur Road, Bangalore",
        "blood_group": "B+",
    },
    {
        "email": "liam@patient.com",
        "password": "Patient123!",
        "first_name": "Liam",
        "last_name": "Neeson",
        "dob": "1965-02-10",
        "phone": "+91-9845012352",
        "address": "19 Heritage Square, Cunningham Road, Bangalore",
        "blood_group": "O-",
    },
]

# Clinical dataset templates for realistic consultation EHRs
CLINICAL_CASES = {
    "Cardiology": [
        {
            "reason": "Routine hypertension follow-up & resting ECG evaluation",
            "diagnosis": "Essential Hypertension (Stage 1), well controlled on monotherapy.",
            "prescription": "1. Tab Telmisartan 40mg - 1-0-0 (after breakfast) x 30 days\n2. Tab Atorvastatin 20mg - 0-0-1 (after dinner) x 30 days\n3. Low sodium dietary intake (<2g/day) & 30-min daily aerobic exercise.",
            "notes": "BP: 124/80 mmHg, Pulse: 72 bpm regular. S1/S2 heard normally without murmur. Resting 12-lead ECG demonstrated normal sinus rhythm without ischemic ST-T changes. Review in 3 months.",
        },
        {
            "reason": "Exertional dyspnea and occasional chest heaviness during brisk walking",
            "diagnosis": "Stable Angina Pectoris (CCS Class II); Dyslipidemia.",
            "prescription": "1. Tab Metoprolol Succinate ER 25mg - 1-0-0 x 30 days\n2. Tab Aspirin 75mg - 0-1-0 (after lunch) x 30 days\n3. Tab Rosuvastatin 10mg - 0-0-1 (bedtime) x 30 days\n4. Sublingual Sorbitrate 5mg SOS for acute angina.",
            "notes": "Stress Treadmill Test (TMT) scheduled for next week. Patient advised to avoid strenuous physical exertion and report to ER immediately if chest pain persists >10 min.",
        },
        {
            "reason": "Palpitations during evening hours and mild lightheadedness",
            "diagnosis": "Benign Premature Ventricular Contractions (PVCs); Generalized Anxiety.",
            "prescription": "1. Tab Propranolol 20mg - 1-0-1 x 14 days\n2. Tab Magnesium Glycinate 400mg - 0-0-1 x 30 days\n3. Reduce caffeinated beverages to max 1 cup/day; ensure 7+ hours sleep.",
            "notes": "Holter 24-hr cardiac monitor recommended. Serum potassium 4.2 mEq/L (normal), TSH 2.1 mIU/L (normal). S1/S2 clear.",
        },
    ],
    "Dermatology": [
        {
            "reason": "Severe pruritus and erythematous scaly plaques on bilateral forearms",
            "diagnosis": "Moderate Atopic Dermatitis with secondary lichenification.",
            "prescription": "1. Clobetasol Propionate 0.05% Cream - Apply thin layer locally twice daily x 7 days\n2. Tab Cetirizine 10mg - 0-0-1 (nightly) x 10 days\n3. Liquid Paraffin Emollient Lotion - Generously apply after bathing on damp skin.",
            "notes": "Skin barrier restoration emphasized. Instructed patient to use fragrance-free cleanser, avoid wool clothing, and refrain from hot showers.",
        },
        {
            "reason": "Persistent papulopustular acne flare on cheeks and forehead",
            "diagnosis": "Acne Vulgaris (Grade III - Inflammatory).",
            "prescription": "1. Cap Doxycycline 100mg - 1-0-0 (after meals with plenty of water) x 21 days\n2. Adapalene 0.1% + Benzoyl Peroxide 2.5% Gel - Apply pea-sized amount at bedtime\n3. Non-comedogenic Broad Spectrum Sunscreen SPF 50 - Morning daily.",
            "notes": "Reviewed skincare hygiene. Advised gentle foaming cleanser, instructed patient not to pick lesions to avoid scarring. Review in 4 weeks.",
        },
        {
            "reason": "Hair thinning, scalp scaling, and excessive shedding over 2 months",
            "diagnosis": "Telogen Effluvium secondary to post-viral recovery; Mild Seborrheic Dermatitis.",
            "prescription": "1. Ketoconazole 2% Shampoo - Scalp wash 3 times weekly, leave for 5 mins\n2. Peptide & Biotin Hair Serum - 1 ml scalp application at night\n3. Tab Multivitamin with Zinc - 1 tab daily after breakfast x 60 days.",
            "notes": "Trichoscopy performed: no miniature follicular units (rules out AGA). Serum Ferritin: 45 ng/mL, Vitamin D: 22 ng/mL. Advised high-protein diet.",
        },
    ],
    "Pediatrics": [
        {
            "reason": "Low-grade fever, nasal congestion, and nocturnal barking cough for 3 days",
            "diagnosis": "Acute Viral Croup (Laryngotracheobronchitis) - Mild severity.",
            "prescription": "1. Syr Paracetamol (250mg/5ml) - 5ml SOS every 6 hours if temp >100°F\n2. Normal Saline 0.9% Nasal Drops - 2 drops per nostril before feeding & sleep\n3. Cool mist humidifier in bedroom; adequate hydration with warm fluids.",
            "notes": "Chest auscultation: bilaterally clear air entry, no wheezing or stridor at rest. Tonsils mildly erythematous without exudate. Parents educated on red flag breathing signs.",
        },
        {
            "reason": "18-month routine developmental surveillance and vaccination consultation",
            "diagnosis": "Normal Healthy Toddler; Age-appropriate developmental milestones.",
            "prescription": "1. DTwP Booster 1 administered intramuscularly in anterolateral thigh\n2. OPV Booster dose given orally\n3. Syp Vitamin D3 400 IU - 1ml daily\n4. Syp Paracetamol 120mg/5ml - 4ml SOS for post-vaccine fever.",
            "notes": "Weight: 11.4 kg (50th percentile), Height: 83 cm (55th percentile), Head Circ: 47 cm. Child walks independently, speaks 10+ words, scribbles. Tolerated vaccine well.",
        },
        {
            "reason": "Recurrent wheezing episodes triggered by cold air and viral colds",
            "diagnosis": "Early Childhood Viral-Induced Wheeze / Pediatric Reactive Airway.",
            "prescription": "1. Levosalbutamol Inhaler (50mcg) via BabyMask Spacer - 2 puffs SOS during cough spasms\n2. Syp Montelukast 4mg - 1 chewable tab nightly x 30 days\n3. Steam inhalation twice daily with parental supervision.",
            "notes": "Bilateral expiratory rhonchi noted, resolving post spacer dose in OPD. O2 Saturation: 98% on room air. Parent trained in proper MDI spacer technique.",
        },
    ],
    "Orthopedics": [
        {
            "reason": "Chronic mechanical lower back pain with stiffness upon morning rising",
            "diagnosis": "Lumbosacral Spondylosis with Paravertebral Muscle Spasm.",
            "prescription": "1. Tab Aceclofenac 100mg + Thiocolchicoside 4mg - 1-0-1 (after food) x 5 days\n2. Tab Pantoprazole 40mg - 1-0-0 (before breakfast) x 5 days\n3. Topical Diclofenac Gel - Apply gently over lumbar area twice daily\n4. Lumbar core stabilization physiotherapy after acute phase.",
            "notes": "SLR test negative bilaterally (80°). Lumbar spine flexion mildly restricted. X-Ray Lumbosacral spine shows L4-L5 intervertebral disc narrowing without listhesis.",
        },
        {
            "reason": "Right knee pain, swelling, and difficulty descending stairs post badminton",
            "diagnosis": "Acute Medial Meniscal Strain (Grade I); Mild Joint Effusion.",
            "prescription": "1. Tab Etoricoxib 90mg - 1-0-0 (after lunch) x 5 days\n2. Elastic Knee Crepe Bandage support while walking\n3. R.I.C.E. protocol (Ice pack 15 mins thrice daily, elevate leg on pillow).",
            "notes": "McMurray test mildly positive on medial joint line. Lachman and anterior drawer tests negative (ACL intact). Advised non-weight bearing sports rest x 2 weeks.",
        },
        {
            "reason": "Left shoulder pain with overhead abduction restriction for 3 weeks",
            "diagnosis": "Subacromial Impingement Syndrome; Supraspinatus Tendinopathy.",
            "prescription": "1. Tab Trypsin Chymotrypsin - 1-1-1 (empty stomach) x 10 days\n2. Tab Paracetamol 650mg - 1-0-1 x 5 days\n3. Rotator cuff isometric strengthening exercises as demonstrated in clinic.",
            "notes": "Neer's and Hawkins-Kennedy tests positive. Full passive range of motion preserved. Patient advised to avoid overhead lifting and sleeping on affected shoulder.",
        },
    ],
    "General Medicine": [
        {
            "reason": "General fatigue, increased thirst, and annual blood sugar screening",
            "diagnosis": "Newly Diagnosed Type 2 Diabetes Mellitus; Mild Hypertriglyceridemia.",
            "prescription": "1. Tab Metformin 500mg ER - 0-0-1 (with dinner) x 30 days\n2. Strict diabetic diet plan provided (low GI foods, zero refined sugars)\n3. Home glucometer fasting & post-prandial blood sugar tracking log twice weekly.",
            "notes": "Fasting Blood Sugar: 168 mg/dL, HbA1c: 7.4%, Serum Creatinine: 0.9 mg/dL. BMI: 27.2 kg/m². Advised 40 min daily walking. Follow-up with repeat fasting sugar in 4 weeks.",
        },
        {
            "reason": "High-grade fever with chills, body ache, and frontal headache for 4 days",
            "diagnosis": "Acute Viral Syndrome; Ruled out Dengue / Malaria.",
            "prescription": "1. Tab Paracetamol 650mg - 1-0-1-1 (every 6 hours if temp >100°F) x 5 days\n2. ORS Hydration Solution - 1 sachet in 1 liter boiled water consumed throughout day\n3. Tab Vitamin C 500mg + Zinc - 1 tab daily x 10 days.",
            "notes": "Temp: 101.4°F, BP: 118/76 mmHg. Platelet count: 210,000/mcL (normal), NS1 Dengue Antigen negative, Malaria smear negative. Advised soft diet and adequate rest.",
        },
    ],
    "Neurology": [
        {
            "reason": "Recurrent unilateral throbbing headache with photophobia and nausea",
            "diagnosis": "Migraine with Aura (episodic, moderate frequency).",
            "prescription": "1. Tab Naproxen 500mg + Domperidone 10mg - SOS at earliest onset of headache aura\n2. Tab Flunarizine 5mg - 0-0-1 (bedtime prophylaxis) x 30 days\n3. Maintain digital headache diary recording triggers, sleep hours, and duration.",
            "notes": "Cranial nerves II-XII intact. Fundus examination normal (no papilledema). Motor power 5/5 all 4 limbs. Discussed trigger avoidance (aged cheese, skipping meals, irregular sleep).",
        },
    ],
}


class Command(BaseCommand):
    help = "Seeds database with specialties, doctors, patients, and 15 days of realistic token booking data."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset-appointments",
            action="store_true",
            help="Clear existing mock appointments and regenerate fresh 15-day activity.",
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("\n=== Seeding Live Hospital Data (15-Day Token System) ===\n"))

        today = datetime.date.today()
        self.stdout.write(f"System Reference Date (Today): {today.isoformat()} ({today.strftime('%A')})")

        # 1. Specialties
        self.stdout.write("\n1. Seeding Specialties...")
        specialty_map = {}
        for spec_data in SPECIALTIES:
            spec, created = Specialty.objects.get_or_create(
                name=spec_data["name"],
                defaults={"description": spec_data["description"]},
            )
            specialty_map[spec.name] = spec
            status_label = "created" if created else "exists"
            self.stdout.write(f"  [OK] {spec.name} [{status_label}]")

        # 2. System Admin
        self.stdout.write("\n2. Seeding Admin Account...")
        admin_user, created = User.objects.get_or_create(
            email="admin@hospital.com",
            defaults={
                "first_name": "System",
                "last_name": "Admin",
                "role": User.Role.ADMIN,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        if created:
            admin_user.set_password("Admin123!")
            admin_user.save()
            self.stdout.write("  [OK] admin@hospital.com (Password: Admin123!) [created]")
        else:
            self.stdout.write("  [--] admin@hospital.com [exists]")

        # 3. Doctors & Profiles & Availability Slots
        self.stdout.write("\n3. Seeding Doctors & Weekly Availability Slots...")
        doctor_profiles = []
        for doc_data in DOCTORS:
            user, created = User.objects.get_or_create(
                email=doc_data["email"],
                defaults={
                    "first_name": doc_data["first_name"],
                    "last_name": doc_data["last_name"],
                    "role": User.Role.DOCTOR,
                },
            )
            if created:
                user.set_password(doc_data["password"])
                user.save()

            profile, prof_created = DoctorProfile.objects.get_or_create(
                user=user,
                defaults={
                    "specialty": specialty_map.get(doc_data["specialty"]),
                    "bio": doc_data["bio"],
                    "fee": doc_data["fee"],
                    "experience_years": doc_data["experience_years"],
                    "is_verified": doc_data["is_verified"],
                },
            )
            if not prof_created and profile.is_verified != doc_data["is_verified"]:
                profile.is_verified = doc_data["is_verified"]
                profile.save(update_fields=["is_verified"])

            doctor_profiles.append(profile)

            # Create weekly recurring availability slots
            slot_count = 0
            for slot_def in doc_data["slots"]:
                start = datetime.time(*map(int, slot_def["start"].split(":")))
                end = datetime.time(*map(int, slot_def["end"].split(":")))
                _, s_created = AvailabilitySlot.objects.get_or_create(
                    doctor=profile,
                    day_of_week=slot_def["day"],
                    start_time=start,
                    defaults={"end_time": end, "is_active": True},
                )
                if s_created:
                    slot_count += 1

            status_str = "Verified" if profile.is_verified else "Pending Approval"
            self.stdout.write(
                f"  [OK] Dr. {user.first_name} {user.last_name} ({doc_data['specialty']}) - {status_str} "
                f"[{slot_count} new slots]"
            )

        # 4. Patients & Profiles
        self.stdout.write("\n4. Seeding Patient Population...")
        patient_profiles = []
        for pat_data in PATIENTS:
            user, created = User.objects.get_or_create(
                email=pat_data["email"],
                defaults={
                    "first_name": pat_data["first_name"],
                    "last_name": pat_data["last_name"],
                    "role": User.Role.PATIENT,
                },
            )
            if created:
                user.set_password(pat_data["password"])
                user.save()

            profile, _ = PatientProfile.objects.get_or_create(
                user=user,
                defaults={
                    "dob": datetime.date.fromisoformat(pat_data["dob"]),
                    "phone": pat_data["phone"],
                    "address": pat_data["address"],
                    "blood_group": pat_data["blood_group"],
                },
            )
            patient_profiles.append(profile)
            self.stdout.write(f"  [OK] {user.get_full_name()} ({pat_data['email']}) - Blood: {pat_data['blood_group']}")

        # 5. Optional reset of mock appointments
        if options.get("reset_appointments"):
            self.stdout.write("\nClearing existing appointments, medical records, and payments...")
            MedicalRecord.objects.all().delete()
            Payment.objects.all().delete()
            Appointment.objects.all().delete()
            Notification.objects.all().delete()
            self.stdout.write("  [OK] Previous appointment data cleared.")

        # 6. Generate 15 Days of Realistic Outpatient Token Data
        self.stdout.write("\n5. Generating 15 Days of Realistic OPD Consultation & Token Records...")

        # Verified active doctors only for appointments
        active_doctors = [d for d in doctor_profiles if d.is_verified]

        # Time offsets for 10-minute token slots
        TEN_MIN_INTERVALS = [
            datetime.time(9, 0),
            datetime.time(9, 10),
            datetime.time(9, 20),
            datetime.time(9, 30),
            datetime.time(9, 40),
            datetime.time(9, 50),
            datetime.time(10, 0),
            datetime.time(10, 10),
            datetime.time(10, 20),
            datetime.time(10, 30),
            datetime.time(10, 40),
            datetime.time(11, 0),
            datetime.time(11, 10),
            datetime.time(11, 20),
            datetime.time(11, 30),
            datetime.time(14, 0),
            datetime.time(14, 10),
            datetime.time(14, 20),
            datetime.time(14, 30),
            datetime.time(14, 40),
            datetime.time(15, 0),
            datetime.time(15, 10),
            datetime.time(15, 20),
        ]

        PAYMENT_METHODS = [
            (Payment.Method.UPI, "UPI / QR Code"),
            (Payment.Method.CARD, "Credit / Debit Card"),
            (Payment.Method.NETBANKING, "Net Banking"),
        ]

        created_appts_count = 0
        created_records_count = 0
        created_payments_count = 0

        # Build schedule from 15 days ago up to 3 days in future
        # Days -15 to -1 : Past consultations
        # Day 0          : Today's active clinic queue
        # Days +1 to +3  : Upcoming booked tokens
        for day_offset in range(-15, 4):
            target_date = today + datetime.timedelta(days=day_offset)
            target_weekday = target_date.weekday()

            # Find all availability slots matching this weekday across verified doctors
            day_slots = list(
                AvailabilitySlot.objects.filter(
                    doctor__in=active_doctors,
                    day_of_week=target_weekday,
                    is_active=True,
                ).select_related("doctor__user", "doctor__specialty")
            )

            if not day_slots:
                continue

            # Determine number of tokens for this day (realistic OPD volume: 3 - 6 appointments per day)
            num_tokens = 4 if target_weekday == 5 else (5 if day_offset < 0 else 4)

            # Cycle through patients
            for token_idx in range(num_tokens):
                slot = day_slots[(token_idx + abs(day_offset)) % len(day_slots)]
                doc = slot.doctor
                spec_name = doc.specialty.name if doc.specialty else "General Medicine"

                patient = patient_profiles[(token_idx * 3 + abs(day_offset)) % len(patient_profiles)]

                # Pick an appointment time that falls inside the slot
                valid_times = [
                    t for t in TEN_MIN_INTERVALS
                    if slot.start_time <= t < slot.end_time
                ]
                if not valid_times:
                    valid_times = [slot.start_time]

                chosen_time = valid_times[token_idx % len(valid_times)]

                # Determine status and clinical outcome based on timeframe
                if day_offset < 0:
                    # Past days: mostly COMPLETED, a few CANCELLED, and an occasional EXPIRED
                    if day_offset in (-3, -8) and token_idx == 0:
                        # Cancelled with 50% refund pending (for Admin Dashboard refund review!)
                        status = Appointment.Status.CANCELLED
                        pay_status = Appointment.PaymentStatus.REFUND_PENDING
                        is_completed = False
                    elif day_offset == -5 and token_idx == 1:
                        # Cancelled with refund already processed
                        status = Appointment.Status.CANCELLED
                        pay_status = Appointment.PaymentStatus.REFUNDED
                        is_completed = False
                    elif day_offset == -11 and token_idx == 2:
                        # Patient no-show / expired
                        status = Appointment.Status.EXPIRED
                        pay_status = Appointment.PaymentStatus.PAID
                        is_completed = False
                    else:
                        status = Appointment.Status.COMPLETED
                        pay_status = Appointment.PaymentStatus.PAID
                        is_completed = True
                elif day_offset == 0:
                    # Today: Morning tokens completed, afternoon tokens confirmed and queued
                    if chosen_time < datetime.time(11, 0):
                        status = Appointment.Status.COMPLETED
                        pay_status = Appointment.PaymentStatus.PAID
                        is_completed = True
                    else:
                        status = Appointment.Status.CONFIRMED
                        pay_status = Appointment.PaymentStatus.PAID
                        is_completed = False
                else:
                    # Upcoming days: Confirmed & Paid or Pending
                    status = Appointment.Status.CONFIRMED
                    pay_status = Appointment.PaymentStatus.PAID if token_idx % 2 == 0 else Appointment.PaymentStatus.UNPAID
                    is_completed = False

                # Select realistic clinical case template
                cases_for_spec = CLINICAL_CASES.get(spec_name, CLINICAL_CASES["General Medicine"])
                case = cases_for_spec[token_idx % len(cases_for_spec)]

                # Create or fetch Appointment
                appt, created = Appointment.objects.get_or_create(
                    slot=slot,
                    date=target_date,
                    appointment_time=chosen_time,
                    defaults={
                        "patient": patient,
                        "status": status,
                        "payment_status": pay_status,
                        "reason": case["reason"],
                        "reminder_sent": day_offset <= 0,
                    },
                )

                if created:
                    created_appts_count += 1
                else:
                    # Update status for live demonstration if existing
                    appt.status = status
                    appt.payment_status = pay_status
                    appt.save(update_fields=["status", "payment_status"])

                # Create Payment if appointment was paid / refund processed
                if pay_status in (
                    Appointment.PaymentStatus.PAID,
                    Appointment.PaymentStatus.REFUND_PENDING,
                    Appointment.PaymentStatus.REFUNDED,
                ):
                    method_choice, _ = PAYMENT_METHODS[token_idx % len(PAYMENT_METHODS)]
                    txn_id = f"TXN-{target_date.strftime('%Y%m%d')}-{appt.id.hex[:8].upper()}"

                    is_ref_pending = pay_status == Appointment.PaymentStatus.REFUND_PENDING
                    is_refunded = pay_status == Appointment.PaymentStatus.REFUNDED

                    refund_amt = round(doc.fee * Decimal("0.50"), 2) if (is_ref_pending or is_refunded) else Decimal("0.00")
                    refund_txn = f"REF-{target_date.strftime('%Y%m%d')}-{appt.id.hex[:6].upper()}" if is_refunded else ""

                    pay_state = Payment.Status.COMPLETED
                    if is_ref_pending:
                        pay_state = Payment.Status.REFUND_PENDING
                    elif is_refunded:
                        pay_state = Payment.Status.REFUNDED

                    _, p_created = Payment.objects.get_or_create(
                        appointment=appt,
                        defaults={
                            "patient": patient,
                            "doctor": doc,
                            "amount": doc.fee,
                            "currency": "INR",
                            "payment_method": method_choice,
                            "transaction_id": txn_id,
                            "status": pay_state,
                            "card_last4": "4242" if method_choice == Payment.Method.CARD else "",
                            "card_brand": "Visa" if method_choice == Payment.Method.CARD else "",
                            "upi_id": f"{patient.user.first_name.lower()}@okhdfc" if method_choice == Payment.Method.UPI else "",
                            "refund_amount": refund_amt,
                            "refund_transaction_id": refund_txn,
                            "refunded_at": datetime.datetime.now(datetime.timezone.utc) if is_refunded else None,
                        },
                    )
                    if p_created:
                        created_payments_count += 1

                # Create Medical Record if Completed
                if is_completed:
                    _, m_created = MedicalRecord.objects.get_or_create(
                        appointment=appt,
                        defaults={
                            "created_by": doc,
                            "diagnosis": case["diagnosis"],
                            "prescription": case["prescription"],
                            "notes": case["notes"],
                        },
                    )
                    if m_created:
                        created_records_count += 1

                # Seed Notifications for today & recent activity
                if day_offset == 0:
                    Notification.objects.get_or_create(
                        user=patient.user,
                        title=f"OPD Token Queue: #{token_idx + 1:02d}",
                        defaults={
                            "message": (
                                f"Your token for Dr. {doc.user.get_full_name()} ({spec_name}) is confirmed for today at "
                                f"{chosen_time.strftime('%I:%M %p')}. Please present at OPD Desk 2 on Arrival."
                            ),
                            "is_read": False,
                        },
                    )
                elif day_offset == -3 and pay_status == Appointment.PaymentStatus.REFUND_PENDING:
                    # Notify Admin of pending refund
                    Notification.objects.get_or_create(
                        user=admin_user,
                        title="Action Required: 50% Refund Approval",
                        defaults={
                            "message": (
                                f"Patient {patient.user.get_full_name()} cancelled paid token with Dr. {doc.user.get_full_name()}. "
                                f"Eligible for 50% refund (₹{doc.fee * Decimal('0.50')} of ₹{doc.fee}). Awaiting review."
                            ),
                            "is_read": False,
                        },
                    )

        # 7. Seed Broadcast Announcements
        self.stdout.write("\n6. Seeding Hospital Broadcast Bulletins...")
        Notification.objects.get_or_create(
            user=admin_user,
            title="OPD Digital Token Display Active",
            defaults={
                "message": "All 10-minute token slots across Cardiology, Pediatrics, Dermatology, and Orthopedics are synchronized with the central display.",
                "is_read": True,
            },
        )

        for pat in patient_profiles[:3]:
            Notification.objects.get_or_create(
                user=pat.user,
                title="CityCare OPD: 10-Minute Consultation Guidelines",
                defaults={
                    "message": "Please arrive 10 minutes prior to your allocated token window to complete pre-consultation vitals check at the nursing station.",
                    "is_read": False,
                },
            )

        # 8. Print Executive Summary
        total_revenue = sum(p.amount for p in Payment.objects.filter(status=Payment.Status.COMPLETED))
        self.stdout.write(self.style.SUCCESS(
            f"\n=== Hospital Seed Complete ===\n"
            f"  Specialties      : {Specialty.objects.count()}\n"
            f"  Doctors          : {DoctorProfile.objects.count()} (Verified: {DoctorProfile.objects.filter(is_verified=True).count()}, Pending: {DoctorProfile.objects.filter(is_verified=False).count()})\n"
            f"  Patients         : {PatientProfile.objects.count()}\n"
            f"  Availability Slots: {AvailabilitySlot.objects.count()}\n"
            f"  Total Appointments: {Appointment.objects.count()} (New: {created_appts_count})\n"
            f"  - Completed      : {Appointment.objects.filter(status='COMPLETED').count()}\n"
            f"  - Confirmed (Live): {Appointment.objects.filter(status='CONFIRMED').count()}\n"
            f"  - Pending Refunds: {Appointment.objects.filter(payment_status='REFUND_PENDING').count()}\n"
            f"  Medical Records  : {MedicalRecord.objects.count()} (New: {created_records_count})\n"
            f"  Payment Records  : {Payment.objects.count()} (New: {created_payments_count})\n"
            f"  Total OPD Revenue: ₹{total_revenue:,.2f}\n"
            f"  Notifications    : {Notification.objects.count()}\n"
        ))
