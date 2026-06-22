import type { ClientListResponse, ClientLookupResponse } from "@/features/client/types/responses"
import type { BeneficiaryFormValues } from "../schema"



export const mapBeneficiaryToFormValues = (
  Client: ClientListResponse,
  parentOptions: ClientLookupResponse[] = [],
): BeneficiaryFormValues => {
  const parentClient =
    parentOptions.find(option => option.id === Client.parentClientId) ?? null

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
    ParentClientId: parentClient
    }
}