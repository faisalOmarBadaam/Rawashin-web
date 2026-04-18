import ViewEditSubMerchantWrapper from '../ViewEditSubMerchantWrapper'

type Props = {
  params: Promise<{ id: string }>
}

export default async function ViewSubMerchantPage({ params }: Props) {
  const { id } = await params

  return <ViewEditSubMerchantWrapper id={id} mode="view" />
}
