import type { ClientListResponse } from "@/features/client/types/responses"
import type { PartnerFormValues } from "../schema"



export const mapPartnerToFormValues = (
  Client: ClientListResponse,
): PartnerFormValues => {
  return {
    FirstName: Client.firstName ?? '',
    SecondName: Client.secondName ?? '',
    ThirdName: Client.thirdName ?? '',
    LastName: Client.lastName ?? '',
    NationalId: Client.nationalId ?? '',
    PhoneNumber: Client.phoneNumber ?? '',
    Address: Client.address ?? '',
    City: Client.city ?? '',
    NationalIdType: Client.nationalIdType,
    OrganizationName: Client.organizationName ?? ''
  }
}