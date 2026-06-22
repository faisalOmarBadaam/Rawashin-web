import type { ClientListResponse } from '@/features/client/types/responses'
import type { UserFormValues } from '../schema'


export const mapUserToFormValues = (
	client: ClientListResponse,
): UserFormValues => {
	return {
		FirstName: client.firstName ?? '',
		SecondName: client.secondName ?? '',
		ThirdName: client.thirdName ?? '',
		LastName: client.lastName ?? '',
		NationalId: client.nationalId ?? '',
		PhoneNumber: client.phoneNumber ?? '',
		Address: client.address ?? '',
		City: client.city ?? '',
		NationalIdType: client.nationalIdType ?? null,
	}
}
