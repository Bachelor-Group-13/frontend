"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/hooks/useProfile";
import ProfileCard from "@/components/profile/ProfileCard";
import VehicleSettings from "@/components/profile/VehicleSettings";
import ContactSettings from "@/components/profile/ContactSettings";
import SecuritySettings from "@/components/profile/SecuritySettings";
import { SuccessDialog } from "@/components/profile/dialogs/SuccessDialog";
import { ErrorDialog } from "@/components/profile/dialogs/ErrorDialog";
import { PasswordMismatchDialog } from "@/components/profile/dialogs/PasswordMismatchDialog";

/**
 * The profile page component that displays and manages user profile settings.
 *
 * @returns The profile page layout with all its components
 */
export default function ProfilePage() {
  const router = useRouter();
  const {
    formData,
    uiState,
    setUiState,
    handleFieldChange,
    handlePrimaryLicensePlateChange,
    handleUpdate,
  } = useProfile();

  if (uiState.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200
              border-t-neutral-900"
          />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12 pt-8">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header section  */}
        <div className="mb-8">
          <Link
            href="/garage"
            className="inline-flex items-center rounded-full px-3 py-2 text-gray-700 transition
              hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
            <span className="ml-2 font-medium">Back to Garage</span>
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Profile</h1>
        </div>

        {/* Main profile content */}
        <ProfileCard
          name={formData.name}
          email={formData.userEmail}
          onUpdate={handleUpdate}
          isSubmitting={uiState.isSubmitting}
          licensePlateError={uiState.licensePlateError}
        >
          {/* Vehicle settings section */}
          <VehicleSettings
            primaryLicensePlate={formData.licensePlate}
            onPrimaryLicensePlateChangeAction={handlePrimaryLicensePlateChange}
            secondLicensePlate={formData.secondLicensePlate}
            onSecondLicensePlateChangeAction={(value) =>
              handleFieldChange("secondLicensePlate", value)
            }
            licensePlateError={uiState.licensePlateError}
            showSecondLicensePlate={uiState.showSecondLicensePlate}
            onShowSecondLicensePlateAction={() =>
              setUiState((prev) => ({
                ...prev,
                showSecondLicensePlate: true,
              }))
            }
          />
          {/* Contact settings section */}
          <ContactSettings
            phoneNumber={formData.phoneNumber}
            onPhoneNumberChangeAction={(value) =>
              handleFieldChange("phoneNumber", value)
            }
          />
          {/* Security settings section */}
          <SecuritySettings
            password={formData.password}
            onPasswordChangeAction={(value) =>
              handleFieldChange("password", value)
            }
            confirmPassword={formData.confirmPassword}
            onConfirmPasswordChangeAction={(value) =>
              handleFieldChange("confirmPassword", value)
            }
          />
        </ProfileCard>
      </div>

      {/* Success dialog for profile updates */}
      <SuccessDialog
        open={uiState.showSuccessAlert}
        onOpenChange={(open) =>
          setUiState((prev) => ({ ...prev, showSuccessAlert: open }))
        }
        onSuccess={() => {
          setUiState((prev) => ({ ...prev, showSuccessAlert: false }));
          router.push("/garage");
        }}
      />

      {/* Error dialog for various error states */}
      <ErrorDialog
        open={uiState.showErrorAlert}
        onOpenChange={(open) =>
          setUiState((prev) => ({ ...prev, showErrorAlert: open }))
        }
        message={uiState.errorMessage}
        isFetchError={uiState.errorMessage.includes(
          "Failed to fetch user data"
        )}
        onAction={
          uiState.errorMessage.includes("Failed to fetch user data")
            ? () => router.push("/garage")
            : undefined
        }
      />

      {/* Password mismatch dialog */}
      <PasswordMismatchDialog
        open={uiState.showPasswordMismatchAlert}
        onOpenChange={(open) =>
          setUiState((prev) => ({ ...prev, showPasswordMismatchAlert: open }))
        }
      />
    </div>
  );
}
