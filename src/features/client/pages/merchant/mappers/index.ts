import type { ClientListResponse } from "@/features/client/types/responses"
import type { MerchantFormValues } from "../schema"



export const mapMerchantToFormValues = (
  Client: ClientListResponse,
): MerchantFormValues => {
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