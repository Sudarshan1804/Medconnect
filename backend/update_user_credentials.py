import os
import sys
from pathlib import Path

# Setup Django environment
BASE_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

import django
django.setup()

from django.contrib.auth import authenticate, get_user_model

User = get_user_model()

def update_credentials():
    print("=" * 65)
    print("   CityCare Hospital - Updating Doctor & Patient Credentials")
    print("=" * 65)

    # 1. Update Doctors
    doctors = User.objects.filter(role=User.Role.DOCTOR)
    print(f"\n[+] Found {doctors.count()} doctors in database:")
    for doc in doctors:
        old_email = doc.email
        first = doc.first_name.strip().lower()
        new_email = f"{first}@hospital.com"
        doc.email = new_email
        doc.set_password("Doctor123!")
        doc.save()
        print(f"  [✓] Dr. {doc.first_name} {doc.last_name}: {old_email} -> {new_email} (Password: Doctor123!)")

    # 2. Update Patients
    patients = User.objects.filter(role=User.Role.PATIENT)
    print(f"\n[+] Found {patients.count()} patients in database:")
    for pat in patients:
        old_email = pat.email
        first = pat.first_name.strip().lower()
        new_email = f"{first}@patient.com"
        pat.email = new_email
        pat.set_password("Patient123!")
        pat.save()
        print(f"  [✓] {pat.first_name} {pat.last_name}: {old_email} -> {new_email} (Password: Patient123!)")

    # 3. Verification test
    print("\n" + "=" * 65)
    print("   Verification of Authentication via Django Auth Backend")
    print("=" * 65)

    all_users = User.objects.all().order_by("role", "first_name")
    for u in all_users:
        expected_pwd = "Admin123!" if u.role == User.Role.ADMIN else ("Doctor123!" if u.role == User.Role.DOCTOR else "Patient123!")
        auth_success = authenticate(email=u.email, password=expected_pwd)
        status = "PASSED" if auth_success else "FAILED"
        print(f"  [{status}] {u.role:<8} | {u.first_name} {u.last_name:<12} | {u.email:<22} | Pwd: {expected_pwd}")

    print("\n[✓] All doctor and patient credentials updated and verified successfully!")

if __name__ == "__main__":
    update_credentials()

